import { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getLivePrograms } from "@/lib/services/public-site";
import { cms } from "@/lib/cms";
import { readPublicRows } from "@/lib/services/publication";
import type { ArticleRecord, PageRecord } from "@/lib/db/types";
import { connection } from "next/server";
import { isPublicPageTemporarilyHidden } from "@/lib/cms/public-visibility";

const BLOCKED_SLUGS = new Set(["cart", "checkout", "my-account", "shop", "classic-shop"]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const baseUrl = env.NEXT_PUBLIC_SITE_URL;

  // 1. Core Hubs & Static pages
  const staticRoutes = [
    "",
    "/gioi-thieu",
    "/nganh-dao-tao",
    "/tuyen-sinh",
    "/tuyen-sinh/hoc-phi-hoc-bong",
    "/tin-tuc",
    "/lien-he",
    "/nhung-cau-hoi-thuong-gap",
  ];

  const staticPages = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? ("daily" as const) : ("weekly" as const),
    priority:
      route === ""
        ? 1.0
        : route.startsWith("/nganh-dao-tao") || route.startsWith("/tuyen-sinh")
          ? 0.9
          : 0.8,
  }));

  // 2. 5 Official Programs
  const programPages = getLivePrograms().map((program) => ({
    url: `${baseUrl}/${program.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // 3. Published CMS Pages from SQLite
  let cmsPages: MetadataRoute.Sitemap = [];
  try {
    const rawPages = readPublicRows<PageRecord>("page");
    const publishedPages = rawPages.filter(
      (p) =>
        p.status === "published" &&
        !BLOCKED_SLUGS.has(p.slug.toLowerCase()) &&
        !isPublicPageTemporarilyHidden(p.slug),
    );
    cmsPages = publishedPages.map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: page.updated_at ? new Date(page.updated_at) : new Date(page.published_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error("Error generating sitemap for cms pages", err);
  }

  // 4. Articles from CMS
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const articles = readPublicRows<ArticleRecord>("article").filter(
      (article) => article.status === "published",
    );
    articlePages = articles.map((article) => ({
      url: `${baseUrl}/tin-tuc/${article.slug}`,
      lastModified: new Date(article.updated_at || article.published_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error("Error generating sitemap for articles", err);
  }

  // 5. Categories
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await cms.getCategories();
    categoryPages = categories.map((cat) => ({
      url: `${baseUrl}/tin-tuc?category=${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (err) {
    console.error("Error generating sitemap for categories", err);
  }

  // Deduplicate by URL
  const seenUrls = new Set<string>();
  const combined = [
    ...staticPages,
    ...programPages,
    ...cmsPages,
    ...articlePages,
    ...categoryPages,
  ];

  return combined.filter((item) => {
    if (seenUrls.has(item.url)) return false;
    seenUrls.add(item.url);
    return true;
  });
}
