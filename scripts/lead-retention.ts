import { purgeExpiredLeads } from "@/lib/db";
import fs from "node:fs";
async function main() {
  const retentionDays = Number(process.env.LEAD_RETENTION_DAYS);
  if (!Number.isInteger(retentionDays) || retentionDays < 1) {
    throw new Error("Set LEAD_RETENTION_DAYS to a positive integer before running retention.");
  }
  const deleted = await purgeExpiredLeads(retentionDays);
  const audit = { event: "lead_retention", retentionDays, deleted, at: new Date().toISOString() };
  if (process.env.RETENTION_AUDIT_LOG) {
    fs.appendFileSync(process.env.RETENTION_AUDIT_LOG, `${JSON.stringify(audit)}\n`, "utf8");
  }
  console.log(JSON.stringify(audit));
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
