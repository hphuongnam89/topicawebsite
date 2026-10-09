import "server-only";
import { getDb, transaction } from "@/lib/db/connection";
import type { ContentKind, Locale } from "@/lib/db/schema";

export interface ContentItemRecord {
  id: string;
  kind: ContentKind;
  locale: Locale;
  title: string;
  slug: string | null;
  excerpt: string | null;
  published_revision_id: string | null;
  draft_revision_id: string | null;
  archived_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentRevisionRecord {
  id: string;
  content_id: string;
  revision_no: number;
  schema_version: string;
  title: string;
  excerpt: string | null;
  template_key: string | null;
  blocks_json: Record<string, unknown> | null;
  legacy_html: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_by: string | null;
  created_at: string;
}

export interface CreateContentInput {
  kind: ContentKind;
  locale?: Locale;
  title: string;
  slug?: string;
  excerpt?: string;
  template_key?: string;
  blocks_json?: Record<string, unknown>;
  legacy_html?: string;
  seo_title?: string;
  seo_description?: string;
  created_by?: string;
}

export interface CreateRevisionInput {
  title: string;
  excerpt?: string;
  template_key?: string;
  blocks_json?: Record<string, unknown>;
  legacy_html?: string;
  seo_title?: string;
  seo_description?: string;
  created_by?: string;
}

export class ContentRepository {
  /**
   * Tạo một Content Item mới cùng với Revision đầu tiên (Revision 1) trong một transaction
   */
  async create(input: CreateContentInput): Promise<{
    item: ContentItemRecord;
    revision: ContentRevisionRecord;
  }> {
    return transaction(async () => {
      const db = getDb();
      const locale = input.locale || "vi";

      // 1. Tạo Content Item
      const itemRes = await db.query(
        `INSERT INTO content_items (kind, locale, title, slug, excerpt, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          input.kind,
          locale,
          input.title,
          input.slug || null,
          input.excerpt || null,
          input.created_by || null,
        ],
      );
      const item = itemRes.rows[0] as ContentItemRecord;

      // 2. Tạo Revision 1
      const revRes = await db.query(
        `INSERT INTO content_revisions (
           content_id, revision_no, schema_version, title, excerpt, template_key,
           blocks_json, legacy_html, seo_title, seo_description, created_by
         )
         VALUES ($1, 1, 'v1', $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          item.id,
          input.title,
          input.excerpt || null,
          input.template_key || null,
          input.blocks_json ? JSON.stringify(input.blocks_json) : null,
          input.legacy_html || null,
          input.seo_title || null,
          input.seo_description || null,
          input.created_by || null,
        ],
      );
      const revision = revRes.rows[0] as ContentRevisionRecord;

      // 3. Gán draft_revision_id vào Content Item
      await db.query(`UPDATE content_items SET draft_revision_id = $1 WHERE id = $2`, [
        revision.id,
        item.id,
      ]);
      item.draft_revision_id = revision.id;

      return { item, revision };
    });
  }

