import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { getDb, getDbPath } from "@/lib/db";
import { runMigrations } from "@/lib/db/migrations";
import { assertFixturePath } from "@/lib/db/safety";

export function initTestDatabase(): DatabaseSync {
  const file = getDbPath();
  assertFixturePath(file);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const fixture = new DatabaseSync(file);
  try {
    runMigrations(fixture, { skipBackup: true });
  } finally {
    fixture.close();
  }
  return getDb();
}
