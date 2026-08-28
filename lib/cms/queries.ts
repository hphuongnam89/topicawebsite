import "server-only";

import { wordpressCollection } from "./client";
import { sanitizeWordPressHtml, wordpressText } from "./html";
import {
  wpAuthorSchema,
  wpCategorySchema,
  wpMediaSchema,
  wpPageSchema,
  wpPostSchema,
  wpPostSummarySchema,
  wpTagSchema,
  type WpCategory,
  type WpMedia,
  type WpPage,
  type WpPost,
  type WpPostSummary,
  type WpTag,
} from "./schemas";
import {
  getArticleBySlug as getDbArticleBySlug,
  getArticles as getDbArticles,
  type ArticleRecord,
} from "@/lib/db";
import type {
  Article,
  ArticleQuery,
  Author,
  Category,
  CmsPage,
  CmsService,
  ImageAsset,
  PaginatedArticles,
  SeoFields,
  Tag,
} from "./types";

function mapDbArticleToArticle(row: ArticleRecord): Article {
  const cat: Category | undefined = row.category_name
    ? {
        id: row.category_id || 0,
        title: row.category_name,
        slug: row.category_slug || "",
      }
    : undefined;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    sourceUrl: `/tin-tuc/${row.slug}`,
    excerpt: row.excerpt || "",
    contentHtml: sanitizeWordPressHtml(row.content_html),
    featuredImage: row.featured_image
      ? {
          id: 0,
          url: row.featured_image,
          alt: row.title,
        }
      : undefined,
    category: cat,
    categories: cat ? [cat] : [],
    tags: [],
    author: {
      id: 0,
      name: row.author_name || "Ban Biên Tập Topica",
    },
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    featured: row.is_featured === 1,
    seo: {
      title: row.seo_title || row.title,
      description: row.seo_description || row.excerpt || "",
    },
  };
}

const summaryFields = [
  "id",
  "date_gmt",
  "modified_gmt",
  "slug",
  "status",
  "link",
  "title",
  "excerpt",
  "featured_media",
  "author",
  "categories",
  "tags",
  "sticky",
  "yoast_head_json",
].join(",");

function isoFromGmt(value: string): string {
  return `${value.replace(/Z$/, "")}Z`;
}

function categoryFromWordPress(category: WpCategory): Category {
  return {
    id: category.id,
    title: wordpressText(category.name),
    slug: category.slug,
    description: wordpressText(category.description),
    count: category.count,
  };
}

function tagFromWordPress(tag: WpTag): Tag {
  return {
    id: tag.id,
    title: wordpressText(tag.name),
    slug: tag.slug,
  };
}

function mediaFromWordPress(media: WpMedia): ImageAsset {
  return {
    id: media.id,
    url: media.source_url,
    alt: wordpressText(media.alt_text),
    caption: media.caption ? wordpressText(media.caption.rendered) : undefined,
    width: media.media_details?.width,
    height: media.media_details?.height,
  };
}

function seoFromWordPress(post: WpPost | WpPostSummary): SeoFields | undefined {
  const seo = post.yoast_head_json;
  if (!seo) return undefined;

  const ogImage = seo.og_image?.[0];
  return {
    title: seo.title,
    description: seo.description,
    canonicalUrl: seo.canonical,
    ogImage: ogImage
      ? {
          id: post.featured_media,
          url: ogImage.url,
          width: ogImage.width,
          height: ogImage.height,
        }
      : undefined,
  };
}

interface ArticleRelations {
  categories: Map<number, Category>;
  tags: Map<number, Tag>;
  media: Map<number, ImageAsset>;
  authors: Map<number, Author>;
}

function articleFromWordPress(post: WpPost | WpPostSummary, relations: ArticleRelations): Article {
  const categories = post.categories.flatMap((id) => {
    const category = relations.categories.get(id);
    return category ? [category] : [];
  });
  const tags = post.tags.flatMap((id) => {
    const tag = relations.tags.get(id);
    return tag ? [tag] : [];
  });

  return {
    id: post.id,
    title: wordpressText(post.title.rendered),
    slug: post.slug,
    sourceUrl: post.link,
    excerpt: wordpressText(post.excerpt.rendered),
    contentHtml:
      "content" in post ? sanitizeWordPressHtml(post.content.rendered) : sanitizeWordPressHtml(""),
    featuredImage: relations.media.get(post.featured_media),
    category: categories[0],
    categories,
    tags,
    author: relations.authors.get(post.author),
    publishedAt: isoFromGmt(post.date_gmt),
    updatedAt: isoFromGmt(post.modified_gmt),
    featured: post.sticky,
    seo: seoFromWordPress(post),
  };
}

