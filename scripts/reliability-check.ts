import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
async function main() {
  const childMode = process.argv[2] === "--child";
  const directory = childMode
    ? process.env.TOPICA_DATA_DIR!
    : fs.mkdtempSync(path.join(os.tmpdir(), "topica-reliability-"));
  process.env.DATABASE_SCHEMA = childMode
    ? process.env.DATABASE_SCHEMA
    : `reliability_${process.pid}`;
  process.env.TOPICA_DATA_DIR = directory;
  process.env.ADMIN_INITIAL_PASSWORD = "reliability-test-password";
  process.env.ADMIN_SESSION_SECRET = "reliability-test-session-secret-at-least-32";
  const dbModule = await import("../lib/db/index");
  const { submitLead, deliverPendingLeadDeliveries } = await import("../lib/services/leads");
  const { consumeRateLimit } = await import("../lib/security/rate-limit");
  const { readJsonBody, BodyTooLargeError, getClientIp, getRateLimitKey } =
    await import("../lib/security/request");
  const { normalizeAnalyticsPath } = await import("../lib/security/analytics-path");
  const db = dbModule.getDb();
  const leadData = { fullname: "Test lead", phone: "0912345678", consent: true as const };
  function mockTelegram() {
    globalThis.fetch = async () => {
      await db.prepare("INSERT INTO test_sends DEFAULT VALUES").run();
      await new Promise((resolve) => setTimeout(resolve, 100));
      return Response.json({ ok: true });
    };
  }
  if (childMode) {
    const operation = process.argv[3];
    if (operation === "limit")
      console.log(
        JSON.stringify(await consumeRateLimit("process-quota", { limit: 3, windowMs: 60000 })),
      );
    if (operation === "submit" || operation === "claim") {
      const result =
        operation === "submit"
          ? (await submitLead(leadData)).id
          : await dbModule.claimLeadDelivery();
      fs.writeFileSync(path.join(directory, `${operation}.json`), JSON.stringify(result));
      process.kill(process.pid, "SIGKILL");
    }
    if (operation === "deliver") {
      mockTelegram();
      console.log(await deliverPendingLeadDeliveries());
    }
    await dbModule.closeDatabase();
  } else {
    async function child(operation: string): Promise<string> {
      return new Promise((resolve, reject) => {
        const processChild = spawn(
          process.execPath,
          [
            "--conditions=react-server",
            "--import",
            "tsx",
            "scripts/reliability-check.ts",
            "--child",
            operation,
          ],
          { env: process.env },
        );
        let stdout = "";
        let stderr = "";
        processChild.stdout.on("data", (chunk) => {
          stdout += chunk;
        });
        processChild.stderr.on("data", (chunk) => {
          stderr += chunk;
        });
        processChild.on("error", reject);
        processChild.on("close", (code, signal) => {
          if (signal === "SIGKILL" && ["submit", "claim"].includes(operation)) {
            resolve(fs.readFileSync(path.join(directory, `${operation}.json`), "utf8"));
          } else if (code === 0) resolve(stdout.trim());
          else reject(new Error(stderr.split("\n").slice(-10).join("\n")));
        });
      });
    }
    const delivery = async (id: number) =>
      (await db.prepare("SELECT * FROM lead_deliveries WHERE lead_id = ?").get(id))!;
    try {
      assert.equal(
        (
          await db.query(
            "SELECT count(*)::int AS n FROM pg_constraint WHERE contype = 'f' AND conrelid = 'lead_deliveries'::regclass",
          )
        ).rows[0].n,
        1,
      );
      await assert.rejects(dbModule.createLeadDelivery(999999), /foreign key/i);
      const disposable = await submitLead(leadData);
      assert.equal((await delivery(disposable.id)).status, "pending");
      await dbModule.deleteLead(disposable.id);
      assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM lead_deliveries").get())!.n, 0);
      // Abort between lead insertion and outbox insertion: both writes must roll back.
      await db.query(
        "CREATE FUNCTION test_outbox_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'simulated crash'; END $$",
      );
      await db.query(
        "CREATE TRIGGER test_outbox_failure BEFORE INSERT ON lead_deliveries FOR EACH ROW EXECUTE FUNCTION test_outbox_failure()",
      );
      await assert.rejects(submitLead(leadData), /simulated crash/);
      assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM leads").get())!.n, 0);
      await db.query("DROP TRIGGER test_outbox_failure ON lead_deliveries");
      const savedId = Number(await child("submit"));
      assert.equal((await delivery(savedId)).status, "pending");
      const quotas = await Promise.all(Array.from({ length: 10 }, () => child("limit")));
      assert.equal(quotas.filter((value) => value === "null").length, 3);
      assert.notEqual(await child("limit"), "null");
      for (let i = 0; i < 300; i++)
        assert.equal(await consumeRateLimit(`client:${i}`, { limit: 1, windowMs: 60000 }), null);
      assert.notEqual(await consumeRateLimit("client:0", { limit: 1, windowMs: 60000 }), null);
      await db.prepare("UPDATE rate_limits SET reset_at = 0 WHERE key = ?").run("client:0");
      assert.equal(await consumeRateLimit("client:0", { limit: 1, windowMs: 60000 }), null);
      delete process.env.TRUSTED_INGRESS;
      const spoofed = new Request("https://example.test", {
        headers: {
          "x-topica-client-ip": "1.2.3.4",
          "x-forwarded-for": "5.6.7.8",
          "cf-connecting-ip": "9.10.11.12",
        },
      });
      assert.equal(getClientIp(spoofed), "unknown");
      const anonymous = getRateLimitKey(spoofed);
      const cookie = anonymous.setCookie!.split(";", 1)[0];
      assert.equal(
        getRateLimitKey(new Request("https://example.test", { headers: { cookie } })).key,
        anonymous.key,
      );
      const tampered = cookie.slice(0, -1) + (cookie.endsWith("0") ? "1" : "0");
      assert.notEqual(
        getRateLimitKey(new Request("https://example.test", { headers: { cookie: tampered } })).key,
        anonymous.key,
      );
      process.env.TRUSTED_INGRESS = "nginx";
      assert.equal(getClientIp(spoofed), "1.2.3.4");
      assert.equal(
        getClientIp(
          new Request("http://localhost", {
            headers: { "x-topica-client-ip": "1.2.3.4, 5.6.7.8" },
          }),
        ),
        "unknown",
      );
      for (let i = 1; i < 100; i++) {
        const identity = getRateLimitKey(
          new Request("https://example.test", { headers: { "x-topica-client-ip": `10.0.0.${i}` } }),
        );
        assert.equal(
          await consumeRateLimit(`event:${identity.key}`, { limit: 240, windowMs: 60000 }),
          null,
        );
      }
      for (const contentLength of [undefined, "1", "99999"]) {
        const body = JSON.stringify({ notes: "ệ".repeat(100) });
        const request = new Request("https://example.test", {
          method: "POST",
          body,
          headers: contentLength ? { "content-length": contentLength } : {},
        });
        await assert.rejects(readJsonBody(request, 150), BodyTooLargeError);
      }
      let cancelled = false;
      const stream = new ReadableStream({
        pull(controller) {
          controller.enqueue(new Uint8Array(100));
        },
        cancel() {
          cancelled = true;
        },
      });
      await assert.rejects(
        readJsonBody(
          new Request("http://localhost", {
            method: "POST",
            body: stream,
            duplex: "half",
          } as RequestInit),
          150,
        ),
        BodyTooLargeError,
      );
      assert.equal(cancelled, true);
      assert.deepEqual(
        await readJsonBody(new Request("http://localhost", { method: "POST", body: '{"x":1}' }), 7),
        { x: 1 },
      );
      await assert.rejects(
        readJsonBody(new Request("http://localhost", { method: "POST", body: "{" }), 7),
        SyntaxError,
      );
      const originalFetch = globalThis.fetch;
      globalThis.fetch = async () => Response.json([]);
      for (const bad of [
        "//evil.test",
        "/%2e%2e/admin",
        "/admin",
        "/api/public/hit",
        "/made-up",
        "/%252e%252e",
        "/foo\\bar",
        "/%00",
      ])
        assert.equal(await normalizeAnalyticsPath(bad), null);
      assert.equal(await normalizeAnalyticsPath("/lien-he/?utm_source=x"), "/lien-he");
      assert.equal(
        await normalizeAnalyticsPath("/quan-tri-kinh-doanh-marketing/"),
        "/quan-tri-kinh-doanh-marketing",
      );
      globalThis.fetch = originalFetch;
      const { POST: leadPost } = await import("../app/api/public/lead/route");
      const { POST: hitPost } = await import("../app/api/public/hit/route");
      const { POST: eventPost } = await import("../app/api/public/event/route");
      for (const post of [leadPost, hitPost, eventPost]) {
        for (const header of [undefined, "1"]) {
          const response = await post(
            new Request("http://localhost", {
              method: "POST",
              body: "a".repeat(33000),
              headers: header ? { "content-length": header } : {},
            }),
          );
          assert.equal(response.status, 413);
        }
      }
      await dbModule.setSetting("site_settings", {
        telegramBotToken: "test-token",
        telegramChatId: "test-chat",
      });
      await db.query("CREATE TABLE test_sends (id SERIAL PRIMARY KEY)");
      await Promise.all([child("deliver"), child("deliver"), child("deliver")]);
      assert.equal((await delivery(savedId)).status, "sent");
      assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM test_sends").get())!.n, 1);
      const crashLead = await submitLead(leadData);
      const staleClaim = JSON.parse(await child("claim"));
      assert.equal((await delivery(crashLead.id)).status, "processing");
      assert.equal(await child("deliver"), "0");
      await db
        .prepare("UPDATE lead_deliveries SET lease_until = ? WHERE lead_id = ?")
        .run("2000-01-01T00:00:00.000Z", crashLead.id);
      await child("deliver");
      assert.equal((await delivery(crashLead.id)).status, "sent");
      assert.equal((await delivery(crashLead.id)).attempts, 2);
      assert.equal(await dbModule.finishLeadDelivery(staleClaim, "stale result"), false);
      const exhaustedCrash = await submitLead(leadData);
      await db
        .prepare("UPDATE lead_deliveries SET attempts = 5 WHERE lead_id = ?")
        .run(exhaustedCrash.id);
      await child("claim");
      await db
        .prepare("UPDATE lead_deliveries SET lease_until = ? WHERE lead_id = ?")
        .run("2000-01-01T00:00:00.000Z", exhaustedCrash.id);
      assert.equal(await child("deliver"), "0");
      assert.equal((await delivery(exhaustedCrash.id)).status, "failed");
      assert.equal((await delivery(exhaustedCrash.id)).attempts, 6);
      const failing = await submitLead(leadData);
      globalThis.fetch = async () => {
        throw new DOMException("test timeout", "TimeoutError");
      };
      for (let attempt = 1; attempt <= 6; attempt++) {
        assert.equal(await deliverPendingLeadDeliveries(), 1);
        const row = await delivery(failing.id);
        assert.equal(row.attempts, attempt);
        assert.equal(row.status, attempt < 6 ? "pending" : "failed");
        assert.equal(row.last_error, "Telegram timeout");
        assert.ok(String(row.next_attempt_at) > new Date().toISOString());
        if (attempt < 6)
          await db
            .prepare("UPDATE lead_deliveries SET next_attempt_at = NULL WHERE lead_id = ?")
            .run(failing.id);
      }
      assert.equal(await deliverPendingLeadDeliveries(), 0);
      assert.equal(await dbModule.retryLeadDelivery(failing.id), false);
      await db
        .prepare("UPDATE lead_deliveries SET next_attempt_at = NULL WHERE lead_id = ?")
        .run(failing.id);
      assert.equal(await dbModule.retryLeadDelivery(failing.id), true);
      assert.equal(await dbModule.retryLeadDelivery(failing.id), false);
      await db
        .prepare(
          "UPDATE lead_deliveries SET status = 'failed', next_attempt_at = NULL, manual_retries = 3 WHERE lead_id = ?",
        )
        .run(failing.id);
      assert.equal(await dbModule.retryLeadDelivery(failing.id), false);
      const adminLead = (await dbModule.getLeads()).items.find(
        (row) => row.id === failing.id,
      )! as unknown as {
        delivery_status: string;
        delivery_error: string;
      };
      assert.equal(adminLead.delivery_status, "failed");
      assert.equal(adminLead.delivery_error, "Telegram timeout");
      // Cookie/header rotation cannot bypass the persisted quota for the same phone.
      delete process.env.TRUSTED_INGRESS;
      for (let i = 0; i < 6; i++) {
        const response = await leadPost(
          new Request("http://localhost/api/public/lead", {
            method: "POST",
            headers: {
              "x-forwarded-for": `10.0.0.${i + 1}`,
              cookie: `topica_rl=${"a".repeat(32)}.${Date.now() + 86400000}.${"0".repeat(64)}`,
            },
            body: JSON.stringify(leadData),
          }),
        );
        assert.equal(response.status, i < 5 ? 200 : 429);
      }
      // Independent real clients retain their analytics quota beyond 60 total hits.
      process.env.TRUSTED_INGRESS = "nginx";
      for (let i = 1; i <= 70; i++) {
        const response = await hitPost(
          new Request("http://localhost/api/public/hit", {
            method: "POST",
            headers: {
              "x-topica-client-ip": `10.1.0.${i}`,
              "x-topica-analytics-consent": "granted",
            },
            body: JSON.stringify({ path: "/lien-he/?campaign=x" }),
          }),
        );
        assert.equal(response.status, 200);
      }
      assert.equal(
        (await db.prepare("SELECT views FROM page_views WHERE path = '/lien-he'").get())!.views,
        70,
      );
      assert.equal(
        (
          await db.query(
            "SELECT count(*)::int AS n FROM lead_deliveries d LEFT JOIN leads l ON l.id = d.lead_id WHERE l.id IS NULL",
          )
        ).rows[0].n,
        0,
      );
      console.log(
        "Reliability OK: foreign keys/cascade, atomic outbox, multi-process quotas/workers, restart/lease recovery, bounded byte reads, spoofed headers/cookies, paths, backoff/dead-letter/retry",
      );
    } finally {
      await db.query(`DROP SCHEMA "${process.env.DATABASE_SCHEMA}" CASCADE`);
      await dbModule.closeDatabase();
      fs.rmSync(directory, { recursive: true, force: true });
    }
  }
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
