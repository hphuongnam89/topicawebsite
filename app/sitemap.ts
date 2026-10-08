import { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { programs } from "@/data/programs";
import { cms } from "@/lib/cms";
import { getPages as getLocalPages } from "@/lib/db";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_SITE_URL;
  // Static pages
  const staticPages = [
    "",
    "/gioi-thieu",
    "/tuyen-sinh",
    "/tuyen-sinh/hoc-phi-hoc-bong",
    "/tin-tuc",
    "/lien-he",
    "/nhung-cau-hoi-thuong-gap",
    "/chinh-sach-bao-mat",
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
  const canonicalUrl = (candidate: string | undefined, fallbackPath: string): string | null => {
    const raw = candidate || `${baseUrl}${fallbackPath}`;
    const url = new URL(raw, baseUrl);
    if (url.origin !== new URL(baseUrl).origin) return null;
    url.search = "";
    url.hash = "";
    url.pathname = url.pathname.replace(/\/{2,}/g, "/").replace(/\/$/, "") || "/";
    return url.toString();
  };
  let articlePages: MetadataRoute.Sitemap = [];
  let cmsPages: MetadataRoute.Sitemap = [];
  try {
    const articles = [] as Awaited<ReturnType<typeof cms.getArticles>>["articles"];
    let page = 1;
    let totalPages = 1;
    do {
      const result = await cms.getArticles({ page, limit: 100 });
      articles.push(...result.articles);
      totalPages = result.totalPages;
      page += 1;
    } while (page <= totalPages);
    articlePages = articles.flatMap((article) => {
      if (article.seo?.noIndex) return [];
      const url = canonicalUrl(article.seo?.canonicalUrl, `/tin-tuc/${article.slug}`);
      if (!url) return [];
      return [
        {
          url,
          lastModified: article.updatedAt
            ? new Date(article.updatedAt)
            : new Date(article.publishedAt),
          changeFrequency: "daily" as const,
          priority: 0.7,
        },
      ];
    });
  } catch (err) {
    console.error("Error generating sitemap articles", err);
  }
  try {
    const pages = await cms.getPages();
    cmsPages = pages.flatMap((page) => {
      if (page.seo?.noIndex) return [];
      const url = canonicalUrl(page.seo?.canonicalUrl, new URL(page.sourceUrl, baseUrl).pathname);
      if (!url) return [];
      return [
        {
          url,
          lastModified: new Date(page.updatedAt || page.publishedAt),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        },
      ];
    });
  } catch (err) {
    console.error("Error generating sitemap CMS pages", err);
  }
  try {
    const localPages = (await getLocalPages()).filter((page) => page.status === "published");
    cmsPages.push(
      ...localPages.map((page) => ({
        url: canonicalUrl(undefined, `/${page.slug.replace(/^\/+/, "")}`)!,
        lastModified: new Date(page.updated_at || page.published_at),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    );
  } catch (err) {
    console.error("Error generating sitemap local pages", err);
  }
  const entries = [...staticPages, ...programPages, ...articlePages, ...cmsPages];
  return [...new Map(entries.map((entry) => [entry.url, entry])).values()];
}
