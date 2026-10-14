// @vitest-environment node
import { test, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import crypto from "node:crypto";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { backupStorageBundle, restoreStorageBundle } from "@/scripts/storage-bundle";
let root: string, dbFile: string, uploadsDir: string, privateUploadsDir: string, backupDir: string;
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "topica-bundle-"));
  dbFile = path.join(root, "fixture.db");
  uploadsDir = path.join(root, "uploads");
  privateUploadsDir = path.join(root, "private-uploads");
  backupDir = path.join(root, "backups");
  fs.mkdirSync(uploadsDir);
  fs.mkdirSync(privateUploadsDir);
  fs.writeFileSync(path.join(uploadsDir, "fixture.txt"), "Synthetic media fixture");
  fs.writeFileSync(path.join(privateUploadsDir, "private.pdf"), "Synthetic private fixture");
  const db = new DatabaseSync(dbFile);
  db.exec(
    "PRAGMA journal_mode=WAL;CREATE TABLE content(id INTEGER PRIMARY KEY,file TEXT);INSERT INTO content VALUES(1,'fixture.txt');",
  );
  db.close();
});
afterEach(() => {
  vi.restoreAllMocks();
  if (
    root &&
    path.resolve(root).startsWith(path.resolve(os.tmpdir()) + path.sep + "topica-bundle-")
  )
    fs.rmSync(root, { recursive: true, force: true });
});
test("DB and media restore together into a separate instance, retaining source and good backup", () => {
  const bundle = backupStorageBundle({
    dbFile,
    uploadsDir,
    privateUploadsDir,
    backupDir,
    quiesced: true,
  });
  const restored = restoreStorageBundle(bundle.directory, path.join(root, "restored"), {
    dbFile,
    uploadsDir,
    privateUploadsDir,
  });
  expect(restored.integrityVerified).toBe(true);
  expect(restored.mediaFiles).toBe(2);
  const db = new DatabaseSync(restored.targetDbPath, { readOnly: true });
  expect(db.prepare("SELECT file FROM content WHERE id=1").get()?.file).toBe("fixture.txt");
  db.close();
  expect(fs.readFileSync(path.join(restored.uploadsDir, "fixture.txt"), "utf8")).toBe(
    "Synthetic media fixture",
  );
  expect(fs.readFileSync(path.join(restored.privateUploadsDir, "private.pdf"), "utf8")).toBe(
    "Synthetic private fixture",
  );
  expect(fs.existsSync(dbFile)).toBe(true);
  expect(fs.existsSync(path.join(bundle.directory, "bundle.json"))).toBe(true);
  expect(() =>
    restoreStorageBundle(bundle.directory, path.join(root, "restored"), {
      dbFile,
      uploadsDir,
      privateUploadsDir,
    }),
  ).toThrow(/instance mới/);
});
test("legacy public-only bundle restores without exposing private storage", () => {
  const bundle = backupStorageBundle({
    dbFile,
    uploadsDir,
    privateUploadsDir,
    backupDir,
    quiesced: true,
  });
  const legacyDir = path.join(root, "legacy-bundle");
  fs.mkdirSync(path.join(legacyDir, "db"), { recursive: true });
  fs.cpSync(path.join(bundle.directory, "db"), path.join(legacyDir, "db"), { recursive: true });
  fs.mkdirSync(path.join(legacyDir, "media"), { recursive: true });
  fs.copyFileSync(
    path.join(bundle.directory, "media", "public", "fixture.txt"),
    path.join(legacyDir, "media", "fixture.txt"),
  );
  const database = bundle.manifest.database;
  const media = [
    {
      path: "fixture.txt",
      bytes: fs.statSync(path.join(legacyDir, "media", "fixture.txt")).size,
      sha256: crypto
        .createHash("sha256")
        .update(fs.readFileSync(path.join(legacyDir, "media", "fixture.txt")))
        .digest("hex"),
    },
  ];
  fs.writeFileSync(
    path.join(legacyDir, "bundle.json"),
    JSON.stringify({
      version: 1,
      createdAt: new Date().toISOString(),
      database,
      media,
      quiesced: true,
    }),
  );

  const restored = restoreStorageBundle(legacyDir, path.join(root, "legacy-restored"), {
    dbFile,
    uploadsDir,
    privateUploadsDir,
  });
  expect(restored.mediaFiles).toBe(1);
  expect(fs.readFileSync(path.join(restored.uploadsDir, "fixture.txt"), "utf8")).toBe(
    "Synthetic media fixture",
  );
  expect(fs.readdirSync(restored.privateUploadsDir)).toEqual([]);
});
test("missing/corrupt media refuses restore before creating a target", () => {
  const bundle = backupStorageBundle({
    dbFile,
    uploadsDir,
    privateUploadsDir,
    backupDir,
    quiesced: true,
  });
  fs.writeFileSync(
    path.join(bundle.directory, "media", "public", "fixture.txt"),
    "tampered fixture",
  );
  expect(() =>
    restoreStorageBundle(bundle.directory, path.join(root, "restored"), {
      dbFile,
      uploadsDir,
      privateUploadsDir,
    }),
  ).toThrow(/checksum/);
  expect(fs.existsSync(path.join(root, "restored"))).toBe(false);
});
test("mutating media or missing quiescence cannot produce a completed bundle", () => {
  expect(() =>
    backupStorageBundle({ dbFile, uploadsDir, privateUploadsDir, backupDir, quiesced: false }),
  ).toThrow(/Dừng ghi/);
  const copy = fs.copyFileSync.bind(fs);
  vi.spyOn(fs, "copyFileSync").mockImplementation((source, target, flags) => {
    copy(source, target, flags);
    if (String(source).endsWith("fixture.txt"))
      fs.writeFileSync(String(source), "changed during snapshot");
  });
  expect(() =>
    backupStorageBundle({ dbFile, uploadsDir, privateUploadsDir, backupDir, quiesced: true }),
  ).toThrow(/đã thay đổi/);
  expect(fs.readdirSync(backupDir).every((name) => name.endsWith(".partial"))).toBe(true);
});
test("path traversal in bundle manifest fails closed", () => {
  const bundle = backupStorageBundle({
    dbFile,
    uploadsDir,
    privateUploadsDir,
    backupDir,
    quiesced: true,
  });
  fs.writeFileSync(
    path.join(bundle.directory, "bundle.json"),
    JSON.stringify({ ...bundle.manifest, database: "../../fixture.db" }),
  );
  expect(() =>
    restoreStorageBundle(bundle.directory, path.join(root, "restored"), {
      dbFile,
      uploadsDir,
      privateUploadsDir,
    }),
  ).toThrow(/path/);
});
