import crypto from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import type { Migration, MigrationRunOptions, RollbackOptions, MigrationReport } from "./types";

import { ensureMigrationsTable, getAppliedMigrations } from "./state";
import { backupDatabase } from "@/scripts/backup-db";
import { assertBackupMayBeSkipped, assertFixturePath, databaseFile } from "../safety";

import { ALL_MIGRATIONS } from "./catalog";
export { ALL_MIGRATIONS } from "./catalog";
export { ensureMigrationsTable, getAppliedMigrations } from "./state";

export function computeMigrationChecksum(m: Migration): string {
  const hash = crypto.createHash("sha256");
  hash.update(`v${m.version}:${m.name}`);
  return hash.digest("hex");
}

export function getTableCounts(db: DatabaseSync): Record<string, number> {
  const counts: Record<string, number> = {};
  const tables = db
    .prepare(
      `
    SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC
  `,
    )
    .all() as { name: string }[];

  for (const t of tables) {
    try {
      const row = db.prepare(`SELECT COUNT(*) as count FROM "${t.name}"`).get() as {
        count: number;
      };
      counts[t.name] = row ? row.count : 0;
    } catch {
      counts[t.name] = -1;
    }
  }
  return counts;
}

function prepareMutation(db: DatabaseSync, skipBackup: boolean | undefined): void {
  const file = databaseFile(db);
  if (process.env.NODE_ENV === "test" && file) assertFixturePath(file);
  if (skipBackup) {
    assertBackupMayBeSkipped(db);
    return;
  }
  if (!file) {
    throw new Error("Database không có file để backup; chỉ fixture test mới được skipBackup.");
  }
  // Pass the actual connection's file, never the process default database.
  // A backup error intentionally aborts before any schema/data mutation.
  backupDatabase({ targetDbFile: file, isPreMigration: true });
}

export function runMigrations(
  db: DatabaseSync,
  options: MigrationRunOptions = {},
): MigrationReport {
  if (
    options.targetVersion !== undefined &&
    (!Number.isInteger(options.targetVersion) || options.targetVersion < 0)
  ) {
    throw new Error("targetVersion phải là số nguyên không âm.");
  }
  const logger = options.logger || (() => {});
  const startTime = Date.now();

  const appliedList = getAppliedMigrations(db);
  const appliedVersionSet = new Set(appliedList.map((m) => m.version));

  let pending = ALL_MIGRATIONS.filter((m) => !appliedVersionSet.has(m.version));
  if (options.targetVersion !== undefined) {
    pending = pending.filter((m) => m.version <= options.targetVersion!);
  }

  const beforeCounts = getTableCounts(db);
  const appliedNames: string[] = [];

  if (pending.length === 0) {
    logger("Cơ sở dữ liệu đã ở trạng thái mới nhất, không có migration mới.");
    return {
      applied: [],
      rolledBack: [],
      currentVersion: appliedList.length > 0 ? appliedList[appliedList.length - 1].version : 0,
      beforeCounts,
      afterCounts: beforeCounts,
      dryRun: Boolean(options.dryRun),
      durationMs: Date.now() - startTime,
    };
  }

  if (!options.dryRun) prepareMutation(db, options.skipBackup);
  else if (process.env.NODE_ENV === "test" && databaseFile(db)) assertFixturePath(databaseFile(db));

  if (options.dryRun) {
    logger(`[DRY-RUN] Bắt đầu kiểm thử ${pending.length} migration(s)...`);
    // Dry run runs inside a single outer transaction and then rolls back
    db.exec("BEGIN TRANSACTION;");
    let dryRunCounts: Record<string, number> = {};
    try {
      ensureMigrationsTable(db);
      for (const m of pending) {
        logger(`[DRY-RUN] Đang chạy kiểm thử: v${m.version} - ${m.name}`);
        m.up(db);
        appliedNames.push(`v${m.version} (${m.name})`);
      }
      dryRunCounts = getTableCounts(db);
    } finally {
      db.exec("ROLLBACK;");
      logger("[DRY-RUN] Hoàn tất mô phỏng, đã ROLLBACK toàn bộ thay đổi. Database giữ nguyên.");
    }

    return {
      applied: appliedNames,
      rolledBack: [],
      currentVersion: appliedList.length > 0 ? appliedList[appliedList.length - 1].version : 0,
      beforeCounts,
      afterCounts: dryRunCounts,
      dryRun: true,
      durationMs: Date.now() - startTime,
    };
  }

  // Real execution: each migration runs in its own atomic transaction
  for (const m of pending) {
    const stepStart = Date.now();
    logger(`Bắt đầu thực thi migration: v${m.version} - ${m.name}`);
    db.exec("BEGIN TRANSACTION;");
    try {
      ensureMigrationsTable(db);
      m.up(db);
      const executionTimeMs = Date.now() - stepStart;
      const checksum = computeMigrationChecksum(m);
      const now = new Date().toISOString();

      db.prepare(
        `
        INSERT INTO schema_migrations (version, name, applied_at, checksum, execution_time_ms)
        VALUES (?, ?, ?, ?, ?)
      `,
      ).run(m.version, m.name, now, checksum, executionTimeMs);

      db.exec("COMMIT;");
      appliedNames.push(`v${m.version} (${m.name})`);
      logger(`✓ Hoàn thành v${m.version} - ${m.name} (${executionTimeMs}ms)`);
    } catch (err) {
      db.exec("ROLLBACK;");
      logger(
        `✗ Thất bại tại migration v${m.version} (${m.name}). Đã ROLLBACK transaction an toàn.`,
      );
      throw err;
    }
  }

  const afterCounts = getTableCounts(db);
  const updatedApplied = getAppliedMigrations(db);
  const currentVersion =
    updatedApplied.length > 0 ? updatedApplied[updatedApplied.length - 1].version : 0;

  return {
    applied: appliedNames,
    rolledBack: [],
    currentVersion,
    beforeCounts,
    afterCounts,
    dryRun: false,
    durationMs: Date.now() - startTime,
  };
}

