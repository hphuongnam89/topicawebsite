import { beforeAll, describe, expect, test, vi } from "vitest";
vi.mock("next/server", () => ({ connection: async () => {} }));
import { getDb } from "@/lib/db";
import sitemap from "@/app/sitemap";

describe("sitemap effective content inventory", () => {
  beforeAll(() => {
    const insert = getDb().prepare(
      "INSERT INTO articles(title,slug,content_html,status,published_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?)",
    );
    const now = new Date().toISOString();
    for (let i = 0; i < 105; i++)
      insert.run(
        `Fixture ${i}`,
        `fixture-sitemap-${i}`,
        "Fixture body",
        "published",
        now,
        now,
        now,
      );
    insert.run("Private", "private-sitemap", "Private", "draft", now, now, now);
  });
  test("includes published articles beyond the first list page and excludes draft", async () => {
    const rows = await sitemap();
    expect(rows.filter((row) => row.url.includes("/tin-tuc/fixture-sitemap-"))).toHaveLength(105);
    expect(rows.some((row) => row.url.endsWith("/tin-tuc/private-sitemap"))).toBe(false);
  });
  test("does not advertise CMS-only hubs when no published record exists", async () => {
    const urls = (await sitemap()).map((row) => row.url);
    for (const route of ["/chuong-trinh", "/he-thong", "/dam-bao-chat-luong"]) {
      expect(urls.some((url) => url.endsWith(route))).toBe(false);
    }
  });
});
