import { cms } from "@/lib/cms";
import { Container } from "@/components/ui/Container";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { env } from "@/lib/env";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Metadata } from "next";
import { WordPressContent } from "@/components/cms/WordPressContent";
import { ArticleCard } from "@/components/news/ArticleCard";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const article = await cms.getArticleBySlug(resolvedParams.slug);
    if (!article) return {};

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
        canonical: article.seo?.canonicalUrl || `${env.NEXT_PUBLIC_SITE_URL}/tin-tuc/${article.slug}`,
      },
    };
  } catch {
    return {};
  }
}

export default async function ArticlePage({ params }: Props) {
  const resolvedParams = await params;
  const article = await cms.getArticleBySlug(resolvedParams.slug).catch(() => null);

  if (!article) {
    notFound();
  }

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

  return (
    <main className="min-h-screen bg-canvas pt-8 pb-24 lg:pt-12">
      <JsonLd data={articleJsonLd} />
      <Container size="narrow">
        <Breadcrumbs
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Tin tức", href: "/tin-tuc/" },
            ...(article.category
              ? [
                  {
                    label: article.category.title,
                    href: `/tin-tuc?category=${article.category.slug}`,
                  },
                ]
              : []),
            { label: article.title },
          ]}
          className="mb-8"
        />

        <article>
          <header className="mb-12">
            <h1 className="mb-6 font-display text-h1 text-ink-950">{article.title}</h1>

            <div className="flex flex-wrap items-center gap-6 border-y border-line-200 py-4 text-body-sm text-ink-600">
              {article.author && (
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-ink-950">{article.author.name}</div>
                </div>
              )}
              {article.publishedAt && (
                <time dateTime={article.publishedAt}>
                  {format(new Date(article.publishedAt), "dd/MM/yyyy HH:mm")}
                </time>
              )}
              {article.category && (
                <Link
                  href={`/tin-tuc?category=${article.category.slug}`}
                  className="font-semibold text-brand-700 hover:underline"
                >
                  {article.category.title}
                </Link>
              )}
            </div>
          </header>

          {article.featuredImage && (
            <figure className="mb-12 overflow-hidden rounded-xl">
              <div className="relative aspect-[21/9] w-full">
                <Image
                  src={article.featuredImage.url}
                  alt={article.featuredImage.alt || article.title}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </figure>
          )}

          {article.contentHtml ? (
            <WordPressContent html={article.contentHtml} />
          ) : (
            <p className="text-ink-600 italic">Nội dung đang được cập nhật...</p>
          )}

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
      </Container>
    </main>
  );
}

async function RelatedArticles({ articleSlug }: { articleSlug: string; articleId: number }) {
  const article = await cms.getArticleBySlug(articleSlug).catch(() => null);
  if (!article) return null;
  const related = await cms.getRelatedArticles(article, 3).catch(() => []);
  if (related.length === 0) return null;

  return (
    <section className="mt-16 border-t border-line-200 pt-10" aria-labelledby="related-title">
      <h2 id="related-title" className="mb-6 font-display text-h2 text-ink-950">
        Bài viết liên quan
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {related.map((item) => (
          <ArticleCard key={item.id} article={item} />
        ))}
      </div>
    </section>
  );
}
