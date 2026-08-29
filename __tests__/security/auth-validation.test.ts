import crypto from "node:crypto";
import { describe, expect, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { leadApiSchema } from "@/lib/form-schema";
import { articleCreateSchema, leadStatusSchema } from "@/lib/validation/admin";
import { verifySessionToken } from "@/lib/auth/token";
import { POST } from "@/app/api/admin/auth/login/route";

function sessionToken(expiresAt: number, secret: string): string {
  const data = Buffer.from(JSON.stringify({
    user: { id: "1", username: "admin", name: "Admin", role: "admin" },
    expiresAt,
  })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${signature}`;
}

describe("security boundary schemas", () => {
  test("rejects malformed lead input and accepts bounded valid input", () => {
    expect(leadApiSchema.safeParse({ fullname: "A", phone: "bad" }).success).toBe(false);
    expect(leadApiSchema.safeParse({ fullname: "Nguyễn Văn A", phone: "0912345678", email: "a@example.com" }).success).toBe(true);
  });

  test("rejects arbitrary article fields and invalid status payloads", () => {
    expect(articleCreateSchema.safeParse({ title: "T", slug: "t", content_html: "<p>x</p>", unexpected: true }).success).toBe(false);
    expect(leadStatusSchema.safeParse({ id: 1, status: "deleted" }).success).toBe(false);
  });
});

describe("session token verification", () => {
  const secret = "a-secure-test-secret-that-is-long-enough";

  test("accepts a valid token and rejects tampering or expiry", async () => {
    const valid = await verifySessionToken(sessionToken(Date.now() + 60_000, secret), secret);
    expect(valid?.user.role).toBe("admin");
    expect(await verifySessionToken(sessionToken(Date.now() + 60_000, `${secret}!`), secret)).toBeNull();
    expect(await verifySessionToken(sessionToken(Date.now() - 1, secret), secret)).toBeNull();
  });
});

describe("admin login input handling", () => {
  test("returns a 400 response for malformed JSON payloads instead of crashing", async () => {
    const response = await POST(new Request("http://localhost/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{bad-json",
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringMatching(/không hợp lệ|đầy đủ|định dạng/i),
    });
  });
});
