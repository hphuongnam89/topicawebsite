// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({
  getPageBySlug: () => undefined,
  getArticleBySlug: () => undefined,
  getArticles: () => ({ items: [], total: 0 }),
  getCategories: () => [],
}));

import { cms } from "@/lib/cms/queries";

const page = {
  id: 404,
  parent: 0,
  slug: "gioi-thieu",
  status: "publish",
  link: "https://topicauni.edu.vn/gioi-thieu/",
  date_gmt: "2026-01-01T00:00:00",
  modified_gmt: "2026-01-01T00:00:00",
  title: { rendered: "Giới thiệu" },
  content: { rendered: "<p>Nội dung giới thiệu</p>" },
  excerpt: { rendered: "Giới thiệu Topica" },
  featured_media: 0,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("WordPress page loading", () => {
  it("loads the requested projection and does not request nonexistent media ID zero", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      const fields = new URL(url).searchParams.get("_fields")!.split(",");
      const projected = Object.fromEntries(
        Object.entries(page).filter(([key]) => fields.includes(key)),
      );
      return Response.json([projected]);
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = await cms.getPageByPath("/gioi-thieu/");
    expect(result?.title).toBe("Giới thiệu");
    expect(result?.contentHtml).toContain("Nội dung giới thiệu");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns null only when a successful query has no matching page", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json([])),
    );
    expect(await cms.getPageByPath("missing")).toBeNull();
  });

  it("does not serve a different parent path with the same slug", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json([page])),
    );
    expect(await cms.getPageByPath("another/gioi-thieu")).toBeNull();
  });

  it("propagates upstream errors instead of turning them into missing pages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Unavailable", { status: 503 })),
    );
    await expect(cms.getPageByPath("gioi-thieu")).rejects.toThrow("503");
  });

  it("propagates invalid CMS data instead of returning a false 404", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json([{ id: 404 }])),
    );
    await expect(cms.getPageByPath("gioi-thieu")).rejects.toThrow("validation failed");
  });

  it("loads an article even when WordPress embeds an unavailable author", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json([
        {
          ...page,
          author: 6,
          categories: [],
          tags: [],
          sticky: false,
          _embedded: { author: [{ code: "rest_user_invalid_id" }] },
        },
      ]),
    );
    vi.stubGlobal("fetch", fetchMock);
    const article = await cms.getArticleBySlug("gioi-thieu");
    expect(article?.title).toBe("Giới thiệu");
    expect(article?.author).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("preserves a publicly embedded author without calling the users API", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json([
        {
          ...page,
          author: 6,
          categories: [],
          tags: [],
          sticky: false,
          _embedded: { author: [{ id: 6, name: "Tác giả công khai", slug: "tac-gia" }] },
        },
      ]),
    );
    vi.stubGlobal("fetch", fetchMock);
    expect((await cms.getArticleBySlug("gioi-thieu"))?.author?.name).toBe("Tác giả công khai");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not report a CMS outage as an empty article list", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Unavailable", { status: 503 })),
    );
    await expect(cms.getArticles()).rejects.toThrow("503");
    await expect(cms.getArticleBySlug("gioi-thieu")).rejects.toThrow("503");
  });

  it("loads a page even if WordPress omits the parent field or returns null", async () => {
    const pageWithoutParent = {
      ...page,
      slug: "tuyen-sinh",
      link: "https://topicauni.edu.vn/tuyen-sinh/",
      title: { rendered: "Tuyển sinh" },
    };
    delete (pageWithoutParent as Record<string, unknown>).parent;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json([pageWithoutParent])),
    );
    const result = await cms.getPageByPath("/tuyen-sinh/");
    expect(result?.title).toBe("Tuyển sinh");
  });
});
