import { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { programs } from "@/data/programs";
import { cms } from "@/lib/cms";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_SITE_URL;

  // Static pages
  const staticPages = [
    "",
    "/gioi-thieu",
    "/tuyen-sinh",
    "/tin-tuc",
    "/lien-he",
    "/nhung-cau-hoi-thuong-gap",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Programs from static data
  const programPages = programs.map((program) => ({
    url: `${baseUrl}/${program.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  // Articles from CMS
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    // We only fetch first 100 for sitemap here as an example
    // In a real huge site, we'd paginate or use Next.js dynamic sitemaps with id
    const { articles } = await cms.getArticles({ limit: 100 });
    articlePages = articles.map((article) => ({
      url: `${baseUrl}/tin-tuc/${article.slug}`,
      lastModified: article.updatedAt ? new Date(article.updatedAt) : new Date(article.publishedAt),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error("Error generating sitemap for articles", err);
  }

  // Categories
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

  return [...staticPages, ...programPages, ...articlePages, ...categoryPages];
}
