import "server-only";
import { getArticles, getCategories, getDb } from "@/lib/db";
import type { ContentRevisionRecord } from "@/lib/db/types";
import { getPublishedRevision, getRevisions } from "./revisions";

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

export function getRevisionOnlyArticles(options: {
  search?: string;
  categoryId?: number;
  status?: string;
} = {}) {
  const categories = getCategories();
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return latestRevisionRows("article")
    .map((row) => {
      const payload = payloadOf(row);
      const title = String(payload.title ?? row.title);
      const excerpt = payload.excerpt == null ? null : String(payload.excerpt);
      const categoryId = payload.category_id == null ? null : Number(payload.category_id);
      const cat = Number.isFinite(categoryId) ? categoryMap.get(Number(categoryId)) : null;
      const publishedRev = getPublishedRevision("article", row.entity_id);
      const isPublished = Boolean(publishedRev);
      const status = isPublished ? "published" : "draft";
      const hasDraft =
        !isPublished ||
        row.version > (publishedRev?.version ?? 0) ||
        row.workflow_state !== "published";

      return {
        id: row.entity_id,
        title,
        slug: String(payload.slug ?? row.entity_id),
        excerpt,
        content_html: String(payload.content_html ?? ""),
        featured_image: payload.featured_image == null ? null : String(payload.featured_image),
        category_id: Number.isFinite(categoryId) ? Number(categoryId) : null,
        category_name: cat ? cat.name : null,
        category_slug: cat ? cat.slug : null,
        tags: payload.tags == null ? null : String(payload.tags),
        author_name: payload.author_name == null ? null : String(payload.author_name),
        is_featured: Number(Boolean(payload.is_featured)),
        status,
        public_status: status,
        is_published: isPublished,
        has_draft: hasDraft,
        seo_title: payload.seo_title == null ? null : String(payload.seo_title),
        seo_description: payload.seo_description == null ? null : String(payload.seo_description),
        published_at: publishedRev?.published_at ?? row.published_at ?? row.updated_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        source: "revision" as const,
        workflow_state: row.workflow_state,
        revision_id: row.id,
        latest_version: row.version,
        published_version: publishedRev?.version ?? null,
      };
    })
    .filter((row) => {
      const needle = options.search?.trim().toLocaleLowerCase("vi");
      if (needle && !`${row.title} ${row.excerpt ?? ""} ${row.slug}`.toLocaleLowerCase("vi").includes(needle))
        return false;
      if (options.categoryId !== undefined && row.category_id !== options.categoryId) return false;
      if (options.status && row.status !== options.status) {
        if (options.status === "has_draft" && row.has_draft) return true;
        return false;
      }
      return true;
    });
}

export function getAllAdminArticles(options: {
  search?: string;
  categoryId?: number;
  status?: string;
} = {}) {
  const legacy = getArticles({
    search: options.search,
    categoryId: options.categoryId,
    status: options.status,
    limit: 10000,
    offset: 0,
  });

  const legacyDecorated = legacy.items.map((art) => {
    const publishedRev = getPublishedRevision("article", String(art.id));
    const latestRevs = getRevisions("article", String(art.id));
    const latestRev = latestRevs[0];
    const isPublished = art.status === "published" || Boolean(publishedRev);
    const hasDraft = Boolean(
      latestRev &&
        (latestRev.workflow_state !== "published" ||
          (publishedRev && latestRev.version > publishedRev.version)),
    );
    return {
      ...art,
      source: "legacy" as const,
      is_published: isPublished,
      public_status: isPublished ? "published" : "draft",
      has_draft: hasDraft,
      workflow_state: latestRev?.workflow_state,
      latest_version: latestRev?.version,
      published_version: publishedRev?.version,
    };
  });

  const revisionArticles = getRevisionOnlyArticles(options);
  return [...legacyDecorated, ...revisionArticles].sort((left, right) =>
    String(right.updated_at ?? right.published_at).localeCompare(
      String(left.updated_at ?? left.published_at),
    ),
  );
}

export function getAdminArticleStats() {
  const all = getAllAdminArticles();
  const publishedArticles = all.filter((a) => a.status === "published").length;
  const draftArticles = all.filter((a) => a.status === "draft").length;
  return {
    totalArticles: all.length,
    publishedArticles,
    draftArticles,
    recentArticles: all.slice(0, 5),
  };
}

export function getAdminCategorySummary() {
  const revisionArticles = getRevisionOnlyArticles();
  const revisionCounts = new Map<number, number>();
  for (const article of revisionArticles) {
    if (article.category_id !== null)
      revisionCounts.set(article.category_id, (revisionCounts.get(article.category_id) ?? 0) + 1);
  }
  const legacyUncategorized = getDb()
    .prepare("SELECT COUNT(*) AS count FROM articles WHERE category_id IS NULL")
    .get() as { count: number };
  return {
    categories: getCategories().map((category) => ({
      ...category,
      article_count: (category.article_count ?? 0) + (revisionCounts.get(category.id) ?? 0),
    })),
    uncategorizedArticleCount:
      Number(legacyUncategorized.count) +
      revisionArticles.filter((article) => article.category_id === null).length,
  };
}

export function getRevisionOnlyPages(options: { search?: string } = {}) {
  const needle = options.search?.trim().toLocaleLowerCase("vi");
  return latestRevisionRows("page")
    .map((row) => {
      const payload = payloadOf(row);
      const publishedRev = getPublishedRevision("page", row.entity_id);
      const isPublished = Boolean(publishedRev);
      const status = isPublished ? "published" : "draft";
      return {
        id: row.entity_id,
        title: String(payload.title ?? row.title),
        slug: String(payload.slug ?? row.entity_id),
        excerpt: payload.excerpt == null ? null : String(payload.excerpt),
        content_html: String(payload.content_html ?? ""),
        featured_image: payload.featured_image == null ? null : String(payload.featured_image),
        status,
        public_status: status,
        is_published: isPublished,
        has_draft:
          !isPublished ||
          row.version > (publishedRev?.version ?? 0) ||
          row.workflow_state !== "published",
        seo_title: payload.seo_title == null ? null : String(payload.seo_title),
        seo_description: payload.seo_description == null ? null : String(payload.seo_description),
        published_at: publishedRev?.published_at ?? row.published_at ?? row.updated_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        source: "revision" as const,
        workflow_state: row.workflow_state,
        revision_id: row.id,
        latest_version: row.version,
        published_version: publishedRev?.version ?? null,
      };
    })
    .filter((row) => !needle || `${row.title} ${row.slug} ${row.excerpt ?? ""}`.toLocaleLowerCase("vi").includes(needle));
}
