import { beforeEach, afterEach, expect, test, vi } from "vitest";
import { createArticle, createCategory, getDb } from "@/lib/db";
import { createDraftRevision, transitionRevision } from "@/lib/services/revisions";
import {
  getAdminArticleStats,
  getAdminCategorySummary,
  getRevisionOnlyArticles,
  getRevisionOnlyPages,
} from "@/lib/services/admin-content";
import { cmsDomainFixture } from "@/__tests__/fixtures/cms-domain";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-12T11:00:00.000Z"));
  const db = getDb();
  db.exec(
    "DELETE FROM content_revisions;DELETE FROM audit_logs;DELETE FROM articles;DELETE FROM pages;DELETE FROM users;",
  );
  cmsDomainFixture.up(db);
  for (const role of ["editor", "admin"])
    db.prepare(
      "INSERT INTO users(id,username,name,role,password_hash,created_at)VALUES(?,?,?,?,?,?)",
    ).run(role, role, role, role, "fixture-only", new Date().toISOString());
});
afterEach(() => vi.useRealTimers());

test("admin article list includes revision-only entities", () => {
  createDraftRevision({
    entityType: "article",
    entityId: "qa-revision-article",
    title: "QA revision article",
    payload: {
      title: "QA revision article",
      slug: "qa-revision-article",
      content_html: "<p>Draft</p>",
    },
    actorId: "editor",
    actorName: "editor",
  });
  expect(getRevisionOnlyArticles()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: "qa-revision-article",
        title: "QA revision article",
        status: "draft",
      }),
    ]),
  );
});

test("category summary includes revision-only and unclassified articles", () => {
  const category = createCategory("QA", "qa-category");
  createArticle({
    title: "Legacy article",
    slug: "legacy-article",
    content_html: "<p>Legacy</p>",
    category_id: category.id,
    published_at: new Date().toISOString(),
    status: "published",
  });
  createArticle({
    title: "Unclassified legacy article",
    slug: "unclassified-legacy-article",
    content_html: "<p>Legacy</p>",
    published_at: new Date().toISOString(),
    status: "published",
  });
  createDraftRevision({
    entityType: "article",
    entityId: "qa-category-article",
    title: "Revision article",
    payload: {
      title: "Revision article",
      slug: "qa-category-article",
      content_html: "<p>Draft</p>",
      category_id: category.id,
    },
    actorId: "editor",
    actorName: "editor",
  });
  createDraftRevision({
    entityType: "article",
    entityId: "qa-unclassified-article",
    title: "Unclassified revision article",
    payload: { title: "Unclassified revision article", slug: "qa-unclassified-article" },
    actorId: "editor",
    actorName: "editor",
  });

  const summary = getAdminCategorySummary();
  expect(summary.categories).toEqual(
    expect.arrayContaining([expect.objectContaining({ id: category.id, article_count: 2 })]),
  );
  expect(summary.uncategorizedArticleCount).toBe(2);
});

test("admin page list includes revision-only entities and latest state", () => {
  createDraftRevision({
    entityType: "page",
    entityId: "qa-revision-page",
    title: "QA revision page",
    payload: { title: "QA revision page", slug: "qa-revision-page", content_html: "<p>Draft</p>" },
    actorId: "editor",
    actorName: "editor",
  });
  expect(getRevisionOnlyPages()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: "qa-revision-page",
        title: "QA revision page",
        status: "draft",
      }),
    ]),
  );
});

test("CMS-05 & CMS-06: article retains published public status when newer draft is created, resolves category name", () => {
  const category = createCategory("Tin tức Topica", "tin-tuc-topica");
  const rev1 = createDraftRevision({
    entityType: "article",
    entityId: "cms-05-article",
    title: "CMS 05 Article v1",
    payload: {
      title: "CMS 05 Article v1",
      slug: "cms-05-article",
      content_html: "<p>V1 published</p>",
      category_id: category.id,
    },
    actorId: "editor",
    actorName: "editor",
  });

  transitionRevision(rev1.id, "submit_review", "editor");
  transitionRevision(rev1.id, "approve", "admin");
  transitionRevision(rev1.id, "publish", "admin");

  // Create newer draft v2
  createDraftRevision({
    entityType: "article",
    entityId: "cms-05-article",
    title: "CMS 05 Article v2",
    payload: {
      title: "CMS 05 Article v2",
      slug: "cms-05-article",
      content_html: "<p>V2 draft changes</p>",
      category_id: category.id,
    },
    actorId: "editor",
    actorName: "editor",
  });

  // Check article list
  const articles = getRevisionOnlyArticles();
  const article = articles.find((a) => a.id === "cms-05-article");
  expect(article).toBeDefined();
  expect(article?.status).toBe("published");
  expect(article?.public_status).toBe("published");
  expect(article?.has_draft).toBe(true);
  expect(article?.workflow_state).toBe("draft");
  expect(article?.category_name).toBe("Tin tức Topica");
  expect(article?.category_slug).toBe("tin-tuc-topica");

  // Filter by status=published must find this article
  const publishedOnly = getRevisionOnlyArticles({ status: "published" });
  expect(publishedOnly.some((a) => a.id === "cms-05-article")).toBe(true);
});

test("CMS-07: getAdminArticleStats counts both legacy and workflow published articles", () => {
  createArticle({
    title: "Legacy article",
    slug: "legacy-article",
    content_html: "<p>Legacy</p>",
    published_at: new Date().toISOString(),
    status: "published",
  });
  const rev = createDraftRevision({
    entityType: "article",
    entityId: "workflow-article",
    title: "Workflow article",
    payload: {
      title: "Workflow article",
      slug: "workflow-article",
      content_html: "<p>Workflow</p>",
    },
    actorId: "editor",
    actorName: "editor",
  });
  transitionRevision(rev.id, "submit_review", "editor");
  transitionRevision(rev.id, "approve", "admin");
  transitionRevision(rev.id, "publish", "admin");

  const stats = getAdminArticleStats();
  expect(stats.totalArticles).toBe(2);
  expect(stats.publishedArticles).toBe(2);
  expect(stats.draftArticles).toBe(0);
});
