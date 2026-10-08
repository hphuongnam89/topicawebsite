import { closeDatabase } from "@/lib/db";
// @vitest-environment node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, expect, test, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/guards", () => ({ requireAdmin: vi.fn() }));
import { requireAdmin } from "@/lib/auth/guards";
import { getDb, createLeadWithDelivery } from "@/lib/db";
import { GET, PATCH } from "@/app/api/admin/leads/route";
const directory = fs.mkdtempSync(path.join(os.tmpdir(), "topica-admin-delivery-"));
process.env.DATABASE_SCHEMA = `admin_test_${process.pid}`;
process.env.TOPICA_DATA_DIR = directory;
process.env.ADMIN_INITIAL_PASSWORD = "admin-test-long-password";
afterAll(async () => {
  await getDb().query(`DROP SCHEMA "${process.env.DATABASE_SCHEMA}" CASCADE`);
  await closeDatabase();
  fs.rmSync(directory, { recursive: true, force: true });
});
const request = (body: unknown, origin = "http://localhost") =>
  new Request("http://localhost/api/admin/leads", {
    method: "PATCH",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
test("protects and audits a controlled retry, exposes delivery status, and rejects concurrent retries", async () => {
  const lead = await createLeadWithDelivery({
    fullname: "Test lead",
    phone: "0912345678",
    consent: true,
  });
  const db = getDb();
  await db
    .prepare(
      "UPDATE lead_deliveries SET status = 'failed', attempts = 6, last_error = 'Telegram timeout', next_attempt_at = ? WHERE lead_id = ?",
    )
    .run(new Date(Date.now() + 60000).toISOString(), lead.id);
  vi.mocked(requireAdmin).mockResolvedValue({
    response: new Response(null, { status: 401 }),
  } as Awaited<ReturnType<typeof requireAdmin>>);
  expect((await PATCH(request({ id: lead.id, action: "retry_delivery" }))).status).toBe(401);
  vi.mocked(requireAdmin).mockResolvedValue({
    user: { id: "test-admin", username: "admin", name: "Admin", role: "admin" },
  });
  expect(
    (await PATCH(request({ id: lead.id, action: "retry_delivery" }, "https://evil.test"))).status,
  ).toBe(403);
  expect((await PATCH(request({ id: String(lead.id), action: "retry_delivery" }))).status).toBe(
    422,
  );
  expect(
    (await PATCH(request({ id: lead.id, action: "retry_delivery", extra: true }))).status,
  ).toBe(422);
  expect((await PATCH(request({ id: lead.id, action: "retry_delivery" }))).status).toBe(409);
  const list = await (await GET(new Request("http://localhost/api/admin/leads"))).json();
  expect(list.leads[0]).toMatchObject({
    delivery_status: "failed",
    delivery_attempts: 6,
    delivery_error: "Telegram timeout",
  });
  await db
    .prepare("UPDATE lead_deliveries SET next_attempt_at = NULL WHERE lead_id = ?")
    .run(lead.id);
  const retries = await Promise.all([
    PATCH(request({ id: lead.id, action: "retry_delivery" })),
    PATCH(request({ id: lead.id, action: "retry_delivery" })),
  ]);
  expect(retries.map((response) => response.status).sort()).toEqual([200, 409]);
  expect(
    await db
      .prepare("SELECT status, attempts, manual_retries FROM lead_deliveries WHERE lead_id = ?")
      .get(lead.id),
  ).toMatchObject({ status: "pending", attempts: 0, manual_retries: 1 });
  expect(
    await db
      .prepare(
        "SELECT actor_id, action, target FROM audit_logs WHERE action = 'lead.delivery_retry'",
      )
      .get(),
  ).toMatchObject({
    actor_id: "test-admin",
    action: "lead.delivery_retry",
    target: String(lead.id),
  });
});
