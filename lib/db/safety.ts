import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";

export function canonicalPath(file: string): string {
  const absolute = path.resolve(file);
  if (fs.existsSync(absolute)) return fs.realpathSync(absolute);
  return path.join(canonicalPath(path.dirname(absolute)), path.basename(absolute));
}

/** Tests may only write into a deliberately named fixture directory in OS temp. */
export function assertFixturePath(file: string): void {
  const relative = path.relative(canonicalPath(os.tmpdir()), canonicalPath(file));
  const fixtureDirectory = relative.split(path.sep)[0];
  if (
    process.env.NODE_ENV !== "test" ||
    path.isAbsolute(relative) ||
    relative.startsWith(`..${path.sep}`) ||
    !fixtureDirectory.startsWith("topica-") ||
    relative === fixtureDirectory
  ) {
    throw new Error(
      "Từ chối test: DB/storage phải nằm trong thư mục fixture topica-* riêng ở OS temp.",
    );
  }
}

export function databaseFile(db: DatabaseSync): string {
  const databases = db.prepare("PRAGMA database_list").all() as { name: string; file: string }[];
  return databases.find((entry) => entry.name === "main")?.file || "";
}

export function assertBackupMayBeSkipped(db: DatabaseSync): void {
  const file = databaseFile(db);
  if (!file && process.env.NODE_ENV === "test") return;
  assertFixturePath(file);
}
