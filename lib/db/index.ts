import "server-only";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { hashPassword } from "@/lib/auth/password";
import type { ArticleRecord, CategoryRecord, LeadRecord, UserRecord } from "./types";

export type { ArticleRecord, CategoryRecord, LeadRecord, UserRecord, PageRecord } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "topica.db");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbInstance: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    // Enable WAL mode for better concurrency
    dbInstance.exec("PRAGMA journal_mode = WAL;");
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: DatabaseSync) {
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

  // 2. Settings table (Key-Value JSON store)
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
      created_at TEXT NOT NULL
    );
  `);

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

  // 7. Page Views table (Analytics)
  db.exec(`
    CREATE TABLE IF NOT EXISTS page_views (
      path TEXT NOT NULL,
      date TEXT NOT NULL,
      views INTEGER DEFAULT 1,
      PRIMARY KEY (path, date)
    );
  `);

  // Provision the first admin explicitly; never ship a known default credential.
  const checkAdmin = db.prepare("SELECT id FROM users WHERE username = ?").get("admin");
  const initialAdminPassword = process.env.ADMIN_INITIAL_PASSWORD;
  if (!checkAdmin && initialAdminPassword) {
    const adminPasswordHash = hashPassword(initialAdminPassword);
    db.prepare(`
      INSERT INTO users (id, username, password_hash, name, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      "admin_root",
      "admin",
      adminPasswordHash,
      "Quản trị viên Topica",
      "admin",
      new Date().toISOString()
    );
  }

  // Seed initial Hero Banner settings if not exists
  const checkHero = db.prepare("SELECT key FROM settings WHERE key = ?").get("homepage_hero");
  if (!checkHero) {
    const defaultHero = {
      badge: "Trực thuộc Trường Đại học Phú Xuân — Thành viên EQuest",
      title: "HỌC CHỦ ĐỘNG —\nKIẾN TẠO TƯƠNG LAI",
      description: "Chương trình đào tạo từ xa chất lượng cao, linh hoạt thời gian, được Bộ GD&ĐT công nhận.",
      bgImage: "https://topicauni.edu.vn/wp-content/uploads/2026/06/gen-h-z7974881374708_9928c332948e9dc73c1de5527deb67d3.jpg",
      ctaPrimaryText: "Đăng ký xét tuyển",
      ctaPrimaryLink: "https://www.tuyensinh.topicauni.edu.vn/",
      ctaSecondaryText: "Xem ngành học",
      ctaSecondaryLink: "/nganh-dao-tao/",
      showLeadForm: true,
    };
    db.prepare(`
      INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
    `).run("homepage_hero", JSON.stringify(defaultHero), new Date().toISOString());
  }

  // Seed default categories
  const checkCats = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
  if (checkCats.count === 0) {
    const defaultCats = [
      { name: "Tin tuyển sinh", slug: "tin-tuyen-sinh", desc: "Thông tin tuyển sinh các ngành đào tạo từ xa" },
      { name: "Tin tức Topica", slug: "tin-tuc-topica", desc: "Tin tức, sự kiện và hoạt động của Topica" },
      { name: "Góc học tập & Hướng nghiệp", slug: "huong-nghiep", desc: "Cẩm nang học tập trực tuyến và cơ hội nghề nghiệp" },
    ];
    for (const cat of defaultCats) {
      db.prepare(`
        INSERT INTO categories (name, slug, description, created_at) VALUES (?, ?, ?, ?)
      `).run(cat.name, cat.slug, cat.desc, new Date().toISOString());
    }
  }
}

// ----------------------------------------------------
// SETTINGS HELPERS
// ----------------------------------------------------
export function getSetting<T>(key: string, defaultValue: T): T {
  try {
    const row = getDb().prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
    if (!row) return defaultValue;
    return JSON.parse(row.value) as T;
  } catch {
    return defaultValue;
  }
}

export function setSetting(key: string, value: unknown): void {
  const db = getDb();
  const valueJson = JSON.stringify(value);
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(key, valueJson, now);
}

// ----------------------------------------------------
// USERS HELPERS
// ----------------------------------------------------
export function getUserByUsername(username: string): UserRecord | null {
  const row = getDb().prepare("SELECT * FROM users WHERE username = ?").get(username) as UserRecord | undefined;
  return row ?? null;
}

