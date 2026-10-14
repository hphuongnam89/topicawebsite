import "server-only";
import { getArticles, getCategories, getDb } from "@/lib/db";
import type { ContentRevisionRecord, ProgramRecord } from "@/lib/db/types";
import { getPublishedRevision, getRevisions } from "./revisions";

type RevisionRow = ContentRevisionRecord & { payload: string };

function latestRevisionRows(entityType: "article" | "page" | "program"): RevisionRow[] {
  const baseTable =
    entityType === "article" ? "articles" : entityType === "page" ? "pages" : "programs";
  const idClause =
    entityType === "program" ? "base.id=r.entity_id" : "CAST(base.id AS TEXT)=r.entity_id";
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
           SELECT 1 FROM ${baseTable} base
           WHERE ${idClause}
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

export function getRevisionOnlyArticles(
  options: {
    search?: string;
    categoryId?: number;
    status?: string;
  } = {},
) {
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
      if (
        needle &&
        !`${row.title} ${row.excerpt ?? ""} ${row.slug}`.toLocaleLowerCase("vi").includes(needle)
      )
        return false;
      if (options.categoryId !== undefined && row.category_id !== options.categoryId) return false;
      if (options.status && row.status !== options.status) {
        if (options.status === "has_draft" && row.has_draft) return true;
        return false;
      }
      return true;
    });
}

export function getAllAdminArticles(
  options: {
    search?: string;
    categoryId?: number;
    status?: string;
  } = {},
) {
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
    .filter(
      (row) =>
        !needle ||
        `${row.title} ${row.slug} ${row.excerpt ?? ""}`.toLocaleLowerCase("vi").includes(needle),
    );
}

export interface AdminProgramItem {
  id: string;
  name: string;
  major: string;
  code: string;
  slug: string;
  degree_name: string | null;
  awarding_institution: string | null;
  group_id: string;
  group_name: string;
  credits: number | null;
  semesters: number | null;
  status: "published" | "draft";
  workflow_state: string;
  has_draft: boolean;
  version: number;
  careers_count: number;
  curriculum_count: number;
  faqs_count: number;
  summary: string;
  updated_at: string;
  source: "base" | "revision";
}

const GROUP_NAMES: Record<string, string> = {
  technology: "Công nghệ thông tin",
  business: "Kinh tế & Quản lý",
  language: "Ngôn ngữ",
};

function parseProgramData(value: unknown): Record<string, unknown> {
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return {};
    }
  }
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function optionalText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function optionalNumber(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return value !== null && value !== "" && Number.isFinite(parsed) ? parsed : null;
}

function parseProgramArray(value: unknown): unknown[] {
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  return Array.isArray(value) ? value : [];
}

function toAdminProgram({
  id,
  title,
  base,
  data,
  revision,
  published,
  source,
}: {
  id: string;
  title: string;
  base?: ProgramRecord;
  data: Record<string, unknown>;
  revision?: ContentRevisionRecord;
  published: ContentRevisionRecord | null;
  source: AdminProgramItem["source"];
}): AdminProgramItem {
  const duration = parseProgramData(data.duration_credits);
  const groupId = String(
    data.group_id ??
      data.group ??
      (id === "it" ? "technology" : id === "english" || id === "chinese" ? "language" : "business"),
  );
  const isPublished = Boolean(published);

  return {
    id,
    name: String(data.name || title),
    major: String(data.major || title),
    code: String(data.code || ""),
    slug: String(data.slug || id),
    degree_name: optionalText(data.degree_name),
    awarding_institution: optionalText(data.awarding_institution),
    group_id: groupId,
    group_name: GROUP_NAMES[groupId] || "Kinh tế & Quản lý",
    credits: optionalNumber(duration.credits),
    semesters: optionalNumber(duration.semesters),
    status: isPublished ? "published" : "draft",
    workflow_state: revision?.workflow_state ?? (isPublished ? "published" : "draft"),
    has_draft:
      !isPublished ||
      Boolean(
        revision &&
        (revision.version > (published?.version ?? 0) || revision.workflow_state !== "published"),
      ),
    version: revision?.version ?? base?.version ?? 1,
    careers_count: parseProgramArray(data.careers).length,
    curriculum_count: parseProgramArray(data.curriculum).length,
    faqs_count: parseProgramArray(data.faqs).length,
    summary: String(data.summary || ""),
    updated_at: revision?.updated_at ?? base?.updated_at ?? base?.created_at ?? "",
    source,
  };
}

export function getAdminPrograms(
  options: { search?: string; group?: string } = {},
): AdminProgramItem[] {
  const db = getDb();
  const needle = options.search?.trim().toLocaleLowerCase("vi");
  const filterGroup = options.group?.trim();

  const baseRows = db
    .prepare("SELECT * FROM programs ORDER BY id ASC")
    .all() as unknown as ProgramRecord[];
  const revRows = latestRevisionRows("program");
  const items = baseRows.map((row) => {
    const revision = getRevisions("program", row.id)[0];
    const published = getPublishedRevision("program", row.id);
    return toAdminProgram({
      id: row.id,
      title: row.name,
      base: row,
      data: revision ? payloadOf(revision) : (row as unknown as Record<string, unknown>),
      revision,
      published,
      source: "base",
    });
  });
  items.push(
    ...revRows.map((row) => {
      const published = getPublishedRevision("program", row.entity_id);
      return toAdminProgram({
        id: row.entity_id,
        title: row.title,
        data: payloadOf(row),
        revision: row,
        published,
        source: "revision",
      });
    }),
  );

  return items.filter((item) => {
    if (filterGroup && filterGroup !== "all" && item.group_id !== filterGroup) return false;
    if (needle) {
      const searchSpace =
        `${item.name} ${item.major} ${item.code} ${item.slug} ${item.group_name} ${item.id}`.toLocaleLowerCase(
          "vi",
        );
      if (!searchSpace.includes(needle)) return false;
    }
    return true;
  });
}
