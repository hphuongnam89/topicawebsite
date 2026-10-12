import { beforeEach, afterEach, expect, test, vi } from "vitest";
import { getDb, createPage } from "@/lib/db";
import { createArticleFromInput } from "@/lib/services/articles";
import { cms } from "@/lib/cms/queries";
import { createDraftRevision, transitionRevision } from "@/lib/services/revisions";
import {
  getLivePrograms,
  getLiveProgramDetail,
  getLiveTuitionPrograms,
  getLiveContact,
} from "@/lib/services/public-site";
import { cmsDomainFixture } from "@/__tests__/fixtures/cms-domain";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-12T11:00:00.000Z"));
  const db = getDb();
  db.exec(
    "DELETE FROM content_revisions;DELETE FROM audit_logs;DELETE FROM articles;DELETE FROM pages;DELETE FROM programs;DELETE FROM organizations;DELETE FROM admission_rounds;DELETE FROM tuition_policies;DELETE FROM scholarships;DELETE FROM documents;DELETE FROM users;",
  );
  cmsDomainFixture.up(db);
  for (const role of ["editor", "admin"])
    db.prepare(
      "INSERT INTO users(id,username,name,role,password_hash,created_at)VALUES(?,?,?,?,?,?)",
    ).run(role, role, role, role, "fixture-only", new Date().toISOString());
});
afterEach(() => vi.useRealTimers());
function publish(
  type: "article" | "page" | "program" | "tuition_policy" | "organization",
  id: string,
  payload: Record<string, unknown>,
  publishAt?: string,
  expireAt?: string,
) {
  const row = createDraftRevision({
    entityType: type,
    entityId: id,
    title: "Fixture revision",
    payload,
    actorId: "editor",
    actorName: "editor",
  });
  transitionRevision(row.id, "submit_review", "editor");
  transitionRevision(row.id, "approve", "admin");
  return transitionRevision(row.id, "publish", "admin", { publishAt, expireAt });
}
test("article detail, search, latest and categories see the same effective version and never resurrect expired text", async () => {
  const article = createArticleFromInput(
    {
      title: "Legacy fixture",
      slug: "fixture-news",
      content_html: "<p>Legacy text</p>",
      status: "published",
      published_at: new Date().toISOString(),
    },
    "Fixture",
  );
  publish(
    "article",
    String(article.id),
    { title: "New fixture", content_html: "<p>New text</p>" },
    "2026-10-12T11:01:00.000Z",
    "2026-10-12T11:02:00.000Z",
  );
  expect((await cms.getArticleBySlug("fixture-news"))?.title).toBe("Legacy fixture");
  vi.setSystemTime(new Date("2026-10-12T11:01:00.000Z"));
  expect((await cms.getArticles({ search: "New text" })).total).toBe(1);
  expect((await cms.getLatestArticles())[0].title).toBe("New fixture");
  vi.setSystemTime(new Date("2026-10-12T11:02:00.000Z"));
  expect(await cms.getArticleBySlug("fixture-news")).toBeNull();
  expect((await cms.getArticles({ search: "Legacy" })).total).toBe(0);
});
test("an unapproved legacy page stays private; approved page disappears on archive", async () => {
  const page = createPage({
    title: "Fixture page",
    slug: "fixture-page",
    content_html: "<p>Fixture</p>",
    status: "draft",
    published_at: new Date().toISOString(),
  });
  expect(await cms.getPageBySlug("fixture-page")).toBeNull();
  const row = publish("page", String(page.id), {});
  expect((await cms.getPageBySlug("fixture-page"))?.title).toBe("Fixture page");
  transitionRevision(row.id, "archive", "admin");
  expect(await cms.getPageBySlug("fixture-page")).toBeNull();
});
test("program directory/detail and price cards change together, archive suppresses static fallback", () => {
  const row = publish("program", "ba", { name: "Fixture approved program" });
  expect(getLivePrograms().find((row) => row.id === "ba")?.name).toBe("Fixture approved program");
  expect(getLiveProgramDetail("quan-tri-kinh-doanh-marketing")?.officialName).toBe(
    "Fixture approved program",
  );
  const policy = getDb().prepare("SELECT id,total_credits FROM tuition_policies LIMIT 1").get() as {
    id: string;
    total_credits: number;
  };
  publish("tuition_policy", policy.id, {
    program_id: "ba",
    unit_price_per_credit: 700000,
    total_tuition: 700000 * policy.total_credits,
  });
  expect(getLiveTuitionPrograms().find((row) => row.id === "ba")?.pricePerCredit).toBe(700000);
  transitionRevision(row.id, "archive", "admin");
  expect(getLivePrograms().find((row) => row.id === "ba")).toBeUndefined();
  expect(getLiveProgramDetail("quan-tri-kinh-doanh-marketing")).toBeNull();
  expect(getLiveTuitionPrograms().find((row) => row.id === "ba")).toBeUndefined();
});
test("contact consumers use a single published organization; malformed structured content cannot publish", () => {
  publish("organization", "pxu_topica", {
    hotline: "0900000000",
    email: "fixture@example.invalid",
  });
  expect(getLiveContact().channels.admissionsHotline.href).toBe("tel:0900000000");
  expect(getLiveContact().channels.generalEmail.href).toBe("mailto:fixture@example.invalid");
  expect(() => publish("program", "ba", { duration_credits: "broken JSON" })).toThrow(/JSON/);
});
