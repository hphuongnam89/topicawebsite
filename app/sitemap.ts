import { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { programs } from "@/data/programs";
import { cms } from "@/lib/cms";
import { getPages } from "@/lib/db";

const BLOCKED_SLUGS = new Set([
  "cart",
  "checkout",
  "my-account",
  "shop",
  "classic-shop",
]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_SITE_URL;

  // 1. Core Hubs & Static pages
  const staticRoutes = [
    "",
    "/gioi-thieu",
    "/nganh-dao-tao",
    "/tuyen-sinh",
    "/tuyen-sinh/hoc-phi-hoc-bong",
    "/chuong-trinh",
    "/tin-tuc",
    "/dam-bao-chat-luong",
    "/he-thong",
    "/lien-he",
    "/nhung-cau-hoi-thuong-gap",
  ];

  const staticPages = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? ("daily" as const) : ("weekly" as const),
    priority: route === "" ? 1.0 : route.startsWith("/nganh-dao-tao") || route.startsWith("/tuyen-sinh") ? 0.9 : 0.8,
  }));

  // 2. 5 Official Programs
  const programPages = programs.map((program) => ({
    url: `${baseUrl}/${program.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // 3. Published CMS Pages from SQLite
  let cmsPages: MetadataRoute.Sitemap = [];
  try {
    const rawPages = getPages();
    const publishedPages = rawPages.filter(
      (p) => p.status === "published" && !BLOCKED_SLUGS.has(p.slug.toLowerCase())
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
    const { articles } = await cms.getArticles({ limit: 100 });
    articlePages = articles.map((article) => ({
      url: `${baseUrl}/tin-tuc/${article.slug}`,
      lastModified: article.updatedAt ? new Date(article.updatedAt) : new Date(article.publishedAt),
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
  const combined = [...staticPages, ...programPages, ...cmsPages, ...articlePages, ...categoryPages];
  
  return combined.filter((item) => {
    if (seenUrls.has(item.url)) return false;
    seenUrls.add(item.url);
    return true;
  });
}
