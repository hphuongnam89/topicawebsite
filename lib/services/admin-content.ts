import "server-only";
import { getArticles, getCategories, getDb } from "@/lib/db";
import type { ContentRevisionRecord } from "@/lib/db/types";
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

export interface AdminProgramItem {
  id: string;
  name: string;
  major: string;
  code: string;
  slug: string;
  degree_name: string;
  awarding_institution: string;
  group_id: string;
  group_name: string;
  credits: number;
  semesters: number;
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

export function getAdminPrograms(
  options: { search?: string; group?: string } = {},
): AdminProgramItem[] {
  const db = getDb();
  const needle = options.search?.trim().toLocaleLowerCase("vi");
  const filterGroup = options.group?.trim();

  const baseRows = db.prepare("SELECT * FROM programs ORDER BY id ASC").all() as any[];
  const revRows = latestRevisionRows("program");

  const items: AdminProgramItem[] = [];

  for (const row of baseRows) {
    const publishedRev = getPublishedRevision("program", row.id);
    const revisions = getRevisions("program", row.id);
    const latestRev = revisions[0] || null;

    const revPayload = latestRev ? payloadOf(latestRev) : null;
    const activeData = revPayload || row;

    let durationCredits: { credits?: number; semesters?: number } = {};
    try {
      durationCredits =
        typeof activeData.duration_credits === "string"
          ? JSON.parse(activeData.duration_credits)
          : activeData.duration_credits || {};
    } catch {}

    let careers: any[] = [];
    try {
      careers =
        typeof activeData.careers === "string"
          ? JSON.parse(activeData.careers)
          : activeData.careers || [];
    } catch {}

    let curriculum: any[] = [];
    try {
      curriculum =
        typeof activeData.curriculum === "string"
          ? JSON.parse(activeData.curriculum)
          : activeData.curriculum || [];
    } catch {}

    let faqs: any[] = [];
    try {
      faqs =
        typeof activeData.faqs === "string" ? JSON.parse(activeData.faqs) : activeData.faqs || [];
    } catch {}

    const isPublished = Boolean(publishedRev);
    const hasDraft =
      !isPublished ||
      Boolean(
        latestRev &&
          (latestRev.version > (publishedRev?.version ?? 0) ||
            latestRev.workflow_state !== "published"),
      );

    const status: "published" | "draft" = isPublished ? "published" : "draft";
    const workflow_state = latestRev?.workflow_state ?? (isPublished ? "published" : "draft");
    const groupId = String(activeData.group_id ?? activeData.group ?? "business");

    items.push({
      id: row.id,
      name: String(activeData.name || row.name),
      major: String(activeData.major || row.major),
      code: String(activeData.code || row.code),
      slug: String(activeData.slug || row.slug),
      degree_name: String(activeData.degree_name || row.degree_name || "Cử nhân"),
      awarding_institution: String(
        activeData.awarding_institution || row.awarding_institution || "Trường Đại học Phú Xuân",
      ),
      group_id: groupId,
      group_name:
        GROUP_NAMES[groupId] ||
        (groupId === "technology"
          ? "Công nghệ thông tin"
          : groupId === "language"
            ? "Ngôn ngữ"
            : "Kinh tế & Quản lý"),
      credits: Number(durationCredits.credits) || 126,
      semesters: Number(durationCredits.semesters) || 9,
      status,
      workflow_state,
      has_draft: hasDraft,
      version: latestRev?.version ?? row.version ?? 1,
      careers_count: Array.isArray(careers) ? careers.length : 0,
      curriculum_count: Array.isArray(curriculum) ? curriculum.length : 0,
      faqs_count: Array.isArray(faqs) ? faqs.length : 0,
      summary: String(activeData.summary || ""),
      updated_at: latestRev?.updated_at ?? row.updated_at ?? row.created_at,
      source: "base",
    });
  }

  for (const row of revRows) {
    const payload = payloadOf(row);
    const publishedRev = getPublishedRevision("program", row.entity_id);
    const isPublished = Boolean(publishedRev);
    const hasDraft =
      !isPublished ||
      row.version > (publishedRev?.version ?? 0) ||
      row.workflow_state !== "published";

    let durationCredits: { credits?: number; semesters?: number } = {};
    try {
      durationCredits =
        typeof payload.duration_credits === "string"
          ? JSON.parse(payload.duration_credits)
          : (payload.duration_credits as any) || {};
    } catch {}

    let careers: any[] = [];
    try {
      careers =
        typeof payload.careers === "string"
          ? JSON.parse(payload.careers)
          : (payload.careers as any) || [];
    } catch {}

    let curriculum: any[] = [];
    try {
      curriculum =
        typeof payload.curriculum === "string"
          ? JSON.parse(payload.curriculum)
          : (payload.curriculum as any) || [];
    } catch {}

    let faqs: any[] = [];
    try {
      faqs =
        typeof payload.faqs === "string"
          ? JSON.parse(payload.faqs)
          : (payload.faqs as any) || [];
    } catch {}

    const groupId = String(payload.group_id ?? payload.group ?? "business");

    items.push({
      id: row.entity_id,
      name: String(payload.name || row.title),
      major: String(payload.major || row.title),
      code: String(payload.code || ""),
      slug: String(payload.slug || row.entity_id),
      degree_name: String(payload.degree_name || "Cử nhân"),
      awarding_institution: String(payload.awarding_institution || "Trường Đại học Phú Xuân"),
      group_id: groupId,
      group_name: GROUP_NAMES[groupId] || "Kinh tế & Quản lý",
      credits: Number(durationCredits.credits) || 126,
      semesters: Number(durationCredits.semesters) || 9,
      status: isPublished ? "published" : "draft",
      workflow_state: row.workflow_state,
      has_draft: hasDraft,
      version: row.version,
      careers_count: Array.isArray(careers) ? careers.length : 0,
      curriculum_count: Array.isArray(curriculum) ? curriculum.length : 0,
      faqs_count: Array.isArray(faqs) ? faqs.length : 0,
      summary: String(payload.summary || ""),
      updated_at: row.updated_at,
      source: "revision",
    });
  }

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