export function getUserById(id: string): UserRecord | null {
  const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRecord | undefined;
  return row ?? null;
}

export function getUsers(): Omit<UserRecord, "password_hash">[] {
  const rows = getDb().prepare("SELECT id, username, name, role, created_at FROM users ORDER BY created_at ASC").all() as unknown as Omit<UserRecord, "password_hash">[];
  return rows;
}

export function updateUserPassword(userId: string, newPasswordHash: string): boolean {
  const result = getDb().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(newPasswordHash, userId);
  return result.changes > 0;
}

export function updateUser(userId: string, data: { name?: string; role?: string; password_hash?: string }): boolean {
  const db = getDb();
  let query = "UPDATE users SET ";
  const updates: string[] = [];
  const params: any[] = [];
  
  if (data.name !== undefined) {
    updates.push("name = ?");
    params.push(data.name);
  }
  if (data.role !== undefined) {
    updates.push("role = ?");
    params.push(data.role);
  }
  if (data.password_hash !== undefined) {
    updates.push("password_hash = ?");
    params.push(data.password_hash);
  }

  if (updates.length === 0) return true;

  query += updates.join(", ") + " WHERE id = ?";
  params.push(userId);

  const result = db.prepare(query).run(...params);
  return result.changes > 0;
}

export function createUser(user: Omit<UserRecord, "created_at">): void {
  const now = new Date().toISOString();
  getDb().prepare(`
    INSERT INTO users (id, username, password_hash, name, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(user.id, user.username, user.password_hash, user.name, user.role, now);
}

export function deleteUser(id: string): boolean {
  const result = getDb().prepare("DELETE FROM users WHERE id = ? AND id != 'admin_root'").run(id);
  return result.changes > 0;
}

// ----------------------------------------------------
// CATEGORIES HELPERS
// ----------------------------------------------------
export function getCategories(): CategoryRecord[] {
  const rows = getDb().prepare(`
    SELECT c.*, COUNT(a.id) as article_count
    FROM categories c
    LEFT JOIN articles a ON a.category_id = c.id
    GROUP BY c.id
    ORDER BY c.name ASC
  `).all() as unknown as CategoryRecord[];
  return rows;
}

export function getCategoryById(id: number): CategoryRecord | null {
  const row = getDb().prepare("SELECT * FROM categories WHERE id = ?").get(id) as CategoryRecord | undefined;
  return row ?? null;
}

export function createCategory(name: string, slug: string, description?: string): CategoryRecord {
  const db = getDb();
  const now = new Date().toISOString();
  const result = db.prepare(`
    INSERT INTO categories (name, slug, description, created_at)
    VALUES (?, ?, ?, ?)
  `).run(name, slug, description ?? null, now);

  return {
    id: Number(result.lastInsertRowid),
    name,
    slug,
    description: description ?? null,
    created_at: now,
  };
}

export function deleteCategory(id: number): void {
  getDb().prepare("DELETE FROM categories WHERE id = ?").run(id);
}

// ----------------------------------------------------
// ARTICLES HELPERS
// ----------------------------------------------------
export function getArticles(options: {
  search?: string;
  categoryId?: number;
  status?: string;
  limit?: number;
  offset?: number;
} = {}): { items: ArticleRecord[]; total: number } {
  const db = getDb();
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (options.search) {
    conditions.push("(a.title LIKE ? OR a.excerpt LIKE ?)");
    params.push(`%${options.search}%`, `%${options.search}%`);
  }

  if (options.categoryId) {
    conditions.push("a.category_id = ?");
    params.push(options.categoryId);
  }

  if (options.status) {
    conditions.push("a.status = ?");
    params.push(options.status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const totalRow = db.prepare(`
    SELECT COUNT(*) as count FROM articles a ${whereClause}
  `).get(...params) as { count: number };

  const limit = options.limit ?? 20;
  const offset = options.offset ?? 0;

  const items = db.prepare(`
    SELECT a.*, c.name as category_name, c.slug as category_slug
    FROM articles a
    LEFT JOIN categories c ON c.id = a.category_id
    ${whereClause}
    ORDER BY a.published_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset) as unknown as ArticleRecord[];

  return {
    items,
    total: totalRow.count,
  };
}

