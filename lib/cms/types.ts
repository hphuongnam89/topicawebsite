import type { SanitizedHtml } from "./html";

export interface ImageAsset {
  id: number;
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface Category {
  id: number;
  title: string;
  slug: string;
  description?: string;
  count?: number;
}

export interface Author {
  id: number;
  name: string;
  slug?: string;
  avatar?: ImageAsset;
}

export interface Tag {
  id: number;
  title: string;
  slug: string;
}

export interface SeoFields {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  ogImage?: ImageAsset;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  sourceUrl: string;
  excerpt: string;
  contentHtml: SanitizedHtml;
  featuredImage?: ImageAsset;
  category?: Category;
  categories: Category[];
  tags: Tag[];
  author?: Author;
  publishedAt: string;
  updatedAt: string;
  featured: boolean;
  seo?: SeoFields;
}

export interface CmsPage {
  id: number;
  title: string;
  slug: string;
  sourceUrl: string;
  contentHtml: SanitizedHtml;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  featuredImage?: ImageAsset;
  seo?: SeoFields;
}

export interface ArticleQuery {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  exclude?: number[];
}

export interface PaginatedArticles {
  articles: Article[];
  total: number;
  totalPages: number;
}

export interface CmsService {
  getPageBySlug(slug: string): Promise<CmsPage | null>;
  getPageByPath(path: string): Promise<CmsPage | null>;
  getArticles(params?: ArticleQuery): Promise<PaginatedArticles>;
  getArticleBySlug(slug: string): Promise<Article | null>;
  getFeaturedArticles(limit?: number): Promise<Article[]>;
  getLatestArticles(limit?: number): Promise<Article[]>;
  getRelatedArticles(article: Article, limit?: number): Promise<Article[]>;
  getArticlesByCategory(slug: string, params?: ArticleQuery): Promise<PaginatedArticles>;
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
}
