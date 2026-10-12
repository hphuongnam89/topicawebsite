import "server-only";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { hashPassword } from "@/lib/auth/password";
import { ALL_MIGRATIONS } from "./migrations/catalog";
import { getAppliedMigrations } from "./migrations/state";
import { assertFixturePath } from "./safety";
import type { ArticleRecord, CategoryRecord, LeadRecord, UserRecord } from "./types";

export type {
  ArticleRecord,
  CategoryRecord,
  LeadRecord,
  UserRecord,
  PageRecord,
  OrganizationRecord,
  ProgramRecord,
  AdmissionRoundRecord,
  TuitionPolicyRecord,
  ScholarshipRecord,
  DocumentRecord,
  ContentRevisionRecord,
  AuditLogRecord,
  AnalyticsEventRecord,
  SchemaMigrationRecord,
} from "./types";

export function getDbPath(): string {
  if (process.env.TOPICA_DB_PATH) {
    return process.env.TOPICA_DB_PATH;
  }
  const dataDir = process.env.TOPICA_DATA_DIR || path.join(process.cwd(), "data");
  return path.join(dataDir, "topica.db");
}

let dbInstance: DatabaseSync | null = null;

export function closeDb(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {
      // ignore
    }
    dbInstance = null;
  }
}

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    const dbPath = getDbPath();
    if (process.env.NODE_ENV === "test") assertFixturePath(dbPath);
    // Persistent runtime data is mounted separately, never bundled into server output.
    if (!fs.existsSync(/* turbopackIgnore: true */ dbPath)) {
      throw new Error(
        "Database chưa được chuẩn bị. Chạy db:migrate có kiểm soát trước khi khởi động.",
      );
    }
    const connection = new DatabaseSync(dbPath);
    try {
      const applied = new Set(
        getAppliedMigrations(connection).map((migration) => migration.version),
      );
      if (ALL_MIGRATIONS.some((migration) => !applied.has(migration.version))) {
        throw new Error(
          "Database còn migration chưa áp dụng. Chạy db:migrate có backup trước khi khởi động.",
        );
      }
      connection.exec("PRAGMA journal_mode = WAL;");
      dbInstance = connection;
    } catch (error) {
      connection.close();
      throw error;
    }
  }
  return dbInstance;
}

