import { LocalizedText } from "@/components/i18n/LocalizedText";
import Link from "@/components/i18n/LocalizedLink";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArticleCard } from "@/components/news/ArticleCard";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { cms } from "@/lib/cms";
import { shouldHideExpiredUrgentNotice } from "@/lib/news/homepage-freshness";

export async function NewsPreview() {
  const articles = await cms.getLatestArticles(12).catch(() => []);
  const homepageArticles = articles
    .filter((article) => !shouldHideExpiredUrgentNotice(article.title, article.excerpt))
    .slice(0, 6);
  const featuredArticle = homepageArticles[0];
  const regularArticles = homepageArticles.slice(1, 6);

  return (
    <section className="bg-paper py-16 lg:py-24">
      <Container>
        <ScrollReveal>
          <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <SectionHeading
              title="Tin tức & Sự kiện"
              subtitle="Tin tức, sự kiện và hoạt động đào tạo của Topica"
              className="flex-1"
            />
            <Link
              href="/tin-tuc/"
              className="font-semibold text-navy-900 transition-colors hover:text-gold-700 md:pb-2"
            >
              <LocalizedText>Xem tất cả tin tức
            </LocalizedText></Link>
          </div>
        </ScrollReveal>

        {featuredArticle ? (
          <ScrollReveal variant="scaleIn">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="h-full">
                <ArticleCard
                  article={featuredArticle}
                  variant="homepage-featured"
                  className="h-full"
                />
              </div>
              <div className="flex flex-col gap-4">
                {regularArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} variant="horizontal" />
                ))}
              </div>
            </div>
          </ScrollReveal>
        ) : (
          <p className="text-center text-body text-ink-600"><LocalizedText>Tin tức đang được cập nhật.</LocalizedText></p>
        )}
      </Container>
    </section>
  );
}
