import { cms } from "@/lib/cms";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { env } from "@/lib/env";

// Article imports
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ArticleLayout } from "@/components/article/ArticleLayout";
import { ArticleHeader } from "@/components/article/ArticleHeader";
import { ArticleHero } from "@/components/article/ArticleHero";
import { ArticleTOC } from "@/components/article/ArticleTOC";
import { ArticleInlineCTA } from "@/components/article/ArticleInlineCTA";
import { ArticleShare } from "@/components/article/ArticleShare";
import { RelatedContent } from "@/components/article/RelatedContent";
import { Prose } from "@/components/ui/Prose";

// Category imports
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { ArticleCard } from "@/components/news/ArticleCard";
import type { Article, Category } from "@/lib/cms/types";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Try Article first
  const article = await cms.getArticleBySlug(slug).catch(() => null);
  if (article) {
    return {
      title: article.seo?.title || article.title,
      description: article.seo?.description || article.excerpt,
      openGraph: {
        title: article.seo?.title || article.title,
        description: article.seo?.description || article.excerpt,
        type: "article",
        publishedTime: article.publishedAt,
        images: article.featuredImage ? [article.featuredImage.url] : [],
      },
      alternates: {
        canonical:
          article.seo?.canonicalUrl || `${env.NEXT_PUBLIC_SITE_URL}/tin-tuc/${article.slug}`,
      },
    };
  }

  // Try Category
  const category = await cms.getCategoryBySlug(slug).catch(() => null);
  if (category) {
    return {
      title: category.title,
      description: category.description || `Tin tức và sự kiện thuộc chuyên mục ${category.title}`,
      alternates: {
        canonical: `${env.NEXT_PUBLIC_SITE_URL}/tin-tuc/${category.slug}`,
      },
    };
  }

  return {};
}

// ----------------- Helper ----------------- //

function processContentHtml(html: string) {
  const headings: { id: string; text: string; level: number }[] = [];

  const processedHtml = html.replace(
    /<h([23])([^>]*)>(.*?)<\/h\1>/gi,
    (match, level, attrs, textContent) => {
      const cleanText = textContent.replace(/<[^>]*>?/gm, "").trim();
      if (!cleanText) return match;

      let id = "";
      const idMatch = attrs.match(/id=["']([^"']+)["']/);

      if (idMatch) {
        id = idMatch[1];
      } else {
        id = cleanText
          .toLowerCase()
          .replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, "a")
          .replace(/[éèẻẽẹêếềểễệ]/g, "e")
          .replace(/[íìỉĩị]/g, "i")
          .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, "o")
          .replace(/[úùủũụưứừửữự]/g, "u")
          .replace(/[ýỳỷỹỵ]/g, "y")
          .replace(/đ/g, "d")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        attrs = ` id="${id}"${attrs}`;
      }

      headings.push({
        id,
        text: cleanText,
        level: parseInt(level, 10),
      });

      return `<h${level}${attrs}>${textContent}</h${level}>`;
    },
  );

  return { processedHtml, headings };
}

// ----------------- Page Component ----------------- //

export default async function SlugPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Try fetching as Article
  const article = await cms.getArticleBySlug(slug).catch(() => null);
  if (article) {
    return renderArticle(article);
  }

  // Try fetching as Category
  const category = await cms.getCategoryBySlug(slug).catch(() => null);
  if (category) {
    const searchParamsResolved = await searchParams;
    const page =
      typeof searchParamsResolved.page === "string" ? parseInt(searchParamsResolved.page, 10) : 1;
    return renderCategory(category, page);
  }

  notFound();
}

// ----------------- Article Renderer ----------------- //

function renderArticle(article: Article) {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.featuredImage ? [article.featuredImage.url] : [],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: article.author
      ? {
          "@type": "Person",
          name: article.author.name,
          ...(article.author.slug
            ? { url: `${env.NEXT_PUBLIC_SITE_URL}/tin-tuc/tac-gia/${article.author.slug}` }
            : {}),
        }
      : {
          "@type": "Organization",
          name: "Viện Đào tạo Quốc tế Topica",
        },
    publisher: {
      "@type": "Organization",
      name: "Viện Đào tạo Quốc tế Topica",
      logo: {
        "@type": "ImageObject",
        url: `${env.NEXT_PUBLIC_SITE_URL}/topica-logo.png`,
      },
    },
  };

  const { processedHtml, headings } = processContentHtml(article.contentHtml || "");
  const readingTime = Math.max(
    1,
    Math.ceil((article.contentHtml?.replace(/<[^>]*>?/gm, "").split(/\s+/).length || 0) / 250),
  );

  return (
    <main className="min-h-screen bg-canvas">
      <JsonLd data={articleJsonLd} />

      <ArticleLayout
        toc={<ArticleTOC headings={headings} />}
        sidebar={
          <div className="mt-8 flex flex-col gap-8">
            <ArticleShare title={article.title} />
          </div>
        }
      >
        <Breadcrumbs
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Tin tức", href: "/tin-tuc/" },
            ...(article.category
              ? [
                  {
                    label: article.category.title,
                    href: `/tin-tuc/${article.category.slug}`,
                  },
                ]
              : []),
            { label: article.title },
          ]}
          className="mb-8"
        />

        <article>
          <ArticleHeader article={article} readingTime={readingTime} />
          <ArticleHero image={article.featuredImage} title={article.title} />

          {processedHtml ? (
            <Prose html={processedHtml} />
          ) : (
            <p className="text-ink-600 italic">Nội dung đang được cập nhật...</p>
          )}

          <div className="my-12">
            <ArticleInlineCTA />
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-12 flex items-center gap-2 border-t border-line-200 pt-8">
              <span className="text-body-sm font-semibold text-ink-950">Tags:</span>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag.slug}
                    className="rounded bg-line-100 px-2 py-1 text-body-sm text-ink-800"
                  >
                    #{tag.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        <RelatedArticles articleSlug={article.slug} articleId={article.id} />
      </ArticleLayout>
    </main>
  );
}

// ----------------- Category Renderer ----------------- //

async function renderCategory(category: Category, page: number) {
  const result = await cms
    .getArticles({ category: category.slug, page, limit: 12 })
    .catch(() => null);
  const articles = result?.articles || [];

  return (
    <main className="min-h-screen bg-canvas pb-24">
      <PageHeader
        title={category.title}
        subtitle={category.description || `Các bài viết thuộc chuyên mục ${category.title}`}
        breadcrumbs={[
          { label: "Trang chủ", href: "/" },
          { label: "Tin tức", href: "/tin-tuc/" },
          { label: category.title },
        ]}
      />

      <Container className="mt-16">
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="default" />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <h3 className="text-h4 mb-2 font-bold text-ink-950">Chuyên mục chưa có bài viết</h3>
            <p className="text-ink-600">Vui lòng quay lại sau.</p>
          </div>
        )}
      </Container>
    </main>
  );
}

// ----------------- Shared Components ----------------- //

async function RelatedArticles({ articleSlug }: { articleSlug: string; articleId: number }) {
  const article = await cms.getArticleBySlug(articleSlug).catch(() => null);
  if (!article) return null;
  const related = await cms.getRelatedArticles(article, 3).catch(() => []);
  if (related.length === 0) return null;

  return (
    <div className="mt-16">
      <RelatedContent articles={related} showCTA={true} />
    </div>
  );
}
