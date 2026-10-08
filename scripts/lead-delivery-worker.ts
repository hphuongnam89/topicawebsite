import { setTimeout } from "node:timers/promises";
import { getDb } from "@/lib/db";
import { deliverPendingLeadDeliveries } from "@/lib/services/leads";
async function main() {
  const shutdown = new AbortController();
  process.once("SIGTERM", () => shutdown.abort());
  process.once("SIGINT", () => shutdown.abort());
  const watch = process.argv.includes("--watch");
  do {
    const startedAt = Date.now();
    const processed = await deliverPendingLeadDeliveries(
      Number(process.env.LEAD_DELIVERY_BATCH_SIZE ?? 10),
    );
    const statuses = await getDb()
      .prepare("SELECT status, COUNT(*) AS count FROM lead_deliveries GROUP BY status")
      .all();
    console.log(
      JSON.stringify({
        event: "lead_delivery_worker",
        processed,
        statuses,
        at: new Date().toISOString(),
      }),
    );
    if (watch && !shutdown.signal.aborted) {
      try {
        await setTimeout(Math.max(0, 60000 - (Date.now() - startedAt)), undefined, {
          signal: shutdown.signal,
        });
      } catch (error) {
        if (!shutdown.signal.aborted) throw error;
      }
    }
  } while (watch && !shutdown.signal.aborted);
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
