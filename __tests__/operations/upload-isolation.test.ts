// @vitest-environment node
import { afterEach, expect, test, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
vi.mock("@/lib/auth/guards", () => ({ requireUser: async () => ({ user: { role: "admin" } }) }));
import { POST } from "@/app/api/admin/upload/route";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
function uploadRequest() {
  const form = new FormData();
  const image = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aY1sAAAAASUVORK5CYII=",
    "base64",
  );
  form.append("file", new File([image], "../../fixture.png", { type: "image/png" }));
  return new Request("http://localhost/api/admin/upload", {
    method: "POST",
    headers: { origin: "http://localhost" },
    body: form,
  });
}
test("upload writes only to configured fixture storage and returns its public prefix", async () => {
  vi.stubEnv("TOPICA_UPLOAD_URL_PREFIX", "/qa-uploads/fixture");
  const response = await POST(uploadRequest());
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.url).toMatch(/^\/qa-uploads\/fixture\/\d+-[a-f0-9]+\.png$/);
  const file = path.join(process.env.TOPICA_UPLOAD_DIR!, path.basename(body.url));
  expect(fs.existsSync(file)).toBe(true);
  expect(fs.statSync(file).size).toBe(body.size);
});
test("test mode rejects live upload storage before writing a file", async () => {
  vi.stubEnv("TOPICA_UPLOAD_DIR", path.join(process.cwd(), "public", "uploads"));
  vi.spyOn(console, "error").mockImplementation(() => {});
  const response = await POST(uploadRequest());
  expect(response.status).toBe(500);
});
