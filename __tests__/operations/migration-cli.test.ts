// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

describe("Migration CLI leaves unsafe or read-only actions unchanged", () => {
  let root: string;
  let dbPath: string;
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "topica-migrate-cli-"));
    dbPath = path.join(root, "target.db");
  });
  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));
  function cli(args: string[]) {
    return spawnSync(
      process.execPath,
      ["--conditions=react-server", "--import", "tsx", "scripts/migrate-db.ts", ...args],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        env: {
          ...process.env,
          NODE_ENV: "production",
          TOPICA_DB_PATH: dbPath,
          TOPICA_BACKUP_DIR: path.join(root, "backups"),
          ADMIN_INITIAL_PASSWORD: "",
        },
      },
    );
  }
  test("status on missing DB and rejected production skip never create the target", () => {
    expect(cli(["--status"]).status).toBe(1);
    expect(fs.existsSync(dbPath)).toBe(false);
    expect(cli(["--skip-backup"]).status).toBe(1);
    expect(fs.existsSync(dbPath)).toBe(false);
  });
  test("dry-run on new DB uses memory, then explicit migration creates a backed-up schema", () => {
    const dry = cli(["--dry-run"]);
    expect(dry.stderr).not.toContain("This module cannot be imported");
    expect(dry.status).toBe(0);
    expect(fs.existsSync(dbPath)).toBe(false);
    const migrate = cli([]);
    expect(migrate.status).toBe(0);
    expect(fs.existsSync(dbPath)).toBe(true);
    const before = fs.readFileSync(dbPath);
    expect(cli(["--status"]).status).toBe(0);
    expect(fs.readFileSync(dbPath).equals(before)).toBe(true);
    expect(
      fs.readdirSync(path.join(root, "backups")).filter((name) => name.endsWith(".manifest.json")),
    ).toHaveLength(1);
  });
  test("invalid numeric target is rejected instead of reporting an empty successful migration", () => {
    const result = cli(["--target", "2garbage"]);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("--target");
    expect(fs.existsSync(dbPath)).toBe(false);
  });
});
