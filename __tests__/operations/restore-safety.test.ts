// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { backupDatabase, type BackupResult } from "@/scripts/backup-db";
import { restoreDatabase } from "@/scripts/restore-db";

describe("Restore fails before destination mutation for unverified or unsafe snapshots", () => {
  let root: string, active: string, target: string, snapshot: BackupResult;
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "topica-restore-safety-"));
    active = path.join(root, "active.db");
    target = path.join(root, "new-instance", "restored.db");
    const db = new DatabaseSync(active);
    db.exec(
      "CREATE TABLE fixture (id INTEGER PRIMARY KEY, value TEXT); INSERT INTO fixture VALUES (1,'fixture-only');",
    );
    db.close();
    snapshot = backupDatabase({
      targetDbFile: active,
      targetBackupDir: path.join(root, "backups"),
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    fs.rmSync(root, { recursive: true, force: true });
  });
  const badManifests = [
    "missing",
    "json",
    "null",
    "empty",
    "sha",
    "version",
    "size",
    "filename",
    "integrity",
    "tables",
  ];
  test.each(badManifests)("rejects %s manifest with no destination created", (kind) => {
    const manifest = { ...snapshot.manifest };
    if (kind === "missing") fs.unlinkSync(snapshot.manifestFilePath);
    else if (kind === "json") fs.writeFileSync(snapshot.manifestFilePath, "{");
    else if (kind === "null") fs.writeFileSync(snapshot.manifestFilePath, "null");
    else if (kind === "empty") fs.writeFileSync(snapshot.manifestFilePath, "{}");
    else {
      if (kind === "sha") manifest.sha256 = "abc";
      if (kind === "version") manifest.manifestVersion = 99;
      if (kind === "size") manifest.sizeBytes++;
      if (kind === "filename") manifest.backupFile = "another.db";
      if (kind === "integrity") manifest.integrityCheck = "unknown";
      if (kind === "tables") manifest.tables = { fixture: 100 };
      fs.writeFileSync(snapshot.manifestFilePath, JSON.stringify(manifest));
    }
    expect(() =>
      restoreDatabase(snapshot.backupFilePath, { targetPath: target, activeDbPath: active }),
    ).toThrow();
    expect(fs.existsSync(path.dirname(target))).toBe(false);
  });
  test("valid restore creates a readable isolated instance and verify does not change snapshot bytes", () => {
    const before = fs.readFileSync(snapshot.backupFilePath);
    expect(
      restoreDatabase(snapshot.backupFilePath, { verifyOnly: true, activeDbPath: active })
        .sha256Verified,
    ).toBe(true);
    expect(fs.existsSync(target)).toBe(false);
    const result = restoreDatabase(snapshot.backupFilePath, {
      targetPath: target,
      activeDbPath: active,
    });
    expect(result.isIsolatedInstance).toBe(true);
    expect(result.tableCounts).toEqual({ fixture: 1 });
    const db = new DatabaseSync(target, { readOnly: true });
    try {
      expect(db.prepare("SELECT value FROM fixture WHERE id=1").get()).toEqual({
        value: "fixture-only",
      });
    } finally {
      db.close();
    }
    expect(fs.readFileSync(snapshot.backupFilePath)).toEqual(before);
  });
  test("protects active DB, existing targets and force-overwrite flag", () => {
    const before = fs.readFileSync(active);
    expect(() =>
      restoreDatabase(snapshot.backupFilePath, { targetPath: active, activeDbPath: active }),
    ).toThrow(/đang chạy/);
    expect(() =>
      restoreDatabase(snapshot.backupFilePath, {
        targetPath: active,
        activeDbPath: active,
        allowActiveOverwrite: true,
      }),
    ).toThrow(/ghi đè/);
    const alias = path.join(root, "alias.db");
    fs.writeFileSync(alias, "existing-instance-must-survive");
    expect(() =>
      restoreDatabase(snapshot.backupFilePath, { targetPath: alias, activeDbPath: active }),
    ).toThrow(/đã tồn tại/);
    expect(fs.readFileSync(alias, "utf8")).toBe("existing-instance-must-survive");
    expect(fs.readFileSync(active)).toEqual(before);
  });
  test.skipIf(process.platform === "win32" && process.env.TOPICA_TEST_LINKS !== "1")(
    "protects a hardlink alias (Windows requires link permission)",
    () => {
      const alias = path.join(root, "hardlink.db");
      fs.linkSync(active, alias);
      const before = fs.readFileSync(active);
      expect(() =>
        restoreDatabase(snapshot.backupFilePath, { targetPath: alias, activeDbPath: active }),
      ).toThrow(/đã tồn tại/);
      expect(fs.readFileSync(active)).toEqual(before);
    },
  );
  test("rejects unverified WAL sidecar without creating destination", () => {
    fs.writeFileSync(snapshot.backupFilePath + "-wal", "unverified");
    expect(() =>
      restoreDatabase(snapshot.backupFilePath, { targetPath: target, activeDbPath: active }),
    ).toThrow(/WAL/);
    expect(fs.existsSync(target)).toBe(false);
  });
  test("post-copy checksum failure removes only the newly created destination", () => {
    const original = fs.copyFileSync;
    const before = fs.readFileSync(active);
    vi.spyOn(fs, "copyFileSync").mockImplementation((source, destination, mode) => {
      original(source, destination, mode);
      fs.appendFileSync(destination, "changed-during-copy");
    });
    expect(() =>
      restoreDatabase(snapshot.backupFilePath, { targetPath: target, activeDbPath: active }),
    ).toThrow(/Checksum/);
    expect(fs.existsSync(target)).toBe(false);
    expect(fs.readFileSync(active)).toEqual(before);
  });
  test("test mode rejects source or destination outside fixture storage", () => {
    expect(() =>
      restoreDatabase(path.join(process.cwd(), "data", "topica.db"), { verifyOnly: true }),
    ).toThrow(/fixture/);
    expect(() =>
      restoreDatabase(snapshot.backupFilePath, {
        targetPath: path.join(process.cwd(), "data", "unsafe-restore.db"),
      }),
    ).toThrow(/fixture/);
  });
});
