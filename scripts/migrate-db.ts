import { migrateDatabase, closeDatabase } from "@/lib/db";

async function main() {
  try {
    await migrateDatabase();
    console.log(JSON.stringify({ event: "postgres_migration", version: "100_runtime_schema" }));
  } finally {
    await closeDatabase();
  }
}
void main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Migration failed");
  process.exitCode = 1;
});
