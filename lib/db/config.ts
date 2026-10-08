import "server-only";
import { Pool, types } from "pg";

types.setTypeParser(20, (value) => Number(value));
let pool: Pool | undefined;
export function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
    const schema = process.env.DATABASE_SCHEMA || "topica_runtime";
    if (!/^[a-z_][a-z0-9_]{0,62}$/.test(schema)) throw new Error("Invalid DATABASE_SCHEMA");
    const max = Number(process.env.DATABASE_POOL_MAX || 10);
    if (!Number.isInteger(max) || max < 1 || max > 100)
      throw new Error("Invalid DATABASE_POOL_MAX");
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      allowExitOnIdle: true,
      options: `-c search_path=${schema}`,
    });
    pool.on("error", () => console.error("PostgreSQL idle connection failed"));
  }
  return pool;
}
export async function closePool(): Promise<void> {
  const current = pool;
  pool = undefined;
  await current?.end();
}