// ----------------------------------------------------
// SETTINGS HELPERS
// ----------------------------------------------------
export function getSetting<T>(key: string, defaultValue: T): T {
  try {
    const row = getDb().prepare("SELECT value FROM settings WHERE key = ?").get(key) as
      { value: string } | undefined;
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
  db.prepare(
    `
    INSERT INTO settings (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `,
  ).run(key, valueJson, now);
}

// ----------------------------------------------------
// USERS HELPERS
// ----------------------------------------------------
export function getUserByUsername(username: string): UserRecord | null {
  const row = getDb().prepare("SELECT * FROM users WHERE username = ?").get(username) as
    UserRecord | undefined;
  return row ?? null;
}

export function getUserById(id: string): UserRecord | null {
  const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRecord | undefined;
  return row ?? null;
}

export function getUsers(): Omit<UserRecord, "password_hash">[] {
  const rows = getDb()
    .prepare("SELECT id, username, name, role, created_at FROM users ORDER BY created_at ASC")
    .all() as unknown as Omit<UserRecord, "password_hash">[];
  return rows;
}

export function updateUserPassword(userId: string, newPasswordHash: string): boolean {
  const result = getDb()
    .prepare("UPDATE users SET password_hash = ? WHERE id = ?")
    .run(newPasswordHash, userId);
  return result.changes > 0;
}

export function updateUser(
  userId: string,
  data: { name?: string; role?: string; password_hash?: string },
): boolean {
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
  getDb()
    .prepare(
      `
    INSERT INTO users (id, username, password_hash, name, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
    )
    .run(user.id, user.username, user.password_hash, user.name, user.role, now);
}

export function deleteUser(id: string): boolean {
  const result = getDb().prepare("DELETE FROM users WHERE id = ? AND id != 'admin_root'").run(id);
  return result.changes > 0;
}

// ----------------------------------------------------
// CATEGORIES HELPERS
// ----------------------------------------------------
export function getCategories(): CategoryRecord[] {
  const rows = getDb()
    .prepare(
      `
    SELECT c.*, COUNT(a.id) as article_count
    FROM categories c
    LEFT JOIN articles a ON a.category_id = c.id
    GROUP BY c.id
    ORDER BY c.name ASC
  `,
    )
    .all() as unknown as CategoryRecord[];
  return rows;
}

export function getCategoryById(id: number): CategoryRecord | null {
  const row = getDb().prepare("SELECT * FROM categories WHERE id = ?").get(id) as
    CategoryRecord | undefined;
  return row ?? null;
}

export function createCategory(name: string, slug: string, description?: string): CategoryRecord {
  const db = getDb();
  const now = new Date().toISOString();
  const result = db
    .prepare(
      `
    INSERT INTO categories (name, slug, description, created_at)
    VALUES (?, ?, ?, ?)
  `,
    )
    .run(name, slug, description ?? null, now);

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
export function getArticles(
  options: {
    search?: string;
    categoryId?: number;
    status?: string;
    limit?: number;
    offset?: number;
  } = {},
): { items: ArticleRecord[]; total: number } {
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

  const totalRow = db
    .prepare(
      `
    SELECT COUNT(*) as count FROM articles a ${whereClause}
  `,
    )
    .get(...params) as { count: number };

  const limit = options.limit ?? 20;
  const offset = options.offset ?? 0;

  const items = db
    .prepare(
      `
    SELECT a.*, c.name as category_name, c.slug as category_slug
    FROM articles a
    LEFT JOIN categories c ON c.id = a.category_id
    ${whereClause}
    ORDER BY a.published_at DESC
    LIMIT ? OFFSET ?
  `,
    )
    .all(...params, limit, offset) as unknown as ArticleRecord[];

  return {
    items,
    total: totalRow.count,
  };
}

export function getArticleById(id: number): ArticleRecord | null {
  const row = getDb()
    .prepare(
      `
    SELECT a.*, c.name as category_name, c.slug as category_slug
    FROM articles a
    LEFT JOIN categories c ON c.id = a.category_id
    WHERE a.id = ?
  `,
    )
    .get(id) as ArticleRecord | undefined;
  return row ?? null;
}

export function getArticleBySlug(slug: string): ArticleRecord | null {
  const row = getDb()
    .prepare(
      `
    SELECT a.*, c.name as category_name, c.slug as category_slug
    FROM articles a
    LEFT JOIN categories c ON c.id = a.category_id
    WHERE a.slug = ?
  `,
    )
    .get(slug) as ArticleRecord | undefined;
  return row ?? null;
}

export function createArticle(
  data: Omit<ArticleRecord, "id" | "created_at" | "updated_at">,
): ArticleRecord {
  const db = getDb();
  const now = new Date().toISOString();
  const result = db
    .prepare(
      `
    INSERT INTO articles (
      title, slug, excerpt, content_html, featured_image,
      category_id, tags, author_name, is_featured, status,
      seo_title, seo_description, published_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    )
    .run(
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
      now,
    );

  return getArticleById(Number(result.lastInsertRowid))!;
}

export function updateArticle(id: number, data: Partial<ArticleRecord>): ArticleRecord | null {
  const db = getDb();
  const existing = getArticleById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  db.prepare(
    `
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
  `,
  ).run(
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
    id,
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
export function getLeads(
  options: { search?: string; status?: string; limit?: number; offset?: number } = {},
): {
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

  const totalRow = db
    .prepare(`SELECT COUNT(*) as count FROM leads ${whereClause}`)
    .get(...params) as { count: number };
  const limit = options.limit ?? 20;
  const offset = options.offset ?? 0;

  const items = db
    .prepare(
      `
    SELECT * FROM leads ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `,
    )
    .all(...params, limit, offset) as unknown as LeadRecord[];

  return { items, total: totalRow.count };
}

export interface CreateLeadData {
  fullname: string;
  phone: string;
  email?: string;
  program?: string;
  notes?: string;
  consent?: boolean;
  consent_version?: string;
  source?: string;
  idempotency_key?: string;
}

export function createLead(data: CreateLeadData): LeadRecord {
  const db = getDb();
  const now = new Date().toISOString();
  const consentInt = data.consent === false ? 0 : 1;
  const consentVersion = data.consent_version ?? "2026.1";

  const result = db
    .prepare(
      `
    INSERT INTO leads (
      fullname, phone, email, program, notes, status, created_at,
      consent, consent_at, consent_version, source, idempotency_key
    )
    VALUES (?, ?, ?, ?, ?, 'new', ?, ?, ?, ?, ?, ?)
  `,
    )
    .run(
      data.fullname,
      data.phone,
      data.email ?? null,
      data.program ?? null,
      data.notes ?? null,
      now,
      consentInt,
      now,
      consentVersion,
      data.source ?? null,
      data.idempotency_key ?? null,
    );

  return {
    id: Number(result.lastInsertRowid),
    fullname: data.fullname,
    phone: data.phone,
    email: data.email ?? null,
    program: data.program ?? null,
    notes: data.notes ?? null,
    status: "new",
    created_at: now,
    consent: consentInt,
    consent_at: now,
    consent_version: consentVersion,
    source: data.source ?? null,
    idempotency_key: data.idempotency_key ?? null,
  };
}

export function getLeadByIdempotencyKey(key: string, ttlSeconds = 86400): LeadRecord | null {
  if (!key) return null;
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM leads WHERE idempotency_key = ? AND created_at >= ? ORDER BY id DESC LIMIT 1")
    .get(key, new Date(Date.now() - ttlSeconds * 1000).toISOString()) as unknown as LeadRecord | undefined;
  return row ?? null;
}

export function findRecentDuplicateLead(
  phone: string,
  program?: string,
  windowSeconds = 30,
): LeadRecord | null {
  const db = getDb();
  const cutoff = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const row = db
    .prepare(
      `
    SELECT * FROM leads
    WHERE phone = ? AND (program = ? OR (program IS NULL AND ? IS NULL)) AND created_at >= ?
    ORDER BY created_at DESC
    LIMIT 1
  `,
    )
    .get(phone, program ?? null, program ?? null, cutoff) as unknown as LeadRecord | undefined;
  return row ?? null;
}

export function updateLeadStatus(
  id: number,
  status: "new" | "contacted" | "consulted" | "cancelled",
): boolean {
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
  return getDb().prepare("SELECT * FROM pages ORDER BY published_at DESC").all();
}

export function getPageBySlug(slug: string): any | null {
  const row = getDb().prepare("SELECT * FROM pages WHERE slug = ?").get(slug);
  return row ?? null;
}

export function createPage(data: any): any {
  const db = getDb();
  const now = new Date().toISOString();
  try {
    const result = db
      .prepare(
        `
      INSERT INTO pages (
        title, slug, excerpt, content_html, featured_image,
        status, seo_title, seo_description, published_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        data.title,
        data.slug,
        data.excerpt ?? null,
        data.content_html,
        data.featured_image ?? null,
        data.status || "published",
        data.seo_title ?? null,
        data.seo_description ?? null,
        data.published_at || now,
        now,
        now,
      );
    return getPageBySlug(data.slug);
  } catch (e) {
    return getPageBySlug(data.slug);
  }
}

export function getPageById(id: number): any | null {
  const row = getDb().prepare("SELECT * FROM pages WHERE id = ?").get(id);
  return row ?? null;
}

export function updatePage(id: number, data: Partial<any>): any | null {
  const db = getDb();
  const existing = getPageById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  db.prepare(
    `
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
  `,
  ).run(
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
    id,
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
  const date = new Date().toISOString().split("T")[0];
  db.prepare(
    `
    INSERT INTO page_views (path, date, views)
    VALUES (?, ?, 1)
    ON CONFLICT(path, date) DO UPDATE SET views = views + 1
  `,
  ).run(path, date);
}

export function getAnalyticsStats(days: number = 7): {
  totalViews: number;
  topPages: { path: string; views: number }[];
} {
  const db = getDb();
  const d = new Date();
  d.setDate(d.getDate() - days);
  const cutoffDate = d.toISOString().split("T")[0];

  const totalViews = db
    .prepare(
      `
    SELECT SUM(views) as total FROM page_views WHERE date >= ?
  `,
    )
    .get(cutoffDate) as { total: number | null };

  const topPages = db
    .prepare(
      `
    SELECT path, SUM(views) as views
    FROM page_views
    WHERE date >= ?
    GROUP BY path
    ORDER BY views DESC
    LIMIT 10
  `,
    )
    .all(cutoffDate) as { path: string; views: number }[];

  return {
    totalViews: totalViews?.total || 0,
    topPages,
  };
}
