import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
import fs from "node:fs/promises";
import path from "node:path";
import type { PoolClient } from "pg";
import { getPool, closePool } from "./config";
import { seedDefaults } from "./seed";

const context = new AsyncLocalStorage<PoolClient>();
let initialized: Promise<void> | undefined;
export class Database {
  constructor(private client?: PoolClient) {}
  async query(sql: string, values: unknown[] = []) {
    if (!this.client) await migrateDatabase();
    return (this.client || context.getStore() || getPool()).query(sql, values);
  }
  // Keep bound statements uniform across the existing CRUD helpers.
  prepare(sql: string) {
    let parameter = 0;
    const statement = sql.replace(/\?/g, () => `$${++parameter}`);
    return {
      get: async (...values: unknown[]) => (await this.query(statement, values)).rows[0],
      all: async (...values: unknown[]) => (await this.query(statement, values)).rows,
      run: async (...values: unknown[]) => {
        const returnsId =
          /^\s*INSERT\s+INTO\s+(categories|articles|leads|lead_deliveries|pages)\b/i.test(
            statement,
          ) && !/\bRETURNING\b/i.test(statement);
        const result = await this.query(
          returnsId ? `${statement.trim().replace(/;$/, "")} RETURNING id` : statement,
          values,
        );
        return { changes: result.rowCount || 0, lastInsertRowid: result.rows[0]?.id };
      },
    };
  }
}
const database = new Database();
export function getDb(): Database {
  return database;
}
export async function migrateDatabase(seed = true): Promise<void> {
  if (!initialized) {
    initialized = (async () => {
      const client = await getPool().connect();
      try {
        await client.query("BEGIN");
        await client.query("SELECT pg_advisory_xact_lock(741862901)");
        const schema = process.env.DATABASE_SCHEMA || "topica_runtime";
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(schema)) {
          throw new Error("DATABASE_SCHEMA must be a valid PostgreSQL identifier");
        }
        await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
        await client.query(`SET LOCAL search_path TO "${schema}"`);
        await client.query(
          "CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TEXT NOT NULL)",
        );
        const existing = await client.query(
          "SELECT version FROM schema_migrations WHERE version = $1",
          ["100_runtime_schema"],
        );
        if (!existing.rowCount) {
          await client.query(
            await fs.readFile(
              path.join(process.cwd(), "migrations/100_runtime_schema.sql"),
              "utf8",
            ),
          );
          await client.query("INSERT INTO schema_migrations VALUES ($1, $2)", [
            "100_runtime_schema",
            new Date().toISOString(),
          ]);
        }
        if (seed) await seedDefaults(new Database(client));
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    })().catch((error) => {
      initialized = undefined;
      throw error;
    });
  }
  await initialized;
}
export async function transaction<T>(work: () => Promise<T>): Promise<T> {
  await migrateDatabase();
  if (context.getStore()) return work();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await context.run(client, work);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
export async function closeDatabase(): Promise<void> {
  initialized = undefined;
  await closePool();
}
