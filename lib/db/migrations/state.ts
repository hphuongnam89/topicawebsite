import type { DatabaseSync } from "node:sqlite";
import type { SchemaMigrationRecord } from "@/lib/db/types";

export function ensureMigrationsTable(db: DatabaseSync): void {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL,
    checksum TEXT NOT NULL, execution_time_ms INTEGER NOT NULL
  )`);
}

export function getAppliedMigrations(db: DatabaseSync): SchemaMigrationRecord[] {
  if (
    !db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'schema_migrations'")
      .get()
  )
    return [];
  return db
    .prepare(
      `SELECT version, name, applied_at, checksum, execution_time_ms
    FROM schema_migrations ORDER BY version ASC`,
    )
    .all() as unknown as SchemaMigrationRecord[];
}
