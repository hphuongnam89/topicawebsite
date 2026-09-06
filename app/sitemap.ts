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
    "/nganh-dao-tao",
    "/tuyen-sinh",
    "/tuyen-sinh/hoc-phi-hoc-bong",
    "/tin-tuc",
    "/lien-he",
    "/nhung-cau-hoi-thuong-gap",
    "/chinh-sach-bao-mat",
    "/chuong-trinh",
    "/dam-bao-chat-luong",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Programs from static data
  const programPages = programs.map((program) => ({
    url: `${baseUrl}/${program.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  // Articles from CMS
  let articlePages: MetadataRoute.Sitemap = [];
  try {
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

  return [...staticPages, ...programPages, ...articlePages];
}
