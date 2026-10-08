import fs from "node:fs";
import { purgeExpiredAnalytics } from "@/lib/db";
async function main() {
  const retentionDays = Number(process.env.ANALYTICS_RETENTION_DAYS);
  if (!Number.isInteger(retentionDays) || retentionDays < 1) {
    throw new Error(
      "Set ANALYTICS_RETENTION_DAYS to a positive integer before running analytics retention.",
    );
  }
  const counts = await purgeExpiredAnalytics(retentionDays);
  const audit = {
    event: "analytics_retention",
    retentionDays,
    ...counts,
    at: new Date().toISOString(),
  };
  if (process.env.RETENTION_AUDIT_LOG)
    fs.appendFileSync(process.env.RETENTION_AUDIT_LOG, `${JSON.stringify(audit)}\n`, "utf8");
  console.log(JSON.stringify(audit));
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
