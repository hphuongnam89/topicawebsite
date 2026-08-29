
import 'server-only';
import {
  getArticles as getDbArticles,
  getArticleBySlug as getDbArticleBySlug,
  getCategories as getDbCategories,
  getCategoryById,
  getPages,
  getPageBySlug
} from '@/lib/db';
import type { CmsService, Article, CmsPage, Category, PaginatedArticles } from './types';
import { sanitizeWordPressHtml } from './html';

function mapDbArticleToArticle(row: any): Article {
  const cat: Category | undefined = row.category_name
    ? {
        id: row.category_id || 0,
        title: row.category_name,
        slug: row.category_slug || '',
      }
    : undefined;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    sourceUrl: `/tin-tuc/${row.slug}`,
    excerpt: row.excerpt || '',
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
      name: row.author_name || 'Ban Biên Tập Topica',
    },
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    featured: row.is_featured === 1,
    seo: {
      title: row.seo_title || row.title,
      description: row.seo_description || row.excerpt || '',
    },
  };
}

function mapDbPageToCmsPage(row: any): CmsPage {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    sourceUrl: `/${row.slug}`,
    contentHtml: sanitizeWordPressHtml(row.content_html),
    excerpt: row.excerpt || '',
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    featuredImage: row.featured_image ? { id: 0, url: row.featured_image, alt: row.title } : undefined,
    seo: {
      title: row.seo_title || row.title,
      description: row.seo_description || row.excerpt || '',
    },
  };
}

export const cms: CmsService = {
  async getPageBySlug(slug: string) {
    const dbPage = getPageBySlug(slug);
    if (dbPage && dbPage.status === 'published') return mapDbPageToCmsPage(dbPage);
    return null;
  },

  async getPageByPath(path: string) {
    const slug = path.split('/').filter(Boolean).at(-1);
    if (!slug) return null;
    return this.getPageBySlug(slug);
  },

  async getArticles(params: any = {}): Promise<PaginatedArticles> {
    const page = Number.isFinite(params.page) ? Math.max(1, Math.trunc(params.page ?? 1)) : 1;
    const limit = Number.isFinite(params.limit) ? Math.min(100, Math.max(1, Math.trunc(params.limit ?? 12))) : 12;
    const search = params.search?.trim().slice(0, 100);

    let categoryId = undefined;
    if (params.category) {
      const cats = getDbCategories();
      const cat = cats.find(c => c.slug === params.category);
      if (cat) categoryId = cat.id;
    }

    const { items, total } = getDbArticles({
      search,
      categoryId,
      status: 'published',
      limit,
      offset: (page - 1) * limit,
    });

    return {
      articles: items.map(mapDbArticleToArticle),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  async getArticleBySlug(slug: string) {
    const dbArticle = getDbArticleBySlug(slug);
    if (dbArticle && dbArticle.status === 'published') {
      return mapDbArticleToArticle(dbArticle);
    }
    return null;
  },

  async getFeaturedArticles(limit = 1) {
    const { items } = getDbArticles({ limit: Math.min(10, Math.max(1, limit)), status: 'published' });
    const featured = items.filter(a => a.is_featured === 1);
    if (featured.length > 0) return featured.slice(0, limit).map(mapDbArticleToArticle);
    return items.slice(0, limit).map(mapDbArticleToArticle);
  },

  async getLatestArticles(limit = 10) {
    const { items } = getDbArticles({ limit, status: 'published' });
    return items.map(mapDbArticleToArticle);
  },

  async getRelatedArticles(article: Article, limit = 3) {
    if (!article.category) return [];
    const cats = getDbCategories();
    const cat = cats.find(c => c.slug === article.category!.slug);
    if (!cat) return [];
    const { items } = getDbArticles({ categoryId: cat.id, limit: limit + 1, status: 'published' });
    return items.filter(a => a.id !== article.id).slice(0, limit).map(mapDbArticleToArticle);
  },

  async getArticlesByCategory(slug: string, params: any = {}) {
    return this.getArticles({ ...params, category: slug });
  },

  async getCategories() {
    return getDbCategories()
      .filter((cat: any) => cat.article_count > 0)
      .map((cat: any) => ({
        id: cat.id,
        title: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        count: cat.article_count || 0,
      }));
  },

  async getCategoryBySlug(slug: string) {
    const cats = await this.getCategories();
    return cats.find(c => c.slug === slug) || null;
  },
};

