import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDb, createArticle, createPage, setSetting, getSetting } from "@/lib/db";
import { createArticleFromInput } from "@/lib/services/articles";
import { cms } from "@/lib/cms/queries";
import { createDraftRevision, transitionRevision } from "@/lib/services/revisions";
import React from "react";
import { renderToString } from "react-dom/server";
import { TrustSection } from "@/components/sections/TrustSection";

const authContext = {
  user: {
    id: "admin-1",
    username: "admin1",
    name: "Admin Test",
    role: "admin" as "admin" | "editor",
  },
};

vi.mock("@/lib/auth/guards", () => ({
  requireUser: async () => authContext,
  requireAdmin: async () =>
    authContext.user.role === "admin"
      ? authContext
      : {
          response: new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { "content-type": "application/json" },
          }),
        },
}));

vi.mock("@/lib/security/request", () => ({
  isSameOrigin: () => true,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { POST as createArticleRoute } from "@/app/api/admin/articles/route";
import { PUT as updateArticleRoute } from "@/app/api/admin/articles/[id]/route";
import { PUT as updateUserRoute, DELETE as deleteUserRoute } from "@/app/api/admin/users/route";
import { PUT as updateHomepageRoute } from "@/app/api/admin/homepage/route";
import { PUT as updateSettingsRoute } from "@/app/api/admin/settings/route";

beforeEach(() => {
  const db = getDb();
  db.exec(
    "DELETE FROM content_revisions; DELETE FROM audit_logs; DELETE FROM articles; DELETE FROM users;",
  );
  authContext.user = { id: "admin-1", username: "admin1", name: "Admin Test", role: "admin" };
  db.prepare(
    "INSERT INTO users (id, username, name, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  ).run("admin-1", "admin1", "Admin Test", "admin", "hash", new Date().toISOString());
});

describe("CMS-01: Editor bypass approval via legacy articles API", () => {
  test("POST /api/admin/articles rejects status: 'published' with 422", async () => {
    authContext.user.role = "editor";

    const request = new Request("http://localhost/api/admin/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Bypass Article",
        slug: "bypass-article",
        content_html: "<p>Unapproved content</p>",
        status: "published",
      }),
    });

    const response = await createArticleRoute(request);
    expect(response.status).toBe(422);
    const data = await response.json();
    expect(data.error).toMatch(/Lưu nháp rồi gửi duyệt/);
  });

  test("POST /api/admin/articles creates draft article when valid", async () => {
    authContext.user.role = "editor";

    const request = new Request("http://localhost/api/admin/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Draft Article",
        slug: "draft-article",
        content_html: "<p>Draft content</p>",
        status: "draft",
      }),
    });

    const response = await createArticleRoute(request);
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.article.status).toBe("draft");
  });

  test("PUT /api/admin/articles/:id rejects direct update on published article with 409", async () => {
    const article = createArticle({
      title: "Already Published",
      slug: "already-published",
      content_html: "<p>Content</p>",
      excerpt: null,
      featured_image: null,
      category_id: null,
      tags: "[]",
      author_name: "Author",
      is_featured: 0,
      status: "published",
      seo_title: null,
      seo_description: null,
      published_at: new Date().toISOString(),
    });

    const request = new Request(`http://localhost/api/admin/articles/${article.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Hacked Title",
        expected_updated_at: article.updated_at,
      }),
    });

    const response = await updateArticleRoute(request, {
      params: Promise.resolve({ id: String(article.id) }),
    });
    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.error).toMatch(/Tạo bản nháp revision/);
  });

  test("PUT /api/admin/articles/:id rejects missing or outdated expected_updated_at with 409", async () => {
    const article = createArticle({
      title: "Draft Article",
      slug: "draft-article-concurrency",
      content_html: "<p>Content</p>",
      excerpt: null,
      featured_image: null,
      category_id: null,
      tags: "[]",
      author_name: "Author",
      is_featured: 0,
      status: "draft",
      seo_title: null,
      seo_description: null,
      published_at: new Date().toISOString(),
    });

    // Missing expected_updated_at
    const requestNoVersion = new Request(`http://localhost/api/admin/articles/${article.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    });

    const res1 = await updateArticleRoute(requestNoVersion, {
      params: Promise.resolve({ id: String(article.id) }),
    });
    expect(res1.status).toBe(409);
    expect((await res1.json()).error).toMatch(/Bài viết đã thay đổi hoặc thiếu phiên bản/);

    // Mismatched expected_updated_at
    const requestStale = new Request(`http://localhost/api/admin/articles/${article.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Updated",
        expected_updated_at: "2020-01-01T00:00:00.000Z",
      }),
    });

    const res2 = await updateArticleRoute(requestStale, {
      params: Promise.resolve({ id: String(article.id) }),
    });
    expect(res2.status).toBe(409);
  });

  test("PUT /api/admin/articles/:id succeeds on draft with matching expected_updated_at", async () => {
    const article = createArticle({
      title: "Draft Article",
      slug: "draft-update-success",
      content_html: "<p>Content</p>",
      excerpt: null,
      featured_image: null,
      category_id: null,
      tags: "[]",
      author_name: "Author",
      is_featured: 0,
      status: "draft",
      seo_title: null,
      seo_description: null,
      published_at: new Date().toISOString(),
    });

    const request = new Request(`http://localhost/api/admin/articles/${article.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Updated Draft Title",
        expected_updated_at: article.updated_at,
      }),
    });

    const response = await updateArticleRoute(request, {
      params: Promise.resolve({ id: String(article.id) }),
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.article.title).toBe("Updated Draft Title");
  });
});

