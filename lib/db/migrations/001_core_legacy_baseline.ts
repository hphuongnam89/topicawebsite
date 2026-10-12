import type { DatabaseSync } from "node:sqlite";
import type { Migration } from "./types";
import { hashPassword } from "@/lib/auth/password";

export const migration001: Migration = {
  version: 1,
  name: "001_core_legacy_baseline",
  up: (db: DatabaseSync) => {
    // 0. Schema migrations table
    db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL,
        checksum TEXT NOT NULL,
        execution_time_ms INTEGER NOT NULL
      );
    `);

    // 1. Users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        created_at TEXT NOT NULL
      );
    `);

    // 2. Settings table
    db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // 3. Categories table
    db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL
      );
    `);

    // 4. Articles table
    db.exec(`
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        excerpt TEXT,
        content_html TEXT NOT NULL,
        featured_image TEXT,
        category_id INTEGER,
        tags TEXT,
        author_name TEXT,
        is_featured INTEGER DEFAULT 0,
        status TEXT DEFAULT 'published',
        seo_title TEXT,
        seo_description TEXT,
        published_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );
    `);

    // 5. Leads table
    db.exec(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullname TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        program TEXT,
        notes TEXT,
        status TEXT DEFAULT 'new',
        created_at TEXT NOT NULL,
        consent INTEGER DEFAULT 1,
        consent_at TEXT,
        consent_version TEXT DEFAULT '2026.1',
        source TEXT,
        idempotency_key TEXT
      );
    `);
    try {
      db.exec(`ALTER TABLE leads ADD COLUMN consent INTEGER DEFAULT 1;`);
    } catch {}
    try {
      db.exec(`ALTER TABLE leads ADD COLUMN consent_at TEXT;`);
    } catch {}
    try {
      db.exec(`ALTER TABLE leads ADD COLUMN consent_version TEXT DEFAULT '2026.1';`);
    } catch {}
    try {
      db.exec(`ALTER TABLE leads ADD COLUMN source TEXT;`);
    } catch {}
    try {
      db.exec(`ALTER TABLE leads ADD COLUMN idempotency_key TEXT;`);
    } catch {}
    try {
      db.exec(`CREATE INDEX IF NOT EXISTS idx_leads_idempotency ON leads(idempotency_key);`);
    } catch {}

    // 6. Pages table
    db.exec(`
      CREATE TABLE IF NOT EXISTS pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        excerpt TEXT,
        content_html TEXT NOT NULL,
        featured_image TEXT,
        status TEXT DEFAULT 'published',
        seo_title TEXT,
        seo_description TEXT,
        published_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // 7. Page views table
    db.exec(`
      CREATE TABLE IF NOT EXISTS page_views (
        path TEXT NOT NULL,
        date TEXT NOT NULL,
        views INTEGER DEFAULT 1,
        PRIMARY KEY (path, date)
      );
    `);

    // Provision an initial admin only when the operator supplies a password.
    // Schema migration never invents a credential or publishes homepage content.
    const initialAdminPassword = process.env.ADMIN_INITIAL_PASSWORD;
    const checkAdmin = db.prepare("SELECT id FROM users WHERE username = ?").get("admin");
    if (!checkAdmin && initialAdminPassword) {
      db.prepare(
        `
        INSERT INTO users (id, username, password_hash, name, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      ).run(
        "admin_root",
        "admin",
        hashPassword(initialAdminPassword),
        "Quản trị viên Topica",
        "admin",
        new Date().toISOString(),
      );
    }
  },
  down: (db: DatabaseSync) => {
    // Drop baseline tables safely on complete rollback
    db.exec(`
      DROP TABLE IF EXISTS page_views;
      DROP TABLE IF EXISTS pages;
      DROP TABLE IF EXISTS leads;
      DROP TABLE IF EXISTS articles;
      DROP TABLE IF EXISTS categories;
      DROP TABLE IF EXISTS settings;
      DROP TABLE IF EXISTS users;
    `);
  },
};
