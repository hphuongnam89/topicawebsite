import "server-only";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { getDb, migrateDatabase, closeDatabase } from "@/lib/db";
import { transaction } from "@/lib/db/connection";

const tables = [
  "users",
  "settings",
  "categories",
  "articles",
  "leads",
  "pages",
  "page_views",
  "analytics_events",
  "audit_logs",
  "lead_deliveries",
  "rate_limits",
];
const serialTables = new Set([
  "categories",
  "articles",
  "leads",
  "pages",
  "analytics_events",
  "audit_logs",
  "lead_deliveries",
]);

export async function importSqlite(sourcePath: string) {
  const source = new DatabaseSync(path.resolve(sourcePath), { readOnly: true });
  const fingerprint = crypto.createHash("sha256");
  source.exec("BEGIN");
  try {
    assert.equal(
      source.prepare("PRAGMA integrity_check").get()?.integrity_check,
      "ok",
      "SQLite integrity check failed",
    );
    assert.equal(
      source.prepare("PRAGMA foreign_key_check").all().length,
      0,
      "SQLite has orphan foreign keys; resolve before migration",
    );
    await migrateDatabase(false);
    const db = getDb();
    return await transaction(async () => {
      await db.query("SELECT pg_advisory_xact_lock(741862902)");
      // A cutover imports into an empty target. Never merge or overwrite existing records.
      for (const table of tables) {
        const result = await db.query(`SELECT COUNT(*)::int AS n FROM "${table}"`);
        assert.equal(result.rows[0].n, 0, `Target table ${table} is not empty`);
      }
      const counts: Record<string, number> = {};
      for (const table of tables) {
        const exists = source
          .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
          .get(table);
        if (!exists) {
          counts[table] = 0;
          continue;
        }
        const columns = (
          source.prepare(`PRAGMA table_info("${table}")`).all() as Array<{ name: string }>
        ).map((column) => column.name);
        const target = await db.query(
          "SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = $1",
          [table],
        );
        const targetColumns = new Set(target.rows.map((row) => row.column_name));
        for (const column of columns)
          assert.ok(targetColumns.has(column), `Unmapped source column ${table}.${column}`);
        const quoted = columns.map((column) => `"${column.replaceAll('"', '""')}"`).join(",");
        const placeholders = columns.map((_, index) => `$${index + 1}`).join(",");
        counts[table] = 0;
        for (const row of source
          .prepare(
            `SELECT * FROM "${table}" ORDER BY ${columns.map((column) => `"${column.replaceAll('"', '""')}"`).join(",")}`,
          )
          .all()) {
          fingerprint.update(JSON.stringify([table, row]));
          await db.query(
            `INSERT INTO "${table}" (${quoted}) VALUES (${placeholders})`,
            columns.map((column) => row[column]),
          );
          counts[table]++;
        }
        assert.equal(
          (await db.query(`SELECT COUNT(*)::int AS n FROM "${table}"`)).rows[0].n,
          counts[table],
        );
        if (serialTables.has(table)) {
          await db.query(
            `SELECT setval(pg_get_serial_sequence($1, 'id'), COALESCE(MAX(id), 1), COUNT(*) > 0) FROM "${table}"`,
            [table],
          );
        }
      }
      const checksum = fingerprint.digest("hex");
      await db.query(
        "INSERT INTO data_imports (source_fingerprint, counts_json, created_at) VALUES ($1, $2, $3)",
        [checksum, JSON.stringify(counts), new Date().toISOString()],
      );
      return { counts, sourceFingerprint: checksum };
    });
  } finally {
    source.exec("ROLLBACK");
    source.close();
  }
}

async function main() {
  const sourcePath = process.argv[2];
  if (!sourcePath) throw new Error("Usage: npm run migrate:sqlite -- /absolute/path/topica.db");
  try {
    console.log(JSON.stringify({ event: "sqlite_import", ...(await importSqlite(sourcePath)) }));
  } finally {
    await closeDatabase();
  }
}
if (
  process.argv[1]?.endsWith("migrate-sqlite-to-postgres.ts") ||
  process.argv[1]?.endsWith("sqlite-migration.mjs")
) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Migration failed");
    process.exitCode = 1;
  });
}
