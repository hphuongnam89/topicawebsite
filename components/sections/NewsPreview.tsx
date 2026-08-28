import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArticleCard } from "@/components/news/ArticleCard";
import { cms } from "@/lib/cms";

export async function NewsPreview() {
  const articles = await cms.getLatestArticles(6).catch(() => []);
  const featuredArticle = articles[0];
  const regularArticles = articles.slice(1, 6);

  return (
    <section className="bg-paper py-16 lg:py-24">
      <Container>
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <SectionHeading
            title="Tin tức & Sự kiện"
            subtitle="Cập nhật thông tin mới nhất về tuyển sinh, sự kiện và hoạt động đào tạo"
            className="flex-1"
          />
          <Link
            href="/tin-tuc/"
            className="font-semibold text-brand-700 hover:text-brand-800 md:pb-2"
          >
            Xem tất cả tin tức
          </Link>
        </div>

        {featuredArticle ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="h-full">
              <ArticleCard article={featuredArticle} variant="homepage-featured" className="h-full" />
            </div>
            <div className="flex flex-col gap-4">
              {regularArticles.map((article) => (
                <ArticleCard key={article.id} article={article} variant="horizontal" />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-body text-ink-600">Tin tức đang được cập nhật.</p>
        )}
      </Container>
    </section>
  );
}
