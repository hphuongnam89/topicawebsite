// @vitest-environment node
import { afterEach, expect, test, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getDb } from "@/lib/db";

const identity = vi.hoisted(() => ({ role: "admin" as "admin" | "editor" }));
vi.mock("@/lib/auth/guards", () => ({
  requireUser: async () => ({
    user: { id: "fixture-user", name: "Fixture User", role: identity.role },
  }),
}));
import { DELETE, GET } from "@/app/api/admin/media/route";

afterEach(() => {
  getDb().prepare("DELETE FROM settings WHERE key='fixture_media_reference'").run();
  vi.unstubAllEnvs();
  identity.role = "admin";
});

function deleteRequest(name: string, access = "public") {
  return new Request(
    `http://localhost/api/admin/media?name=${encodeURIComponent(name)}&access=${access}`,
    { method: "DELETE", headers: { origin: "http://localhost" } },
  );
}

test("media delete refuses a file referenced by CMS content", async () => {
  const directory = process.env.TOPICA_UPLOAD_DIR!;
  const name = "fixture-referenced.png";
  const filePath = path.join(directory, name);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(filePath, "fixture only");
  getDb()
    .prepare("INSERT INTO settings(key,value,updated_at) VALUES(?,?,?)")
    .run("fixture_media_reference", name, new Date().toISOString());

  const response = await DELETE(deleteRequest(name));
  expect(response.status).toBe(409);
  expect(fs.existsSync(filePath)).toBe(true);
});

test("editors cannot delete private media", async () => {
  identity.role = "editor";
  const privateDirectory = path.join(process.env.TOPICA_BACKUP_DIR!, "private-uploads");
  vi.stubEnv("TOPICA_PRIVATE_UPLOAD_DIR", privateDirectory);
  fs.mkdirSync(privateDirectory, { recursive: true });
  const response = await DELETE(deleteRequest("private-fixture.pdf", "private"));
  expect(response.status).toBe(403);
});

test("media list includes files written by the upload service", async () => {
  const directory = process.env.TOPICA_UPLOAD_DIR!;
  const name = "fixture-listed.png";
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, name), Buffer.from("fixture"));
  const response = await GET();
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.media).toEqual(
    expect.arrayContaining([expect.objectContaining({ name, access: "public" })]),
  );
  fs.rmSync(path.join(directory, name), { force: true });
});
