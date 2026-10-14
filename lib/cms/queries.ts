
import 'server-only';
import {
  getCategories as getDbCategories,
  getCategoryById,
  getArticles as getLegacyArticles,
  getArticleBySlug as getLegacyArticleBySlug,
} from '@/lib/db';
import type { ArticleRecord, PageRecord } from '@/lib/db/types';
import { readPublicRows } from '@/lib/services/publication';
import type { CmsService, Article, CmsPage, Category, PaginatedArticles } from './types';
import { sanitizeWordPressHtml, cleanWordPressEntities, wordpressText } from './html';
import { isPublicPageTemporarilyHidden } from './public-visibility';

function normalizeArticleTitle(title: string): string {
  const clean = cleanWordPressEntities(title);
  if (/^CHỈ CÒN \d+ NGÀY /i.test(clean)) {
    return clean.replace(/^CHỈ CÒN \d+ NGÀY ĐĂNG KÝ NHẬP HỌC LỚP KHAI GIẢNG/i, "Thông báo nhập học lớp khai giảng");
  }
  return clean;
}

function mapDbArticleToArticle(row: any): Article {
  const category = row.category_id ? getCategoryById(row.category_id) : undefined;
  row = { ...row, category_name: category?.name, category_slug: category?.slug };
  const cat: Category | undefined = row.category_name
    ? {
        id: row.category_id || 0,
        title: cleanWordPressEntities(row.category_name),
        slug: row.category_slug || '',
      }
    : undefined;

  const cleanTitle = normalizeArticleTitle(row.title);

  return {
    id: row.id,
    title: cleanTitle,
    slug: row.slug,
    sourceUrl: `/tin-tuc/${row.slug}`,
    excerpt: wordpressText(row.excerpt || ''),
    contentHtml: sanitizeWordPressHtml(row.content_html),
    featuredImage: row.featured_image
      ? {
          id: 0,
          url: row.featured_image,
          alt: cleanTitle,
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
      title: normalizeArticleTitle(row.seo_title || row.title),
      description: wordpressText(row.seo_description || row.excerpt || ''),
    },
  };
}

function mapDbPageToCmsPage(row: any): CmsPage {
  const cleanTitle = cleanWordPressEntities(row.title);

  return {
    id: row.id,
    title: cleanTitle,
    slug: row.slug,
    sourceUrl: `/${row.slug}`,
    contentHtml: sanitizeWordPressHtml(row.content_html),
    excerpt: wordpressText(row.excerpt || ''),
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    featuredImage: row.featured_image ? { id: 0, url: row.featured_image, alt: cleanTitle } : undefined,
    seo: {
      title: cleanWordPressEntities(row.seo_title || row.title),
      description: wordpressText(row.seo_description || row.excerpt || ''),
    },
  };
}

function publicArticles() {
  const legacy = getLegacyArticles({ status: 'published', limit: 10000, offset: 0 }).items;
  const rows = [...legacy, ...readPublicRows<ArticleRecord>('article')]
    .filter(row => row.status === 'published');
  return [...new Map(rows.map(row => [row.slug, row])).values()]
    .sort((a,b) => b.published_at.localeCompare(a.published_at));
}

export const cms: CmsService = {
  async getPageBySlug(slug: string) {
    if (isPublicPageTemporarilyHidden(slug)) return null;
    const dbPage = readPublicRows<PageRecord>('page').find(row => row.slug === slug && row.status === 'published');
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

    let categoryId: number | undefined;
    if (params.category) {
      const cats = getDbCategories();
      const cat = cats.find(c => c.slug === params.category);
      if (cat) categoryId = cat.id;
      else return { articles: [], total: 0, totalPages: 1 };
    }

    const rows = publicArticles().filter(row =>
      (categoryId === undefined || row.category_id === categoryId) &&
      (!search || `${row.title} ${row.excerpt || ''} ${wordpressText(row.content_html)}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))));
    const total = rows.length;
    const items = rows.slice((page - 1) * limit, page * limit);

    return {
      articles: items.map(mapDbArticleToArticle),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  async getArticleBySlug(slug: string) {
    const dbArticle = publicArticles().find(row => row.slug === slug)
      ?? getLegacyArticleBySlug(slug);
    if (dbArticle && dbArticle.status === 'published') {
      return mapDbArticleToArticle(dbArticle);
    }
    return null;
  },

  async getFeaturedArticles(limit = 1) {
    const items = publicArticles();
    const featured = items.filter(a => a.is_featured === 1);
    if (featured.length > 0) return featured.slice(0, limit).map(mapDbArticleToArticle);
    return items.slice(0, limit).map(mapDbArticleToArticle);
  },

  async getLatestArticles(limit = 10) {
    const items = publicArticles().slice(0, Math.min(100, Math.max(1, limit)));
    return items.map(mapDbArticleToArticle);
  },

  async getRelatedArticles(article: Article, limit = 3) {
    if (!article.category) return [];
    const cats = getDbCategories();
    const cat = cats.find(c => c.slug === article.category!.slug);
    if (!cat) return [];
    const items = publicArticles().filter(row => row.category_id === cat.id);
    return items.filter(a => a.id !== article.id).slice(0, limit).map(mapDbArticleToArticle);
  },

  async getArticlesByCategory(slug: string, params: any = {}) {
    return this.getArticles({ ...params, category: slug });
  },

  async getCategories() {
    const articles = publicArticles();
    return getDbCategories()
      .map(cat => ({...cat, article_count: articles.filter(row => row.category_id === cat.id).length}))
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

