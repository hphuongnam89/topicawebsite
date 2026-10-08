import { closeDatabase, getDb } from "@/lib/db";
// @vitest-environment node
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll } from "vitest";
import { describe, expect, test, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { leadApiSchema } from "@/lib/form-schema";
import {
  articleCreateSchema,
  leadStatusSchema,
  pageCreateSchema,
  pageUpdateSchema,
} from "@/lib/validation/admin";
import { verifySessionToken } from "@/lib/auth/token";
import { isSameOrigin, getClientIp } from "@/lib/security/request";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { POST } from "@/app/api/admin/auth/login/route";
process.env.TRUSTED_INGRESS = "nginx";
const testDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "topica-auth-"));
process.env.DATABASE_SCHEMA = `auth_test_${process.pid}`;
process.env.TOPICA_DATA_DIR = testDataDir;
process.env.ADMIN_INITIAL_PASSWORD = "test-password-long-enough";
afterAll(async () => {
  await getDb().query(`DROP SCHEMA "${process.env.DATABASE_SCHEMA}" CASCADE`);
  await closeDatabase();
  fs.rmSync(testDataDir, { recursive: true, force: true });
});
function sessionToken(expiresAt: number, secret: string): string {
  const data = Buffer.from(
    JSON.stringify({
      user: { id: "1", username: "admin", name: "Admin", role: "admin" },
      expiresAt,
    }),
  ).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${signature}`;
}
describe("security boundary schemas", () => {
  test("rejects malformed lead input and accepts bounded valid input", () => {
    expect(leadApiSchema.safeParse({ fullname: "A", phone: "bad" }).success).toBe(false);
    expect(leadApiSchema.safeParse({ fullname: "Nguyễn Văn A", phone: "0912345678" }).success).toBe(
      false,
    );
    expect(
      leadApiSchema.safeParse({
        fullname: "Nguyễn Văn A",
        phone: "0912345678",
        email: "a@example.com",
        consent: true,
      }).success,
    ).toBe(true);
  });
  test("rejects arbitrary article fields and invalid status payloads", () => {
    expect(
      articleCreateSchema.safeParse({
        title: "T",
        slug: "t",
        content_html: "<p>x</p>",
        unexpected: true,
      }).success,
    ).toBe(false);
    expect(leadStatusSchema.safeParse({ id: 1, status: "deleted" }).success).toBe(false);
  });
  test("validates page schemas and rejects malformed slugs or extra fields", () => {
    expect(
      pageCreateSchema.safeParse({
        title: "Page",
        slug: "Invalid Slug!",
        content_html: "<p>ok</p>",
      }).success,
    ).toBe(false);
    expect(
      pageCreateSchema.safeParse({
        title: "Page",
        slug: "valid-page-slug",
        content_html: "<p>ok</p>",
        hackerField: 123,
      }).success,
    ).toBe(false);
    expect(
      pageCreateSchema.safeParse({
        title: "Chính sách bảo mật",
        slug: "chinh-sach-bao-mat",
        content_html: "<p>Nội dung</p>",
      }).success,
    ).toBe(true);
    expect(pageUpdateSchema.safeParse({ title: "Cập nhật tiêu đề" }).success).toBe(true);
  });
});
describe("client IP extraction & rate limiting defense", () => {
  test("does not evict live quotas when other clients arrive", async () => {
    expect(await consumeRateLimit("one", { limit: 1, windowMs: 60000 })).toBeNull();
    expect(await consumeRateLimit("two", { limit: 1, windowMs: 60000 })).toBeNull();
    expect(await consumeRateLimit("one", { limit: 1, windowMs: 60000 })).not.toBeNull();
  });
  test("trusts only the ingress-owned header", () => {
    expect(
      getClientIp(
        new Request("http://localhost", {
          headers: {
            "x-topica-client-ip": "1.1.1.1",
            "cf-connecting-ip": "2.2.2.2",
            "x-forwarded-for": "3.3.3.3",
          },
        }),
      ),
    ).toBe("1.1.1.1");
    expect(
      getClientIp(new Request("http://localhost", { headers: { "x-forwarded-for": "3.3.3.3" } })),
    ).toBe("unknown");
  });
});
describe("CSRF origin validation (isSameOrigin)", () => {
  test("uses ingress host and scheme while rejecting a forged origin", () => {
    const previous = process.env.TRUSTED_INGRESS;
    process.env.TRUSTED_INGRESS = "nginx";
    try {
      const headers = {
        host: "localhost:3103",
        "x-forwarded-proto": "http",
        origin: "http://localhost:3103",
      };
      expect(isSameOrigin(new Request("http://web:3000/api/admin/leads", { headers }))).toBe(true);
      expect(
        isSameOrigin(
          new Request("http://web:3000/api/admin/leads", {
            headers: { ...headers, origin: "http://attacker.example" },
          }),
        ),
      ).toBe(false);
      expect(
        isSameOrigin(
          new Request("http://web:3000/api/admin/leads", {
            headers: {
              ...headers,
              host: "topica.edu.vn",
              "x-forwarded-proto": "https",
              origin: "https://topica.edu.vn",
            },
          }),
        ),
      ).toBe(true);
    } finally {
      if (previous === undefined) delete process.env.TRUSTED_INGRESS;
      else process.env.TRUSTED_INGRESS = previous;
    }
  });
  test("allows matching origin or referer and rejects cross-origin requests", () => {
    const validOriginReq = new Request("https://topica.edu.vn/api/admin/pages", {
      headers: { origin: "https://topica.edu.vn" },
    });
    expect(isSameOrigin(validOriginReq)).toBe(true);
    const validRefererReq = new Request("https://topica.edu.vn/api/admin/pages", {
      headers: { referer: "https://topica.edu.vn/admin/pages" },
    });
    expect(isSameOrigin(validRefererReq)).toBe(true);
    const evilOriginReq = new Request("https://topica.edu.vn/api/admin/pages", {
      headers: { origin: "https://attacker.evil" },
    });
    expect(isSameOrigin(evilOriginReq)).toBe(false);
    const evilRefererReq = new Request("https://topica.edu.vn/api/admin/pages", {
      headers: { referer: "https://attacker.evil/phishing" },
    });
    expect(isSameOrigin(evilRefererReq)).toBe(false);
    const noHeaderReq = new Request("https://topica.edu.vn/api/admin/pages");
    expect(isSameOrigin(noHeaderReq)).toBe(false);
  });
});
describe("session token verification", () => {
  const secret = "a-secure-test-secret-that-is-long-enough";
  test("accepts a valid token and rejects tampering or expiry", async () => {
    const valid = await verifySessionToken(sessionToken(Date.now() + 60000, secret), secret);
    expect(valid?.user.role).toBe("admin");
    expect(
      await verifySessionToken(sessionToken(Date.now() + 60000, `${secret}!`), secret),
    ).toBeNull();
    expect(await verifySessionToken(sessionToken(Date.now() - 1, secret), secret)).toBeNull();
  });
});
describe("admin login input handling", () => {
  test("returns a 400 response for malformed JSON payloads instead of crashing", async () => {
    const response = await POST(
      new Request("http://localhost/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{bad-json",
      }),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringMatching(/không hợp lệ|đầy đủ|định dạng/i),
    });
  });
});
describe("admin pages endpoint security", () => {
  test("rejects unauthenticated GET /api/admin/pages with 401", async () => {
    const { GET } = await import("@/app/api/admin/pages/route");
    const response = await GET();
    expect(response.status).toBe(401);
  });
  test("rejects unauthenticated POST /api/admin/pages with 401", async () => {
    const { POST: postPage } = await import("@/app/api/admin/pages/route");
    const response = await postPage(
      new Request("http://localhost/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Test", slug: "test", content_html: "<p>test</p>" }),
      }),
    );
    expect(response.status).toBe(401);
  });
  test("rejects unauthenticated PUT and DELETE /api/admin/pages/[id] with 401", async () => {
    const { PUT, DELETE } = await import("@/app/api/admin/pages/[id]/route");
    const params = Promise.resolve({ id: "1" });
    const putRes = await PUT(
      new Request("http://localhost/api/admin/pages/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Title" }),
      }),
      { params },
    );
    expect(putRes.status).toBe(401);
    const delRes = await DELETE(
      new Request("http://localhost/api/admin/pages/1", {
        method: "DELETE",
      }),
      { params },
    );
    expect(delRes.status).toBe(401);
  });
  test("rejects unauthenticated DELETE /api/admin/media with 401", async () => {
    const { DELETE: deleteMedia } = await import("@/app/api/admin/media/route");
    const response = await deleteMedia(
      new Request("http://localhost/api/admin/media?name=test.jpg", {
        method: "DELETE",
      }),
    );
    expect(response.status).toBe(401);
  });
});
