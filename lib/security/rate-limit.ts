import { databaseNow } from "@/lib/db/time";
import { getDb } from "@/lib/db";
export async function consumeRateLimit(
  key: string,
  options: {
    limit: number;
    windowMs: number;
  },
): Promise<number | null> {
  const now = await databaseNow();
  const db = getDb();
  // Expired rows alone may be removed; live quotas must survive new clients and restarts.
  await db.prepare("DELETE FROM rate_limits WHERE reset_at <= ?").run(now);
  const bucket = (await db
    .prepare(
      `INSERT INTO rate_limits(key, count, reset_at) VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET count = CASE WHEN rate_limits.reset_at <= ? THEN 1 ELSE rate_limits.count + 1 END,
      reset_at = CASE WHEN rate_limits.reset_at <= ? THEN excluded.reset_at ELSE rate_limits.reset_at END
    RETURNING count, reset_at`,
    )
    .get(key, now + options.windowMs, now, now)) as {
    count: number;
    reset_at: number;
  };
  return bucket.count > options.limit
    ? Math.max(1, Math.ceil((bucket.reset_at - now) / 1000))
    : null;
}