async function getCategoriesByIds(ids: number[]): Promise<Map<number, Category>> {
  if (ids.length === 0) return new Map();
  const result = await wordpressCollection("/categories", wpCategorySchema, {
    params: { include: ids, per_page: Math.min(ids.length, 100), hide_empty: false },
    tags: ["wordpress:categories"],
  });
  return new Map(result.items.map((item) => [item.id, categoryFromWordPress(item)]));
}

async function getTagsByIds(ids: number[]): Promise<Map<number, Tag>> {
  if (ids.length === 0) return new Map();
  const result = await wordpressCollection("/tags", wpTagSchema, {
    params: { include: ids, per_page: Math.min(ids.length, 100), hide_empty: false },
    tags: ["wordpress:tags"],
  });
  return new Map(result.items.map((item) => [item.id, tagFromWordPress(item)]));
}

async function getMediaByIds(ids: number[]): Promise<Map<number, ImageAsset>> {
  if (ids.length === 0) return new Map();
  const result = await wordpressCollection("/media", wpMediaSchema, {
    params: { include: ids, per_page: Math.min(ids.length, 100) },
    tags: ["wordpress:media"],
  });
  return new Map(result.items.map((item) => [item.id, mediaFromWordPress(item)]));
}

async function getAuthorsByIds(ids: number[]): Promise<Map<number, Author>> {
  if (ids.length === 0) return new Map();

  try {
    const result = await wordpressCollection("/users", wpAuthorSchema, {
      params: { include: ids, per_page: Math.min(ids.length, 100) },
      tags: ["wordpress:authors"],
    });
    return new Map(
      result.items.map((item) => [
        item.id,
        {
          id: item.id,
          name: wordpressText(item.name),
          slug: item.slug,
          avatar: item.avatar_urls
            ? { id: item.id, url: Object.values(item.avatar_urls).at(-1) ?? "" }
            : undefined,
        },
      ]),
    );
  } catch {
    return new Map();
  }
}

async function buildRelations(posts: Array<WpPost | WpPostSummary>): Promise<ArticleRelations> {
  const unique = (values: number[]) => [...new Set(values.filter((value) => value > 0))];
  const categoryIds = unique(posts.flatMap((post) => post.categories));
  const tagIds = unique(posts.flatMap((post) => post.tags));
  const mediaIds = unique(posts.map((post) => post.featured_media));
  const authorIds = unique(posts.map((post) => post.author));

  const [categories, tags, media, authors] = await Promise.all([
    getCategoriesByIds(categoryIds),
    getTagsByIds(tagIds),
    getMediaByIds(mediaIds),
    getAuthorsByIds(authorIds),
  ]);

  return { categories, tags, media, authors };
}

function normalizeQuery(params: ArticleQuery = {}) {
  const page = Number.isFinite(params.page) ? Math.max(1, Math.trunc(params.page ?? 1)) : 1;
  const limit = Number.isFinite(params.limit)
    ? Math.min(100, Math.max(1, Math.trunc(params.limit ?? 12)))
    : 12;
  const search = params.search?.trim().slice(0, 100);
  return { page, limit, search };
}

function normalizePath(value: string): string {
  return `/${value.replace(/^\/+|\/+$/g, "")}`;
}

function pageFromWordPress(page: WpPage, media: Map<number, ImageAsset>): CmsPage {
  const seo = page.yoast_head_json;
  return {
    id: page.id,
    title: wordpressText(page.title.rendered),
    slug: page.slug,
    sourceUrl: page.link,
    contentHtml: sanitizeWordPressHtml(page.content.rendered),
    excerpt: wordpressText(page.excerpt.rendered),
    publishedAt: isoFromGmt(page.date_gmt),
    updatedAt: isoFromGmt(page.modified_gmt),
    featuredImage: media.get(page.featured_media),
    seo: seo
      ? { title: seo.title, description: seo.description, canonicalUrl: seo.canonical }
      : undefined,
  };
}

async function getWordPressPages(slug: string) {
  const result = await wordpressCollection("/pages", wpPageSchema, {
    params: { slug, status: "publish", per_page: 100 },
    tags: ["wordpress:pages", `wordpress:page:${slug}`],
  });
  return result.items;
}

async function findCategory(slug: string): Promise<Category | null> {
  const result = await wordpressCollection("/categories", wpCategorySchema, {
    params: { slug, per_page: 1, hide_empty: false },
    tags: ["wordpress:categories", `wordpress:category:${slug}`],
  });
  return result.items[0] ? categoryFromWordPress(result.items[0]) : null;
}