export function getArticleById(id: number): ArticleRecord | null {
  const row = getDb().prepare(`
    SELECT a.*, c.name as category_name, c.slug as category_slug
    FROM articles a
    LEFT JOIN categories c ON c.id = a.category_id
    WHERE a.id = ?
  `).get(id) as ArticleRecord | undefined;
  return row ?? null;
}

export function getArticleBySlug(slug: string): ArticleRecord | null {
  const row = getDb().prepare(`
    SELECT a.*, c.name as category_name, c.slug as category_slug
    FROM articles a
    LEFT JOIN categories c ON c.id = a.category_id
    WHERE a.slug = ?
  `).get(slug) as ArticleRecord | undefined;
  return row ?? null;
}

export function createArticle(data: Omit<ArticleRecord, "id" | "created_at" | "updated_at">): ArticleRecord {
  const db = getDb();
  const now = new Date().toISOString();
  const result = db.prepare(`
    INSERT INTO articles (
      title, slug, excerpt, content_html, featured_image,
      category_id, tags, author_name, is_featured, status,
      seo_title, seo_description, published_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.title,
    data.slug,
    data.excerpt ?? null,
    data.content_html,
    data.featured_image ?? null,
    data.category_id ?? null,
    data.tags ?? null,
    data.author_name ?? "Ban Biên Tập Topica",
    data.is_featured ? 1 : 0,
    data.status || "published",
    data.seo_title ?? null,
    data.seo_description ?? null,
    data.published_at || now,
    now,
    now
  );

  return getArticleById(Number(result.lastInsertRowid))!;
}

export function updateArticle(id: number, data: Partial<ArticleRecord>): ArticleRecord | null {
  const db = getDb();
  const existing = getArticleById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE articles SET
      title = COALESCE(?, title),
      slug = COALESCE(?, slug),
      excerpt = COALESCE(?, excerpt),
      content_html = COALESCE(?, content_html),
      featured_image = COALESCE(?, featured_image),
      category_id = COALESCE(?, category_id),
      tags = COALESCE(?, tags),
      author_name = COALESCE(?, author_name),
      is_featured = COALESCE(?, is_featured),
      status = COALESCE(?, status),
      seo_title = COALESCE(?, seo_title),
      seo_description = COALESCE(?, seo_description),
      published_at = COALESCE(?, published_at),
      updated_at = ?
    WHERE id = ?
  `).run(
    data.title ?? null,
    data.slug ?? null,
    data.excerpt ?? null,
    data.content_html ?? null,
    data.featured_image ?? null,
    data.category_id ?? null,
    data.tags ?? null,
    data.author_name ?? null,
    data.is_featured !== undefined ? (data.is_featured ? 1 : 0) : null,
    data.status ?? null,
    data.seo_title ?? null,
    data.seo_description ?? null,
    data.published_at ?? null,
    now,
    id
  );

  return getArticleById(id);
}

export function deleteArticle(id: number): boolean {
  const result = getDb().prepare("DELETE FROM articles WHERE id = ?").run(id);
  return result.changes > 0;
}