export function rollbackMigration(
  db: DatabaseSync,
  options: RollbackOptions = {},
): MigrationReport {
  if (
    options.targetVersion !== undefined &&
    (!Number.isInteger(options.targetVersion) || options.targetVersion < 0)
  ) {
    throw new Error("targetVersion phải là số nguyên không âm.");
  }
  if (options.steps !== undefined && (!Number.isInteger(options.steps) || options.steps < 1)) {
    throw new Error("steps phải là số nguyên dương.");
  }
  const logger = options.logger || (() => {});
  const startTime = Date.now();

  const appliedList = getAppliedMigrations(db);
  if (appliedList.length === 0) {
    logger("Không có migration nào để khôi phục (rollback).");
    const counts = getTableCounts(db);
    return {
      applied: [],
      rolledBack: [],
      currentVersion: 0,
      beforeCounts: counts,
      afterCounts: counts,
      dryRun: Boolean(options.dryRun),
      durationMs: Date.now() - startTime,
    };
  }

  let targetsToRollback: Migration[] = [];
  const migrationMap = new Map(ALL_MIGRATIONS.map((m) => [m.version, m]));

  if (options.targetVersion !== undefined) {
    // Rollback all migrations with version > targetVersion
    const toRevert = appliedList.filter((a) => a.version > options.targetVersion!).reverse();
    targetsToRollback = toRevert.map((a) => migrationMap.get(a.version)!).filter(Boolean);
  } else {
    // Rollback by steps (default 1)
    const steps = Math.max(1, options.steps || 1);
    const toRevert = appliedList.slice(-steps).reverse();
    targetsToRollback = toRevert.map((a) => migrationMap.get(a.version)!).filter(Boolean);
  }

  const beforeCounts = getTableCounts(db);
  const rolledBackNames: string[] = [];

  if (targetsToRollback.length === 0) {
    logger("Không tìm thấy migration phù hợp để rollback.");
    return {
      applied: [],
      rolledBack: [],
      currentVersion: appliedList[appliedList.length - 1].version,
      beforeCounts,
      afterCounts: beforeCounts,
      dryRun: Boolean(options.dryRun),
      durationMs: Date.now() - startTime,
    };
  }

  if (!options.dryRun) prepareMutation(db, options.skipBackup);
  else if (process.env.NODE_ENV === "test" && databaseFile(db)) assertFixturePath(databaseFile(db));

  if (options.dryRun) {
    logger(`[DRY-RUN] Bắt đầu mô phỏng rollback cho ${targetsToRollback.length} migration(s)...`);
    db.exec("BEGIN TRANSACTION;");
    let dryRunCounts: Record<string, number> = {};
    try {
      for (const m of targetsToRollback) {
        logger(`[DRY-RUN] Đang chạy rollback: v${m.version} - ${m.name}`);
        m.down(db);
        rolledBackNames.push(`v${m.version} (${m.name})`);
      }
      dryRunCounts = getTableCounts(db);
    } finally {
      db.exec("ROLLBACK;");
      logger("[DRY-RUN] Đã hoàn tất mô phỏng rollback, đã ROLLBACK. Database giữ nguyên.");
    }

    return {
      applied: [],
      rolledBack: rolledBackNames,
      currentVersion: appliedList[appliedList.length - 1].version,
      beforeCounts,
      afterCounts: dryRunCounts,
      dryRun: true,
      durationMs: Date.now() - startTime,
    };
  }

  // Real execution
  for (const m of targetsToRollback) {
    logger(`Bắt đầu rollback migration: v${m.version} - ${m.name}`);
    db.exec("BEGIN TRANSACTION;");
    try {
      m.down(db);
      db.prepare("DELETE FROM schema_migrations WHERE version = ?").run(m.version);
      db.exec("COMMIT;");
      rolledBackNames.push(`v${m.version} (${m.name})`);
      logger(`✓ Đã rollback thành công v${m.version} - ${m.name}`);
    } catch (err) {
      db.exec("ROLLBACK;");
      logger(`✗ Thất bại khi rollback v${m.version} (${m.name}). Đã ROLLBACK transaction an toàn.`);
      throw err;
    }
  }

  const afterCounts = getTableCounts(db);
  const updatedApplied = getAppliedMigrations(db);
  const currentVersion =
    updatedApplied.length > 0 ? updatedApplied[updatedApplied.length - 1].version : 0;

  return {
    applied: [],
    rolledBack: rolledBackNames,
    currentVersion,
    beforeCounts,
    afterCounts,
    dryRun: false,
    durationMs: Date.now() - startTime,
  };
}
