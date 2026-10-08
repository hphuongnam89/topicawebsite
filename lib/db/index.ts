import { databaseNow } from "./time";
import "server-only";
import crypto from "node:crypto";
import { PRIVACY_NOTICE_VERSION } from "@/lib/privacy-policy";
import { getDb, transaction } from "./connection";
export { getDb, closeDatabase, migrateDatabase } from "./connection";
import type { ArticleRecord, CategoryRecord, LeadRecord, UserRecord, PageRecord } from "./types";
export type { ArticleRecord, CategoryRecord, LeadRecord, UserRecord, PageRecord } from "./types";
// ----------------------------------------------------
// SETTINGS HELPERS
// ----------------------------------------------------
export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const row = (await getDb().prepare("SELECT value FROM settings WHERE key = ?").get(key)) as
      | {
          value: string;
        }
      | undefined;
    if (!row) return defaultValue;
    return JSON.parse(row.value) as T;
  } catch {
    return defaultValue;
  }
}
export async function setSetting(key: string, value: unknown): Promise<void> {
  const db = getDb();
  const valueJson = JSON.stringify(value);
  const now = new Date().toISOString();
  await db
    .prepare(
      `
    INSERT INTO settings (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `,
    )
    .run(key, valueJson, now);
}
export async function writeAuditLog(input: {
  actorId?: string;
  action: string;
  target?: string;
  ip?: string;
}): Promise<void> {
  await getDb()
    .prepare(
      `
    INSERT INTO audit_logs (actor_id, action, target, ip, created_at)
    VALUES (?, ?, ?, ?, ?)
  `,
    )
    .run(
      input.actorId ?? null,
      input.action,
      input.target ?? null,
      input.ip ?? null,
      new Date().toISOString(),
    );
}
// ----------------------------------------------------
// USERS HELPERS
// ----------------------------------------------------
export async function getUserByUsername(username: string): Promise<UserRecord | null> {
  const row = (await getDb().prepare("SELECT * FROM users WHERE username = ?").get(username)) as
    UserRecord | undefined;
  return row ?? null;
}
export async function getUserById(id: string): Promise<UserRecord | null> {
  const row = (await getDb().prepare("SELECT * FROM users WHERE id = ?").get(id)) as
    UserRecord | undefined;
  return row ?? null;
}
export async function getUsers(): Promise<Omit<UserRecord, "password_hash">[]> {
  const rows = (await getDb()
    .prepare("SELECT id, username, name, role, created_at FROM users ORDER BY created_at ASC")
    .all()) as unknown as Omit<UserRecord, "password_hash">[];
  return rows;
}
export async function updateUserPassword(
  userId: string,
  newPasswordHash: string,
): Promise<boolean> {
  const result = await getDb()
    .prepare(
      "UPDATE users SET password_hash = ?, session_version = session_version + 1 WHERE id = ?",
    )
    .run(newPasswordHash, userId);
  return result.changes > 0;
}
export async function updateUser(
  userId: string,
  data: {
    name?: string;
    role?: string;
    password_hash?: string;
  },
): Promise<boolean> {
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
  if (data.password_hash !== undefined || data.role !== undefined) {
    updates.push("session_version = session_version + 1");
  }
  if (updates.length === 0) return true;
  query += updates.join(", ") + " WHERE id = ?";
  params.push(userId);
  const result = await db.prepare(query).run(...params);
  return result.changes > 0;
}
export async function createUser(
  user: Omit<UserRecord, "created_at" | "session_version">,
): Promise<void> {
  const now = new Date().toISOString();
  await getDb()
    .prepare(
      `
    INSERT INTO users (id, username, password_hash, name, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
    )
    .run(user.id, user.username, user.password_hash, user.name, user.role, now);
}
export async function deleteUser(id: string): Promise<boolean> {
  const result = await getDb()
    .prepare("DELETE FROM users WHERE id = ? AND id != 'admin_root'")
    .run(id);
  return result.changes > 0;
}
// ----------------------------------------------------
// CATEGORIES HELPERS
// ----------------------------------------------------
export async function getCategories(): Promise<CategoryRecord[]> {
  const rows = (await getDb()
    .prepare(
      `
    SELECT c.*, COUNT(a.id) as article_count
    FROM categories c
    LEFT JOIN articles a ON a.category_id = c.id
    GROUP BY c.id
    ORDER BY c.name ASC
  `,
    )
    .all()) as unknown as CategoryRecord[];
  return rows;
}
export async function getCategoryById(id: number): Promise<CategoryRecord | null> {
  const row = (await getDb().prepare("SELECT * FROM categories WHERE id = ?").get(id)) as
    CategoryRecord | undefined;
  return row ?? null;
}
export async function createCategory(
  name: string,
  slug: string,
  description?: string,
): Promise<CategoryRecord> {
  const db = getDb();
  const now = new Date().toISOString();
  const result = await db
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
export async function deleteCategory(id: number): Promise<void> {
  await getDb().prepare("DELETE FROM categories WHERE id = ?").run(id);
}
// ----------------------------------------------------
// ARTICLES HELPERS
// ----------------------------------------------------
export async function getArticles(
  options: {
    search?: string;
    categoryId?: number;
    status?: string;
    limit?: number;
    offset?: number;
  } = {},
): Promise<{
  items: ArticleRecord[];
  total: number;
}> {
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
  const totalRow = (await db
    .prepare(
      `
    SELECT COUNT(*) as count FROM articles a ${whereClause}
  `,
    )
    .get(...params)) as {
    count: number;
  };
  const limit = options.limit ?? 20;
  const offset = options.offset ?? 0;
  const items = (await db
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
    .all(...params, limit, offset)) as unknown as ArticleRecord[];
  return {
    items,
    total: totalRow.count,
  };
}
export async function getArticleById(id: number): Promise<ArticleRecord | null> {
  const row = (await getDb()
    .prepare(
      `
    SELECT a.*, c.name as category_name, c.slug as category_slug
    FROM articles a
    LEFT JOIN categories c ON c.id = a.category_id
    WHERE a.id = ?
  `,
    )
    .get(id)) as ArticleRecord | undefined;
  return row ?? null;
}
export async function getArticleBySlug(slug: string): Promise<ArticleRecord | null> {
  const row = (await getDb()
    .prepare(
      `
    SELECT a.*, c.name as category_name, c.slug as category_slug
    FROM articles a
    LEFT JOIN categories c ON c.id = a.category_id
    WHERE a.slug = ?
  `,
    )
    .get(slug)) as ArticleRecord | undefined;
  return row ?? null;
}
export async function createArticle(
  data: Omit<ArticleRecord, "id" | "created_at" | "updated_at">,
): Promise<ArticleRecord> {
  const db = getDb();
  const now = new Date().toISOString();
  const result = await db
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
  return (await getArticleById(Number(result.lastInsertRowid)))!;
}
export async function updateArticle(
  id: number,
  data: Partial<ArticleRecord>,
): Promise<ArticleRecord | null> {
  const db = getDb();
  const existing = await getArticleById(id);
  if (!existing) return null;
  const now = new Date().toISOString();
  await db
    .prepare(
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
    )
    .run(
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
  return await getArticleById(id);
}
export async function deleteArticle(id: number): Promise<boolean> {
  const result = await getDb().prepare("DELETE FROM articles WHERE id = ?").run(id);
  return result.changes > 0;
}
// ----------------------------------------------------
// LEADS HELPERS
// ----------------------------------------------------
export async function getLeads(
  options: {
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {},
): Promise<{
  items: LeadRecord[];
  total: number;
}> {
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
  const totalRow = (await db
    .prepare(`SELECT COUNT(*) as count FROM leads ${whereClause}`)
    .get(...params)) as {
    count: number;
  };
  const limit = options.limit ?? 20;
  const offset = options.offset ?? 0;
  const items = (await db
    .prepare(
      `
    SELECT leads.*,
      (SELECT status FROM lead_deliveries WHERE lead_id = leads.id AND channel = 'telegram') AS delivery_status,
      (SELECT attempts FROM lead_deliveries WHERE lead_id = leads.id AND channel = 'telegram') AS delivery_attempts,
      (SELECT last_error FROM lead_deliveries WHERE lead_id = leads.id AND channel = 'telegram') AS delivery_error,
      (SELECT next_attempt_at FROM lead_deliveries WHERE lead_id = leads.id AND channel = 'telegram') AS delivery_next_attempt_at
    FROM leads ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `,
    )
    .all(...params, limit, offset)) as unknown as LeadRecord[];
  return { items, total: totalRow.count };
}
export async function createLead(data: {
  fullname: string;
  phone: string;
  email?: string;
  program?: string;
  notes?: string;
  consent: true;
}): Promise<LeadRecord> {
  const db = getDb();
  const now = new Date().toISOString();
  const result = await db
    .prepare(
      `
      INSERT INTO leads (
        fullname, phone, email, program, notes, status, created_at,
        consent_at, consent_policy_version, consent_source
      ) VALUES (?, ?, ?, ?, ?, 'new', ?, ?, ?, ?)
  `,
    )
    .run(
      data.fullname,
      data.phone,
      data.email ?? null,
      data.program ?? null,
      data.notes ?? null,
      now,
      now,
      `privacy-notice-${PRIVACY_NOTICE_VERSION}`,
      "public-lead-form",
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
    consent_at: now,
    consent_policy_version: `privacy-notice-${PRIVACY_NOTICE_VERSION}`,
    consent_source: "public-lead-form",
  };
}
export async function updateLeadStatus(
  id: number,
  status: "new" | "contacted" | "consulted" | "cancelled",
): Promise<boolean> {
  const result = await getDb().prepare("UPDATE leads SET status = ? WHERE id = ?").run(status, id);
  return result.changes > 0;
}
export async function deleteLead(id: number): Promise<boolean> {
  const result = await getDb().prepare("DELETE FROM leads WHERE id = ?").run(id);
  return result.changes > 0;
}
export async function createLeadDelivery(leadId: number, channel = "telegram"): Promise<number> {
  const result = await getDb()
    .prepare(
      `INSERT INTO lead_deliveries (lead_id, channel, status, created_at)
       VALUES (?, ?, 'pending', ?)`,
    )
    .run(leadId, channel, new Date().toISOString());
  return Number(result.lastInsertRowid);
}
export async function createLeadWithDelivery(
  data: Parameters<typeof createLead>[0],
): Promise<LeadRecord> {
  return transaction(async () => {
    const lead = await createLead(data);
    await createLeadDelivery(lead.id);
    return lead;
  });
}
export type PendingLeadDelivery = {
  id: number;
  lead_id: number;
  attempts: number;
  lease_token: string;
  fullname: string;
  phone: string;
  email: string | null;
  program: string | null;
  notes: string | null;
};
export async function claimLeadDelivery(): Promise<PendingLeadDelivery | null> {
  const db = getDb();
  const timestamp = await databaseNow();
  const now = new Date(timestamp).toISOString();
  await db.query(
    `UPDATE lead_deliveries SET status = 'failed', last_error = 'Lease expired at retry limit',
    lease_token = NULL, lease_until = NULL, next_attempt_at = $1
    WHERE status = 'processing' AND lease_until <= $1 AND attempts >= 6`,
    [now],
  );
  const result = await db.query(
    `WITH candidate AS (
    SELECT id FROM lead_deliveries WHERE channel = 'telegram' AND attempts < 6
      AND ((status = 'pending' AND (next_attempt_at IS NULL OR next_attempt_at <= $1))
        OR (status = 'processing' AND lease_until <= $1))
    ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 1
  ), claimed AS (
    UPDATE lead_deliveries d SET status = 'processing', lease_token = $2, lease_until = $3, attempts = attempts + 1
    FROM candidate c WHERE d.id = c.id RETURNING d.id, d.lead_id, d.attempts, d.lease_token
  ) SELECT c.*, l.fullname, l.phone, l.email, l.program, l.notes FROM claimed c JOIN leads l ON l.id = c.lead_id`,
    [now, crypto.randomUUID(), new Date(timestamp + 30000).toISOString()],
  );
  return result.rows[0] ?? null;
}
export async function finishLeadDelivery(
  delivery: PendingLeadDelivery,
  error?: string,
): Promise<boolean> {
  const timestamp = await databaseNow();
  const now = new Date(timestamp).toISOString();
  const next = new Date(
    timestamp + Math.min(60, 5 * 2 ** (delivery.attempts - 1)) * 60000,
  ).toISOString();
  return (
    (
      await getDb()
        .prepare(
          `UPDATE lead_deliveries SET status = ?, last_error = ?, sent_at = ?,
    next_attempt_at = ?, lease_token = NULL, lease_until = NULL WHERE id = ? AND lease_token = ? AND status = 'processing' AND lease_until > ?`,
        )
        .run(
          error ? (delivery.attempts >= 6 ? "failed" : "pending") : "sent",
          error ?? null,
          error ? null : now,
          error ? next : null,
          delivery.id,
          delivery.lease_token,
          now,
        )
    ).changes === 1
  );
}
export async function retryLeadDelivery(leadId: number): Promise<boolean> {
  const timestamp = await databaseNow();
  const now = new Date(timestamp).toISOString();
  return (
    (
      await getDb()
        .prepare(
          `UPDATE lead_deliveries SET status = 'pending', attempts = 0,
    manual_retries = manual_retries + 1, next_attempt_at = ?, lease_token = NULL, lease_until = NULL
    WHERE lead_id = ? AND channel = 'telegram' AND status = 'failed' AND manual_retries < 3
      AND (next_attempt_at IS NULL OR next_attempt_at <= ?)`,
        )
        .run(new Date(timestamp + 60000).toISOString(), leadId, now)
    ).changes === 1
  );
}
export async function purgeExpiredLeads(retentionDays: number): Promise<number> {
  if (!Number.isInteger(retentionDays) || retentionDays < 1) {
    throw new Error("retentionDays must be a positive integer");
  }
  const cutoff = new Date(Date.now() - retentionDays * 86400000).toISOString();
  const db = getDb();
  await db
    .prepare(
      "DELETE FROM lead_deliveries WHERE lead_id IN (SELECT id FROM leads WHERE created_at < ?)",
    )
    .run(cutoff);
  const result = await db.prepare("DELETE FROM leads WHERE created_at < ?").run(cutoff);
  return result.changes;
}
// ----------------------------------------------------
// PAGES HELPERS
// ----------------------------------------------------
export async function getPages(): Promise<PageRecord[]> {
  return (await getDb()
    .prepare("SELECT * FROM pages ORDER BY published_at DESC")
    .all()) as unknown as PageRecord[];
}
export async function getPageBySlug(slug: string): Promise<PageRecord | null> {
  const row = (await getDb().prepare("SELECT * FROM pages WHERE slug = ?").get(slug)) as
    PageRecord | undefined;
  return row ?? null;
}
export async function createPage(data: {
  title: string;
  slug: string;
  excerpt?: string | null;
  content_html: string;
  featured_image?: string | null;
  status?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  published_at?: string;
}): Promise<PageRecord> {
  const db = getDb();
  const now = new Date().toISOString();
  const result = await db
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
  return (await getPageById(Number(result.lastInsertRowid)))!;
}
export async function getPageById(id: number): Promise<PageRecord | null> {
  const row = (await getDb().prepare("SELECT * FROM pages WHERE id = ?").get(id)) as
    PageRecord | undefined;
  return row ?? null;
}
export async function updatePage(
  id: number,
  data: Partial<PageRecord>,
): Promise<PageRecord | null> {
  const db = getDb();
  const existing = await getPageById(id);
  if (!existing) return null;
  const now = new Date().toISOString();
  await db
    .prepare(
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
    )
    .run(
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
  return await getPageById(id);
}
export async function deletePage(id: number): Promise<boolean> {
  const result = await getDb().prepare("DELETE FROM pages WHERE id = ?").run(id);
  return result.changes > 0;
}
// ----------------------------------------------------
// ANALYTICS HELPERS
// ----------------------------------------------------
export async function recordPageView(path: string): Promise<void> {
  const db = getDb();
  const date = new Date().toISOString().split("T")[0];
  await db
    .prepare(
      `
    INSERT INTO page_views (path, date, views)
    VALUES (?, ?, 1)
    ON CONFLICT(path, date) DO UPDATE SET views = page_views.views + 1
  `,
    )
    .run(path, date);
}
export async function recordAnalyticsEvent(
  name: string,
  properties: Record<string, string | number>,
  path?: string,
  eventId?: string,
  sessionId?: string,
): Promise<void> {
  await getDb()
    .prepare(
      `INSERT INTO analytics_events (event_id, session_id, name, properties_json, path, created_at)
       VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
    )
    .run(
      eventId ?? null,
      sessionId ?? null,
      name,
      JSON.stringify(properties),
      path ?? null,
      new Date().toISOString(),
    );
}
export async function purgeExpiredAnalytics(retentionDays: number): Promise<{
  events: number;
  pageViews: number;
}> {
  if (!Number.isInteger(retentionDays) || retentionDays < 1)
    throw new Error("retentionDays must be a positive integer");
  const cutoff = new Date(Date.now() - retentionDays * 86400000).toISOString();
  const db = getDb();
  const events = (await db.prepare("DELETE FROM analytics_events WHERE created_at < ?").run(cutoff))
    .changes;
  const pageViews = (
    await db.prepare("DELETE FROM page_views WHERE date < ?").run(cutoff.slice(0, 10))
  ).changes;
  return { events, pageViews };
}
export async function getAnalyticsStats(days: number = 7): Promise<{
  totalViews: number;
  topPages: {
    path: string;
    views: number;
  }[];
}> {
  const db = getDb();
  const d = new Date();
  d.setDate(d.getDate() - days);
  const cutoffDate = d.toISOString().split("T")[0];
  const totalViews = (await db
    .prepare(
      `
    SELECT SUM(views) as total FROM page_views WHERE date >= ?
  `,
    )
    .get(cutoffDate)) as {
    total: number | null;
  };
  const topPages = (await db
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
    .all(cutoffDate)) as {
    path: string;
    views: number;
  }[];
  return {
    totalViews: totalViews?.total || 0,
    topPages,
  };
}
