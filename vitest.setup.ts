import "@testing-library/jest-dom";
import { afterAll, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { runMigrations } from "./lib/db/migrations";
import { closeDb } from "./lib/db";

vi.mock("server-only", () => ({}));

// A fresh, empty fixture per test file; never copy the project's database.
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "topica-vitest-"));
const fixtureEnvironment = {
  TOPICA_DB_PATH: path.join(fixtureRoot, "fixture.db"),
  TOPICA_BACKUP_DIR: path.join(fixtureRoot, "backups"),
  TOPICA_UPLOAD_DIR: path.join(fixtureRoot, "uploads"),
  STUB_NOTIFICATIONS: "true",
  TELEGRAM_DISABLED: "true",
  ADMIN_INITIAL_PASSWORD: "",
};
const previousEnvironment = Object.fromEntries(
  Object.keys(fixtureEnvironment).map((key) => [key, process.env[key]]),
);
Object.assign(process.env, fixtureEnvironment);
const fixtureDb = new DatabaseSync(fixtureEnvironment.TOPICA_DB_PATH);
try {
  runMigrations(fixtureDb, { skipBackup: true });
} finally {
  fixtureDb.close();
}
afterAll(() => {
  closeDb();
  for (const [key, value] of Object.entries(previousEnvironment)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
});
