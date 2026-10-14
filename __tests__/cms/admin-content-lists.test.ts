import { beforeEach, afterEach, expect, test, vi } from "vitest";
import { getDb } from "@/lib/db";
import { createDraftRevision } from "@/lib/services/revisions";
import { getRevisionOnlyArticles, getRevisionOnlyPages } from "@/lib/services/admin-content";
import { cmsDomainFixture } from "@/__tests__/fixtures/cms-domain";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-12T11:00:00.000Z"));
  const db = getDb();
  db.exec("DELETE FROM content_revisions;DELETE FROM audit_logs;DELETE FROM articles;DELETE FROM pages;DELETE FROM users;");
  cmsDomainFixture.up(db);
  for (const role of ["editor", "admin"])
    db.prepare("INSERT INTO users(id,username,name,role,password_hash,created_at)VALUES(?,?,?,?,?,?)").run(role, role, role, role, "fixture-only", new Date().toISOString());
});
afterEach(() => vi.useRealTimers());

test("admin article list includes revision-only entities", () => {
  createDraftRevision({
    entityType: "article",
    entityId: "qa-revision-article",
    title: "QA revision article",
    payload: { title: "QA revision article", slug: "qa-revision-article", content_html: "<p>Draft</p>" },
    actorId: "editor",
    actorName: "editor",
  });
  expect(getRevisionOnlyArticles()).toEqual(
    expect.arrayContaining([expect.objectContaining({ id: "qa-revision-article", title: "QA revision article", status: "draft" })]),
  );
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
    expect.arrayContaining([expect.objectContaining({ id: "qa-revision-page", title: "QA revision page", status: "draft" })]),
  );
});
