import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { DatabaseSync } from "node:sqlite";

async function main() {
  process.env.DATABASE_SCHEMA = `import_test_${process.pid}`;
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "topica-import-"));
  const sourcePath = path.join(directory, "source.db");
  const source = new DatabaseSync(sourcePath);
  const sql = fs
    .readFileSync("migrations/100_runtime_schema.sql", "utf8")
    .replaceAll("SERIAL PRIMARY KEY", "INTEGER PRIMARY KEY")
    .replaceAll("ADD COLUMN IF NOT EXISTS", "ADD COLUMN");
  source.exec(sql);
  source.exec("PRAGMA foreign_keys = ON");
  const now = new Date().toISOString();
  const { hashPassword, verifyPassword } = await import("../lib/auth/password");
  const passwordHash = hashPassword("source-admin-password");
  source
    .prepare("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run("admin_root", "admin", passwordHash, "Source admin", "admin", 2, now);
  source
    .prepare("INSERT INTO settings VALUES (?, ?, ?)")
    .run("source_setting", '{"preserved":true}', now);
  source
    .prepare("INSERT INTO categories (id, name, slug, created_at) VALUES (?, ?, ?, ?)")
    .run(41, "Source category", "source-category", now);
  source
    .prepare(
      "INSERT INTO articles (id, title, slug, content_html, category_id, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .run(71, "Source article", "source-article", "<p>Source</p>", 41, now, now, now);
  source
    .prepare("INSERT INTO leads (id, fullname, phone, status, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(81, "Source lead", "0912345678", "new", now);
  source
    .prepare(
      "INSERT INTO lead_deliveries (id, lead_id, channel, status, created_at) VALUES (?, ?, ?, ?, ?)",
    )
    .run(82, 81, "telegram", "pending", now);
  source
    .prepare(
      "INSERT INTO pages (id, title, slug, content_html, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .run(101, "Source page", "source-page", "<p>Page</p>", now, now, now);
  source.prepare("INSERT INTO page_views VALUES (?, ?, ?)").run("/lien-he", now.slice(0, 10), 13);
  source
    .prepare(
      "INSERT INTO analytics_events (id, name, properties_json, path, created_at) VALUES (?, ?, ?, ?, ?)",
    )
    .run(111, "page_view", "{}", "/lien-he", now);
  source
    .prepare("INSERT INTO audit_logs (id, action, created_at) VALUES (?, ?, ?)")
    .run(91, "source_audit", now);
  source.close();
  const fingerprint = () =>
    crypto.createHash("sha256").update(fs.readFileSync(sourcePath)).digest("hex");
  const before = fingerprint();
  const api = await import("../lib/db/index");
  const { importSqlite } = await import("./migrate-sqlite-to-postgres");
  const { createArticleFromInput, updateArticleFromInput } =
    await import("../lib/services/articles");
  const db = api.getDb();
  try {
    await api.migrateDatabase(false);
    await db.query(
      "CREATE FUNCTION migration_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'migration failure'; END $$",
    );
    await db.query(
      "CREATE TRIGGER migration_failure BEFORE INSERT ON leads FOR EACH ROW EXECUTE FUNCTION migration_failure()",
    );
    await assert.rejects(importSqlite(sourcePath), /migration failure/);
    assert.equal((await db.query("SELECT COUNT(*)::int AS n FROM users")).rows[0].n, 0);
    assert.equal((await db.query("SELECT COUNT(*)::int AS n FROM articles")).rows[0].n, 0);
    await db.query("DROP TRIGGER migration_failure ON leads");
    const result = await importSqlite(sourcePath);
    assert.equal(result.counts.leads, 1);
    assert.equal(result.counts.lead_deliveries, 1);
    assert.equal(result.counts.users, 1);
    assert.equal(fingerprint(), before);
    await assert.rejects(importSqlite(sourcePath), /not empty/);
    const admin = await api.getUserByUsername("admin");
    assert.equal(admin?.password_hash, passwordHash);
    assert.equal(admin?.session_version, 2);
    assert.equal(verifyPassword("source-admin-password", admin!.password_hash), true);
    assert.deepEqual(await api.getSetting("source_setting", {}), { preserved: true });
    await api.setSetting("source_setting", { updated: true });
    assert.deepEqual(await api.getSetting("source_setting", {}), { updated: true });
    assert.equal((await api.getArticleById(71))?.category_id, 41);
    await api.deleteCategory(41);
    assert.equal((await api.getArticleById(71))?.category_id, null);
    assert.equal((await api.createCategory("New", "new-category")).id, 42);
    const article = await createArticleFromInput(
      { title: "New article", slug: "new-article", content_html: "<p>New</p>" },
      "Admin",
    );
    assert.equal(article.id, 72);
    assert.equal((await updateArticleFromInput(article.id, { title: "Edited" }))?.title, "Edited");
    assert.ok(
      (await api.getArticles({ search: "Edited" })).items.some((row) => row.id === article.id),
    );
    assert.equal(await api.deleteArticle(article.id), true);
    const page = await api.createPage({
      title: "New page",
      slug: "new-page",
      content_html: "<p>New</p>",
    });
    assert.equal(page.id, 102);
    assert.equal((await api.updatePage(page.id, { title: "Edited page" }))?.title, "Edited page");
    assert.equal((await api.getPageBySlug("new-page"))?.id, page.id);
    assert.equal(await api.deletePage(page.id), true);
    await api.createUser({
      id: "new-user",
      username: "new-user",
      name: "New user",
      role: "editor",
      password_hash: passwordHash,
    });
    assert.equal((await api.getUserById("new-user"))?.role, "editor");
    await api.updateUser("new-user", { name: "Updated user" });
    assert.equal(
      (await api.getUsers()).find((user) => user.id === "new-user")?.name,
      "Updated user",
    );
    await api.updateUserPassword("new-user", hashPassword("updated-user-password"));
    assert.equal((await api.getUserById("new-user"))?.session_version, 1);
    assert.equal(await api.deleteUser("new-user"), true);
    await api.recordPageView("/lien-he");
    assert.equal((await api.getAnalyticsStats()).totalViews, 14);
    await api.recordAnalyticsEvent("page_view", {}, "/lien-he", "unique-event-id-12345");
    await api.recordAnalyticsEvent("page_view", {}, "/lien-he", "unique-event-id-12345");
    assert.equal(
      (
        await db.query("SELECT COUNT(*)::int AS n FROM analytics_events WHERE event_id = $1", [
          "unique-event-id-12345",
        ])
      ).rows[0].n,
      1,
    );
    await api.deleteLead(81);
    assert.equal((await db.query("SELECT COUNT(*)::int AS n FROM lead_deliveries")).rows[0].n, 0);
    console.log(
      "PostgreSQL OK: atomic SQLite import/rollback, unchanged source, counts, sequences, admin password/session, all CRUD, FK cascade/SET NULL, analytics idempotency",
    );
  } finally {
    await db.query(`DROP SCHEMA "${process.env.DATABASE_SCHEMA}" CASCADE`);
    await api.closeDatabase();
    fs.rmSync(directory, { recursive: true, force: true });
  }
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
