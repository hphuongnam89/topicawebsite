// @vitest-environment node
import { afterEach, expect, test, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
vi.mock("@/lib/auth/guards", () => ({
  requireUser: async () => ({
    user: { id: "fixture-admin", name: "Fixture Admin", role: "admin" },
  }),
  requireAdmin: async () => ({
    user: { id: "fixture-admin", name: "Fixture Admin", role: "admin" },
  }),
}));
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
function videoUploadRequest() {
  const form = new FormData();
  const mp4 = Buffer.alloc(16);
  mp4.writeUInt32BE(mp4.length, 0);
  mp4.write("ftyp", 4);
  mp4.write("isom", 8);
  form.append("file", new File([mp4], "../../intro.mp4", { type: "video/mp4" }));
  return new Request("http://localhost/api/admin/upload", {
    method: "POST",
    headers: { origin: "http://localhost" },
    body: form,
  });
}
function privatePdfUploadRequest() {
  const form = new FormData();
  form.append("access", "private");
  form.append(
    "file",
    new File([Buffer.from("%PDF-1.7 fixture")], "policy.pdf", { type: "application/pdf" }),
  );
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
test("video upload accepts a valid MP4 signature and stays in isolated fixture storage", async () => {
  vi.stubEnv("TOPICA_UPLOAD_URL_PREFIX", "/qa-uploads/fixture");
  const response = await POST(videoUploadRequest());
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.url).toMatch(/^\/qa-uploads\/fixture\/\d+-[a-f0-9]+\.mp4$/);
  const file = path.join(process.env.TOPICA_UPLOAD_DIR!, path.basename(body.url));
  expect(fs.existsSync(file)).toBe(true);
  expect(fs.statSync(file).size).toBe(body.size);
});
test("private PDF uploads are stored outside public and produce an authenticated URL", async () => {
  const privateDirectory = path.join(process.env.TOPICA_BACKUP_DIR!, "private-uploads");
  vi.stubEnv("TOPICA_PRIVATE_UPLOAD_DIR", privateDirectory);
  const response = await POST(privatePdfUploadRequest());
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.access).toBe("private");
  expect(body.mimeType).toBe("application/pdf");
  expect(body.url).toMatch(/^\/api\/admin\/private-media\?name=/);
  expect(fs.existsSync(path.join(privateDirectory, body.url.split("name=")[1]))).toBe(true);
});