describe("CMS-02: Legacy article expired/archived does not resurrect old text", () => {
  test("expired publication does not resurrect legacy content", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-12T11:00:00.000Z"));

    const article = createArticleFromInput(
      {
        title: "Old Baseline Title",
        slug: "news-test-slug",
        content_html: "<p>Old text</p>",
        status: "published",
        published_at: new Date().toISOString(),
      },
      "Fixture Author",
    );

    // Create revision published from 11:01 to 11:02
    const rev = createDraftRevision({
      entityType: "article",
      entityId: String(article.id),
      title: "Revision Title",
      payload: { title: "New Revised Title", content_html: "<p>New text</p>" },
      actorId: "admin-1",
      actorName: "admin",
    });
    transitionRevision(rev.id, "submit_review", "admin-1");
    transitionRevision(rev.id, "approve", "admin-1");
    transitionRevision(rev.id, "publish", "admin-1", {
      publishAt: "2026-10-12T11:01:00.000Z",
      expireAt: "2026-10-12T11:02:00.000Z",
    });

    // At 11:01: revision is active
    vi.setSystemTime(new Date("2026-10-12T11:01:30.000Z"));
    const active = await cms.getArticleBySlug("news-test-slug");
    expect(active?.title).toBe("New Revised Title");

    // At 11:02: revision is expired, must be null, NOT resurrecting Old Baseline Title
    vi.setSystemTime(new Date("2026-10-12T11:02:00.000Z"));
    const expired = await cms.getArticleBySlug("news-test-slug");
    expect(expired).toBeNull();

    const articlesList = await cms.getArticles({ search: "Old text" });
    expect(articlesList.total).toBe(0);

    vi.useRealTimers();
  });
});

describe("CMS-03: Demoting or deleting the last admin is rejected", () => {
  test("PUT /api/admin/users rejects demoting the only admin to editor", async () => {
    const request = new Request("http://localhost/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "admin-1",
        name: "Admin Test",
        role: "editor",
      }),
    });

    const response = await updateUserRoute(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toMatch(/Không thể hạ quyền quản trị viên duy nhất/);
  });

  test("PUT /api/admin/users returns 404 for non-existent user", async () => {
    const request = new Request("http://localhost/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "non-existent-user",
        name: "Ghost User",
        role: "editor",
      }),
    });

    const response = await updateUserRoute(request);
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toMatch(/Không tìm thấy tài khoản/);
  });

  test("PUT /api/admin/users allows demoting an admin if another admin exists", async () => {
    const db = getDb();
    db.prepare(
      "INSERT INTO users (id, username, name, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    ).run("admin-2", "admin2", "Admin Two", "admin", "hash", new Date().toISOString());

    const request = new Request("http://localhost/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "admin-2",
        name: "Admin Two",
        role: "editor",
      }),
    });

    const response = await updateUserRoute(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test("DELETE /api/admin/users rejects deleting the only admin", async () => {
    const request = new Request("http://localhost/api/admin/users?id=admin-1", {
      method: "DELETE",
    });

    const response = await deleteUserRoute(request);
    expect(response.status).toBe(400);
  });
});

describe("CMS-04: Strict schema validation on homepage & settings prevents crashes", () => {
  test("PUT /api/admin/homepage rejects malformed trustItems with 422 and does not corrupt DB", async () => {
    setSetting("homepage_trust", [{ label: "Original Valid Trust" }]);

    const request = new Request("http://localhost/api/admin/homepage", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trustItems: "broken",
      }),
    });

    const response = await updateHomepageRoute(request);
    expect(response.status).toBe(422);

    // Verify existing setting in DB was NOT corrupted
    const currentTrust = getSetting("homepage_trust", []);
    expect(currentTrust).toEqual([{ label: "Original Valid Trust" }]);
  });

  test("TrustSection handles invalid data gracefully without crashing", () => {
    expect(() => {
      const html = renderToString(React.createElement(TrustSection, { data: "broken" as any }));
      expect(html).toContain("Trực thuộc ĐH Phú Xuân");
    }).not.toThrow();
  });

  test("PUT /api/admin/settings rejects invalid types with 422", async () => {
    const request1 = new Request("http://localhost/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        settings: "bad-type",
      }),
    });

    const res1 = await updateSettingsRoute(request1);
    expect(res1.status).toBe(422);

    const request2 = new Request("http://localhost/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        settings: {
          hotline: { complex: "object" },
        },
      }),
    });

    const res2 = await updateSettingsRoute(request2);
    expect(res2.status).toBe(422);
  });

  test("PUT /api/admin/settings accepts valid settings and updates", async () => {
    const validSettings = {
      hotline: "1900 1234",
      email: "info@topica.edu.vn",
      address: "Hanoi, Vietnam",
      facebook: "https://facebook.com/topica",
      youtube: "",
      zalo: "",
      siteTitle: "Topica Title",
      siteDescription: "Topica Description",
      telegramBotToken: "",
      telegramChatId: "",
    };

    const request = new Request("http://localhost/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: validSettings }),
    });

    const response = await updateSettingsRoute(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.settings.hotline).toBe("1900 1234");
  });
});