async function getArticleList(params: ArticleQuery = {}): Promise<PaginatedArticles> {
  const { page, limit, search } = normalizeQuery(params);

  // Check local database articles
  const localDbResult = getDbArticles({
    search,
    status: "published",
    limit,
    offset: (page - 1) * limit,
  });

  const localArticles = localDbResult.items.map(mapDbArticleToArticle);

  try {
    const category = params.category ? await findCategory(params.category) : null;

    if (params.category && !category) {
      return {
        articles: localArticles,
        total: localDbResult.total,
        totalPages: Math.ceil(localDbResult.total / limit) || 1,
      };
    }

    const result = await wordpressCollection("/posts", wpPostSummarySchema, {
      params: {
        page,
        per_page: limit,
        search,
        categories: category?.id,
        exclude: params.exclude,
        status: "publish",
        orderby: "date",
        order: "desc",
        _fields: summaryFields,
      },
      tags: ["wordpress:posts"],
    });
    const relations = await buildRelations(result.items);
    const wpArticles = result.items.map((post) => articleFromWordPress(post, relations));

    // Combine local articles and WP articles, eliminating duplicates by slug
    const combinedMap = new Map<string, Article>();
    for (const art of [...localArticles, ...wpArticles]) {
      if (!combinedMap.has(art.slug)) {
        combinedMap.set(art.slug, art);
      }
    }

    const combinedArticles = Array.from(combinedMap.values());

    return {
      articles: combinedArticles,
      total: result.total + localDbResult.total,
      totalPages: Math.ceil((result.total + localDbResult.total) / limit),
    };
  } catch (error) {
    // If WordPress is unreachable, gracefully return local articles from database
    return {
      articles: localArticles,
      total: localDbResult.total,
      totalPages: Math.ceil(localDbResult.total / limit) || 1,
    };
  }
}

export const cms: CmsService = {
  async getPageBySlug(slug) {
    const pages = await getWordPressPages(slug);
    const page = pages[0];
    if (!page) return null;

    const media = await getMediaByIds([page.featured_media]);
    return pageFromWordPress(page, media);
  },

  async getPageByPath(path) {
    const normalizedPath = normalizePath(path);
    const slug = normalizedPath.split("/").at(-1);
    if (!slug) return null;

    const pages = await getWordPressPages(slug);
    const page = pages.find((item) => {
      const sourcePath = normalizePath(new URL(item.link).pathname);
      return sourcePath === normalizedPath;
    });
    if (!page) return null;

    const media = await getMediaByIds([page.featured_media]);
    return pageFromWordPress(page, media);
  },

  getArticles: getArticleList,

  async getArticleBySlug(slug) {
    // Check local database first
    const dbArticle = getDbArticleBySlug(slug);
    if (dbArticle && dbArticle.status === "published") {
      return mapDbArticleToArticle(dbArticle);
    }

    try {
      const result = await wordpressCollection("/posts", wpPostSchema, {
        params: { slug, status: "publish", per_page: 1 },
        tags: ["wordpress:posts", `wordpress:post:${slug}`],
      });
      const post = result.items[0];
      if (!post) return null;
      const relations = await buildRelations([post]);
      return articleFromWordPress(post, relations);
    } catch {
      return null;
    }
  },

  async getFeaturedArticles(limit = 1) {
    const normalizedLimit = Math.min(10, Math.max(1, Math.trunc(limit)));
    const result = await wordpressCollection("/posts", wpPostSummarySchema, {
      params: {
        sticky: true,
        per_page: normalizedLimit,
        status: "publish",
        _fields: summaryFields,
      },
      tags: ["wordpress:posts"],
    });

    if (result.items.length === 0) {
      return (await getArticleList({ limit: normalizedLimit })).articles;
    }

    const relations = await buildRelations(result.items);
    return result.items.map((post) => articleFromWordPress(post, relations));
  },

  async getLatestArticles(limit = 10) {
    return (await getArticleList({ limit })).articles;
  },

  async getRelatedArticles(article, limit = 3) {
    if (!article.category) return [];
    return (
      await getArticleList({
        category: article.category.slug,
        exclude: [article.id],
        limit,
      })
    ).articles;
  },

  getArticlesByCategory(slug, params = {}) {
    return getArticleList({ ...params, category: slug });
  },

  async getCategories() {
    const result = await wordpressCollection("/categories", wpCategorySchema, {
      params: { per_page: 100, hide_empty: true, orderby: "name", order: "asc" },
      tags: ["wordpress:categories"],
    });
    return result.items.map(categoryFromWordPress);
  },

  getCategoryBySlug: findCategory,
};
