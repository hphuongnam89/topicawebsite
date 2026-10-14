import { initTestDatabase as initDb } from "@/__tests__/fixtures/database";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { closeDb, getDb } from "@/lib/db";
import {
  ALL_MIGRATIONS,
  getAppliedMigrations,
  rollbackMigration,
  runMigrations,
} from "@/lib/db/migrations";
import { assertFixturePath } from "@/lib/db/safety";
import * as backups from "@/scripts/backup-db";

describe("Migration safety on synthetic databases", () => {
  let root: string;
  let file: string;
  const connections: DatabaseSync[] = [];
  function open(): DatabaseSync {
    const db = new DatabaseSync(file);
    connections.push(db);
    return db;
  }

  beforeEach(() => {
    closeDb();
    root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "topica-migration-safety-")));
    file = path.join(root, "fixture.db");
    vi.stubEnv("TOPICA_DB_PATH", file);
    vi.stubEnv("TOPICA_BACKUP_DIR", path.join(root, "backups"));
    vi.stubEnv("ADMIN_INITIAL_PASSWORD", "");
  });

  afterEach(() => {
    closeDb();
    for (const db of connections.splice(0)) db.close();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    fs.rmSync(root, { recursive: true, force: true });
  });

  test("read does not create a missing database or bootstrap a pending database", () => {
    expect(() => getDb()).toThrow(/db:migrate/);
    expect(fs.existsSync(file)).toBe(false);
    const db = open();
    db.exec("CREATE TABLE sentinel (value TEXT); INSERT INTO sentinel VALUES ('keep');");
    expect(() => getDb()).toThrow(/migration chưa áp dụng/);
    expect(getAppliedMigrations(db)).toEqual([]);
    expect(db.prepare("SELECT name FROM sqlite_master WHERE name = 'users'").get()).toBeUndefined();
    expect(db.prepare("SELECT value FROM sentinel").get()).toEqual({ value: "keep" });
  });

  test("schema bootstrap contains no invented public content or default admin credential", () => {
    const db = initDb();
    for (const table of [
      "users",
      "settings",
      "programs",
      "content_revisions",
      "admission_rounds",
      "tuition_policies",
      "scholarships",
      "documents",
    ]) {
      expect(db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get()).toEqual({ count: 0 });
    }
    expect(getDb()).toBe(db);
  });

  test("failed backup aborts before the migration ledger or schema is created", () => {
    const db = open();
    const failure = new Error("fixture backup EACCES");
    vi.spyOn(backups, "backupDatabase").mockImplementation(() => {
      throw failure;
    });
    expect(() => runMigrations(db)).toThrow(failure);
    expect(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all()).toEqual([]);
  });

  test("backup is taken from the caller connection even when the environment points elsewhere", () => {
    const db = open();
    db.exec("CREATE TABLE sentinel (value TEXT); INSERT INTO sentinel VALUES ('caller-data');");
    vi.stubEnv("TOPICA_DB_PATH", path.join(root, "different.db"));
    const spy = vi.spyOn(backups, "backupDatabase");
    runMigrations(db);
    expect(spy).toHaveBeenCalledWith({ targetDbFile: file, isPreMigration: true });
    const result = spy.mock.results[0].value as backups.BackupResult;
    const restored = new DatabaseSync(result.backupFilePath, { readOnly: true });
    try {
      expect(restored.prepare("SELECT value FROM sentinel").get()).toEqual({
        value: "caller-data",
      });
      expect(getAppliedMigrations(restored)).toEqual([]);
    } finally {
      restored.close();
    }
    expect(fs.existsSync(path.join(root, "different.db"))).toBe(false);
  });

  test("backup failure blocks destructive rollback and preserves both ledger and data", () => {
    const db = open();
    runMigrations(db, { skipBackup: true });
    db.exec("INSERT INTO settings VALUES ('sentinel', '\"keep\"', '2026-10-12');");
    vi.spyOn(backups, "backupDatabase").mockImplementation(() => {
      throw new Error("fixture disk full");
    });
    expect(() => rollbackMigration(db, { targetVersion: 0 })).toThrow("fixture disk full");
    expect(getAppliedMigrations(db)).toHaveLength(ALL_MIGRATIONS.length);
    expect(db.prepare("SELECT value FROM settings WHERE key = 'sentinel'").get()).toEqual({
      value: '"keep"',
    });
  });

  test("dry-run leaves an empty database unchanged, including its ledger", () => {
    const db = open();
    runMigrations(db, { dryRun: true });
    expect(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all()).toEqual([]);
  });

  test("the actual runner rolls back a failed step without retaining its writes", () => {
    const db = open();
    runMigrations(db, { skipBackup: true });
    ALL_MIGRATIONS.push({
      version: 99,
      name: "099_fixture_failure",
      up: (connection) => {
        connection.exec(
          "CREATE TABLE failed_step (value TEXT); INSERT INTO failed_step VALUES ('partial');",
        );
        throw new Error("fixture migration failure");
      },
      down: () => {},
    });
    try {
      expect(() => runMigrations(db, { skipBackup: true })).toThrow("fixture migration failure");
      expect(
        db.prepare("SELECT name FROM sqlite_master WHERE name = 'failed_step'").get(),
      ).toBeUndefined();
      expect(getAppliedMigrations(db)).toHaveLength(ALL_MIGRATIONS.length - 1);
    } finally {
      ALL_MIGRATIONS.pop();
    }
  });

  test("skipBackup is rejected outside test mode before schema mutation", () => {
    const db = open();
    vi.stubEnv("NODE_ENV", "production");
    expect(() => runMigrations(db, { skipBackup: true })).toThrow(/fixture/);
    expect(getAppliedMigrations(db)).toEqual([]);
  });

  test("test guard rejects the project database and path traversal without opening it", () => {
    expect(() => assertFixturePath(path.join(process.cwd(), "data", "topica.db"))).toThrow(
      /fixture/,
    );
    expect(() => assertFixturePath(path.join(root, "..", "outside.db"))).toThrow(/fixture/);
  });

  test("snapshot failure never falls back to copying the main DB or rotates a good backup", () => {
    const db = open();
    db.exec(
      "PRAGMA journal_mode = WAL; CREATE TABLE sentinel (value TEXT); INSERT INTO sentinel VALUES ('committed');",
    );
    const good = backups.backupDatabase({ targetDbFile: file, retentionCount: 1 });
    const originalExec = DatabaseSync.prototype.exec;
    vi.spyOn(DatabaseSync.prototype, "exec").mockImplementation(function (
      this: DatabaseSync,
      sql: string,
    ) {
      if (sql.startsWith("VACUUM INTO")) throw new Error("fixture VACUUM unavailable");
      return originalExec.call(this, sql);
    });
    expect(() => backups.backupDatabase({ targetDbFile: file, retentionCount: 1 })).toThrow(
      /snapshot SQLite nhất quán/,
    );
    expect(fs.existsSync(good.backupFilePath)).toBe(true);
    expect(fs.existsSync(good.manifestFilePath)).toBe(true);
    expect(
      fs.readdirSync(path.dirname(good.backupFilePath)).filter((name) => name.endsWith(".db")),
    ).toHaveLength(1);
  });
});