  /**
   * Tạo bản sửa đổi (Revision) mới cho content hiện có
   */
  async createRevision(
    contentId: string,
    input: CreateRevisionInput,
    expectedRevisionNo?: number,
  ): Promise<ContentRevisionRecord> {
    return transaction(async () => {
      const db = getDb();

      // Lấy revision_no cao nhất
      const maxRes = await db.query(
        `SELECT COALESCE(MAX(revision_no), 0) as max_no FROM content_revisions WHERE content_id = $1`,
        [contentId],
      );
      const currentMaxNo = maxRes.rows[0]?.max_no || 0;

      if (expectedRevisionNo !== undefined && currentMaxNo !== expectedRevisionNo) {
        throw new Error(
          "Conflict: Content has been modified by another user. Optimistic lock failed.",
        );
      }

      const nextNo = currentMaxNo + 1;

      // Tạo revision mới
      const revRes = await db.query(
        `INSERT INTO content_revisions (
           content_id, revision_no, schema_version, title, excerpt, template_key,
           blocks_json, legacy_html, seo_title, seo_description, created_by
         )
         VALUES ($1, $2, 'v1', $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          contentId,
          nextNo,
          input.title,
          input.excerpt || null,
          input.template_key || null,
          input.blocks_json ? JSON.stringify(input.blocks_json) : null,
          input.legacy_html || null,
          input.seo_title || null,
          input.seo_description || null,
          input.created_by || null,
        ],
      );
      const revision = revRes.rows[0] as ContentRevisionRecord;

      // Cập nhật draft_revision_id và title/excerpt trên item
      await db.query(
        `UPDATE content_items
         SET draft_revision_id = $1, title = $2, excerpt = $3, updated_at = NOW()
         WHERE id = $4`,
        [revision.id, input.title, input.excerpt || null, contentId],
      );

      return revision;
    });
  }

  /**
   * Xuất bản (Publish) một revision cụ thể
   */
  async publishRevision(contentId: string, revisionId: string, actorId?: string): Promise<boolean> {
    return transaction(async () => {
      const db = getDb();

      // Kiểm tra revisionId có thuộc contentId không
      const checkRes = await db.query(
        `SELECT id FROM content_revisions WHERE id = $1 AND content_id = $2`,
        [revisionId, contentId],
      );
      if (checkRes.rowCount === 0) {
        throw new Error("Revision does not belong to the specified content item");
      }

      // Cập nhật published_revision_id
      await db.query(
        `UPDATE content_items SET published_revision_id = $1, updated_at = NOW() WHERE id = $2`,
        [revisionId, contentId],
      );

      // Ghi log audit event
      await db.query(
        `INSERT INTO publication_events (content_id, revision_id, action, actor_id)
         VALUES ($1, $2, 'published', $3)`,
        [contentId, revisionId, actorId || null],
      );

      return true;
    });
  }

  /**
   * Đọc nội dung đã xuất bản (Dùng cho Public Frontend)
   */
  async getPublishedBySlug(
    slug: string,
    locale: Locale = "vi",
  ): Promise<{ item: ContentItemRecord; revision: ContentRevisionRecord } | null> {
    const db = getDb();
    const result = await db.query(
      `SELECT c.*,
              r.id as r_id, r.revision_no, r.schema_version, r.title as r_title,
              r.excerpt as r_excerpt, r.template_key, r.blocks_json, r.legacy_html,
              r.seo_title, r.seo_description, r.created_by as r_created_by, r.created_at as r_created_at
       FROM content_items c
       JOIN content_revisions r ON c.published_revision_id = r.id
       WHERE c.slug = $1 AND c.locale = $2 AND c.archived_at IS NULL`,
      [slug, locale],
    );

    if (result.rowCount === 0) return null;
    const row = result.rows[0];

    return {
      item: {
        id: row.id,
        kind: row.kind,
        locale: row.locale,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt,
        published_revision_id: row.published_revision_id,
        draft_revision_id: row.draft_revision_id,
        archived_at: row.archived_at,
        created_by: row.created_by,
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
      revision: {
        id: row.r_id,
        content_id: row.id,
        revision_no: row.revision_no,
        schema_version: row.schema_version,
        title: row.r_title,
        excerpt: row.r_excerpt,
        template_key: row.template_key,
        blocks_json: row.blocks_json,
        legacy_html: row.legacy_html,
        seo_title: row.seo_title,
        seo_description: row.seo_description,
        created_by: row.r_created_by,
        created_at: row.r_created_at,
      },
    };
  }

  /**
   * Lấy chi tiết Content Item cùng danh sách lịch sử Revisions (Dùng cho Admin CMS)
   */
  async findById(contentId: string): Promise<{
    item: ContentItemRecord;
    revisions: ContentRevisionRecord[];
  } | null> {
    const db = getDb();
    const itemRes = await db.query(`SELECT * FROM content_items WHERE id = $1`, [contentId]);
    if (itemRes.rowCount === 0) return null;

    const revRes = await db.query(
      `SELECT * FROM content_revisions WHERE content_id = $1 ORDER BY revision_no DESC`,
      [contentId],
    );

    return {
      item: itemRes.rows[0] as ContentItemRecord,
      revisions: revRes.rows as ContentRevisionRecord[],
    };
  }

  /**
   * Danh sách nội dung cho Admin Panel với bộ lọc và phân trang
   */
  async list(
    filter: {
      kind?: ContentKind;
      locale?: Locale;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<{ items: ContentItemRecord[]; total: number }> {
    const db = getDb();
    const { kind, locale = "vi", limit = 20, offset = 0 } = filter;

    const conditions = ["locale = $1"];
    const params: unknown[] = [locale];

    if (kind) {
      params.push(kind);
      conditions.push(`kind = $${params.length}`);
    }

    const where = `WHERE ${conditions.join(" AND ")}`;

    const countRes = await db.query(
      `SELECT COUNT(*)::int as count FROM content_items ${where}`,
      params,
    );
    const total = countRes.rows[0]?.count || 0;

    params.push(limit);
    const limitIdx = params.length;
    params.push(offset);
    const offsetIdx = params.length;

    const itemsRes = await db.query(
      `SELECT * FROM content_items ${where} ORDER BY updated_at DESC LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params,
    );

    return {
      items: itemsRes.rows as ContentItemRecord[],
      total,
    };
  }
}

export const contentRepository = new ContentRepository();
