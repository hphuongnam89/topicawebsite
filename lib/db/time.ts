import { getDb } from "./connection";

// Leases and quotas use one database clock across all application hosts.
export async function databaseNow(): Promise<number> {
  const result = await getDb().query(
    "SELECT (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::bigint AS now",
  );
  return result.rows[0].now;
}