// ----------------------------------------------------
// LEADS HELPERS
// ----------------------------------------------------
export function getLeads(options: { search?: string; status?: string; limit?: number; offset?: number } = {}): {
  items: LeadRecord[];
  total: number;
} {
  const db = getDb();
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (options.search) {
    conditions.push("(fullname LIKE ? OR phone LIKE ? OR email LIKE ?)");
    params.push(`%${options.search}%`, `%${options.search}%`, `%${options.search}%`);
  }

  if (options.status && options.status !== "all") {
    conditions.push("status = ?");
    params.push(options.status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const totalRow = db.prepare(`SELECT COUNT(*) as count FROM leads ${whereClause}`).get(...params) as { count: number };
  const limit = options.limit ?? 20;
  const offset = options.offset ?? 0;

  const items = db.prepare(`
    SELECT * FROM leads ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset) as unknown as LeadRecord[];

  return { items, total: totalRow.count };
}

export function createLead(data: { fullname: string; phone: string; email?: string; program?: string; notes?: string }): LeadRecord {
  const db = getDb();
  const now = new Date().toISOString();
  const result = db.prepare(`
    INSERT INTO leads (fullname, phone, email, program, notes, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'new', ?)
  `).run(data.fullname, data.phone, data.email ?? null, data.program ?? null, data.notes ?? null, now);

  return {
    id: Number(result.lastInsertRowid),
    fullname: data.fullname,
    phone: data.phone,
    email: data.email ?? null,
    program: data.program ?? null,
    notes: data.notes ?? null,
    status: "new",
    created_at: now,
  };
}

export function updateLeadStatus(id: number, status: "new" | "contacted" | "consulted" | "cancelled"): boolean {
  const result = getDb().prepare("UPDATE leads SET status = ? WHERE id = ?").run(status, id);
  return result.changes > 0;
}

export function deleteLead(id: number): boolean {
  const result = getDb().prepare("DELETE FROM leads WHERE id = ?").run(id);
  return result.changes > 0;
}
// ----------------------------------------------------
// PAGES HELPERS
// ----------------------------------------------------
export function getPages(): any[] {
  return getDb().prepare('SELECT * FROM pages ORDER BY published_at DESC').all();
}

export function getPageBySlug(slug: string): any | null {
  const row = getDb().prepare('SELECT * FROM pages WHERE slug = ?').get(slug);
  return row ?? null;
}

export function createPage(data: any): any {
  const db = getDb();
  const now = new Date().toISOString();
  try {
    const result = db.prepare(`
      INSERT INTO pages (
        title, slug, excerpt, content_html, featured_image,
        status, seo_title, seo_description, published_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.title, data.slug, data.excerpt ?? null, data.content_html, data.featured_image ?? null,
      data.status || 'published', data.seo_title ?? null, data.seo_description ?? null,
      data.published_at || now, now, now
    );
    return getPageBySlug(data.slug);
  } catch (e) {
    return getPageBySlug(data.slug);
  }
}

export function getPageById(id: number): any | null {
  const row = getDb().prepare('SELECT * FROM pages WHERE id = ?').get(id);
  return row ?? null;
}

export function updatePage(id: number, data: Partial<any>): any | null {
  const db = getDb();
  const existing = getPageById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE pages SET
      title = COALESCE(?, title),
      slug = COALESCE(?, slug),
      excerpt = COALESCE(?, excerpt),
      content_html = COALESCE(?, content_html),
      featured_image = COALESCE(?, featured_image),
      status = COALESCE(?, status),
      seo_title = COALESCE(?, seo_title),
      seo_description = COALESCE(?, seo_description),
      published_at = COALESCE(?, published_at),
      updated_at = ?
    WHERE id = ?
  `).run(
    data.title ?? null,
    data.slug ?? null,
    data.excerpt ?? null,
    data.content_html ?? null,
    data.featured_image ?? null,
    data.status ?? null,
    data.seo_title ?? null,
    data.seo_description ?? null,
    data.published_at ?? null,
    now,
    id
  );

  return getPageById(id);
}

export function deletePage(id: number): boolean {
  const result = getDb().prepare("DELETE FROM pages WHERE id = ?").run(id);
  return result.changes > 0;
}
// ----------------------------------------------------
// ANALYTICS HELPERS
// ----------------------------------------------------
export function recordPageView(path: string): void {
  const db = getDb();
  const date = new Date().toISOString().split('T')[0];
  db.prepare(`
    INSERT INTO page_views (path, date, views)
    VALUES (?, ?, 1)
    ON CONFLICT(path, date) DO UPDATE SET views = views + 1
  `).run(path, date);
}

export function getAnalyticsStats(days: number = 7): { totalViews: number; topPages: {path: string; views: number}[] } {
  const db = getDb();
  const d = new Date();
  d.setDate(d.getDate() - days);
  const cutoffDate = d.toISOString().split('T')[0];
  
  const totalViews = db.prepare(`
    SELECT SUM(views) as total FROM page_views WHERE date >= ?
  `).get(cutoffDate) as { total: number | null };

  const topPages = db.prepare(`
    SELECT path, SUM(views) as views
    FROM page_views
    WHERE date >= ?
    GROUP BY path
    ORDER BY views DESC
    LIMIT 10
  `).all(cutoffDate) as {path: string; views: number}[];

  return {
    totalViews: totalViews?.total || 0,
    topPages,
  };
}
