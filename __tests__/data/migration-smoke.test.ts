import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

// Mock Database connection and file system for migration smoke test
describe("Migration & Seed Verification Smoke Test", () => {
  it("should have initial migration sql files defined and non-empty", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");

    const migrationFile1 = path.join(process.cwd(), "migrations/001_initial_schema.sql");
    const content1 = await fs.readFile(migrationFile1, "utf8");

    expect(content1.length).toBeGreaterThan(500);
    expect(content1).toContain("CREATE TABLE IF NOT EXISTS content_items");
    expect(content1).toContain("CREATE TABLE IF NOT EXISTS content_revisions");
    expect(content1).toContain("CREATE TABLE IF NOT EXISTS categories");
    expect(content1).toContain("CREATE TABLE IF NOT EXISTS leads");
    expect(content1).toContain("CREATE TABLE IF NOT EXISTS users");
  });

  it("should enforce UUID keys and foreign key constraints in schema", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");

    const migrationFile = path.join(process.cwd(), "migrations/001_initial_schema.sql");
    const sql = await fs.readFile(migrationFile, "utf8");

    expect(sql).toMatch(/id\s+UUID\s+PRIMARY\s+KEY/i);
    expect(sql).toMatch(/REFERENCES\s+content_items\(id\)/i);
    expect(sql).toMatch(/REFERENCES\s+content_revisions\(id\)/i);
  });
});
