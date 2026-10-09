import { purgeExpiredAnalytics, purgeExpiredLeads, closeDatabase } from "@/lib/db";

const leadDays = Number(process.env.LEAD_RETENTION_DAYS);
const analyticsDays = Number(process.env.ANALYTICS_RETENTION_DAYS);
const intervalMs = Number(process.env.RETENTION_INTERVAL_MS || 86_400_000);
if (![leadDays, analyticsDays].every((value) => Number.isInteger(value) && value >= 1))
  throw new Error("LEAD_RETENTION_DAYS and ANALYTICS_RETENTION_DAYS must be positive integers");

async function alert(error: unknown) {
  const payload = {
    event: "retention_failed",
    error: error instanceof Error ? error.message : "unknown",
  };
  console.error(JSON.stringify(payload));
  const webhook = process.env.RETENTION_ALERT_WEBHOOK;
  if (webhook)
    await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => undefined);
}

async function runOnce() {
  const startedAt = new Date().toISOString();
  try {
    const leads = await purgeExpiredLeads(leadDays);
    const analytics = await purgeExpiredAnalytics(analyticsDays);
    console.log(
      JSON.stringify({
        event: "retention_succeeded",
        startedAt,
        leadDays,
        analyticsDays,
        leads,
        analytics,
      }),
    );
  } catch (error) {
    await alert(error);
  }
}

await runOnce();
const timer = setInterval(runOnce, intervalMs);
const shutdown = async () => {
  clearInterval(timer);
  await closeDatabase();
  process.exit(0);
};
process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
