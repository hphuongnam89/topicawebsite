import "server-only";
import { getDb } from "@/lib/db";
import type { ContentRevisionRecord } from "@/lib/db/types";

type RevisionRow = ContentRevisionRecord & { payload: string };

function latestRevisionRows(entityType: "article" | "page"): RevisionRow[] {
  return getDb()
    .prepare(
      `SELECT r.*
       FROM content_revisions r
       WHERE r.entity_type=?
         AND NOT EXISTS (
           SELECT 1 FROM content_revisions newer
           WHERE newer.entity_type=r.entity_type
             AND newer.entity_id=r.entity_id
             AND (newer.version > r.version OR (newer.version = r.version AND newer.id > r.id))
         )
         AND NOT EXISTS (
           SELECT 1 FROM ${entityType === "article" ? "articles" : "pages"} base
           WHERE CAST(base.id AS TEXT)=r.entity_id
         )
       ORDER BY r.updated_at DESC, r.id DESC`,
    )
    .all(entityType) as unknown as RevisionRow[];
}

function payloadOf(row: RevisionRow): Record<string, unknown> {
  try {
    const payload = JSON.parse(row.payload);
    return payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
  } catch {
    return {};
  }
}

function statusOf(row: RevisionRow): string {
  return row.workflow_state === "published" ? "published" : "draft";
}

export function getRevisionOnlyArticles(options: {
  search?: string;
  categoryId?: number;
  status?: string;
} = {}) {
  return latestRevisionRows("article")
    .map((row) => {
      const payload = payloadOf(row);
      const title = String(payload.title ?? row.title);
      const excerpt = payload.excerpt == null ? null : String(payload.excerpt);
      const categoryId = payload.category_id == null ? null : Number(payload.category_id);
      return {
        id: row.entity_id,
        title,
        slug: String(payload.slug ?? row.entity_id),
        excerpt,
        content_html: String(payload.content_html ?? ""),
        featured_image: payload.featured_image == null ? null : String(payload.featured_image),
        category_id: Number.isFinite(categoryId) ? categoryId : null,
        category_name: null,
        category_slug: null,
        tags: payload.tags == null ? null : String(payload.tags),
        author_name: payload.author_name == null ? null : String(payload.author_name),
        is_featured: Number(Boolean(payload.is_featured)),
        status: statusOf(row),
        seo_title: payload.seo_title == null ? null : String(payload.seo_title),
        seo_description: payload.seo_description == null ? null : String(payload.seo_description),
        published_at: row.published_at ?? row.updated_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        source: "revision" as const,
        workflow_state: row.workflow_state,
        revision_id: row.id,
      };
    })
    .filter((row) => {
      const needle = options.search?.trim().toLocaleLowerCase("vi");
      if (needle && !`${row.title} ${row.excerpt ?? ""} ${row.slug}`.toLocaleLowerCase("vi").includes(needle))
        return false;
      if (options.categoryId !== undefined && row.category_id !== options.categoryId) return false;
      if (options.status && row.status !== options.status) return false;
      return true;
    });
}

export function getRevisionOnlyPages(options: { search?: string } = {}) {
  const needle = options.search?.trim().toLocaleLowerCase("vi");
  return latestRevisionRows("page")
    .map((row) => {
      const payload = payloadOf(row);
      return {
        id: row.entity_id,
        title: String(payload.title ?? row.title),
        slug: String(payload.slug ?? row.entity_id),
        excerpt: payload.excerpt == null ? null : String(payload.excerpt),
        content_html: String(payload.content_html ?? ""),
        featured_image: payload.featured_image == null ? null : String(payload.featured_image),
        status: statusOf(row),
        seo_title: payload.seo_title == null ? null : String(payload.seo_title),
        seo_description: payload.seo_description == null ? null : String(payload.seo_description),
        published_at: row.published_at ?? row.updated_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        source: "revision" as const,
        workflow_state: row.workflow_state,
        revision_id: row.id,
      };
    })
    .filter((row) => !needle || `${row.title} ${row.slug} ${row.excerpt ?? ""}`.toLocaleLowerCase("vi").includes(needle));
}
