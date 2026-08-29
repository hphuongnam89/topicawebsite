import { cms } from "@/lib/cms";
import { Article, Category } from "@/lib/cms/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { ArticleCard } from "@/components/news/ArticleCard";
import { NewsFilterBar } from "@/components/news/NewsFilterBar";
import { Pagination } from "@/components/ui/Pagination";
import { AdmissionCTA } from "@/components/sections/AdmissionCTA";
import { env } from "@/lib/env";

export async function generateMetadata({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const category = resolvedParams.category as string | undefined;
  const page = resolvedParams.page as string | undefined;

  let url = `${env.NEXT_PUBLIC_SITE_URL}/tin-tuc`;
  const query = new URLSearchParams();
  if (category) query.set("category", category);
  if (page) query.set("page", page);
  const queryString = query.toString();
  if (queryString) url += `?${queryString}`;

  return {
    title: "Tin tức & Sự kiện",
    description:
      "Cập nhật những tin tức, sự kiện và thông báo mới nhất từ Viện Đào tạo Quốc tế Topica.",
    alternates: {
      canonical: url,
    },
  };
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function NewsHomepage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const page = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page, 10) : 1;
  const category =
    typeof resolvedParams.category === "string" ? resolvedParams.category : undefined;
  const search = typeof resolvedParams.q === "string" ? resolvedParams.q : undefined;

  let featuredArticle: Article | null = null;
  let articles: Article[] = [];
  let categories: Category[] = [];
  let totalPages = 1;
  let cmsUnavailable = false;

  try {
    const isFiltered = !!category || !!search || page > 1;

    // If we are filtering, we don't show the featured article
    const [_featured, _list, _cats] = await Promise.all([
      isFiltered ? Promise.resolve([]) : cms.getFeaturedArticles(1),
      cms.getArticles({ page, limit: 12, category, search }),
      cms.getCategories(),
    ]);

    if (!isFiltered) {
      featuredArticle = _featured.length > 0 ? _featured[0] : _list.articles[0] || null;
      articles = _list.articles.filter((a) => a.id !== featuredArticle?.id);
    } else {
      articles = _list.articles;
    }

    totalPages = _list.totalPages;
    categories = _cats;
  } catch (error: unknown) {
    cmsUnavailable = true;
    console.error("CMS Error:", error instanceof Error ? error.message : "Unknown CMS error");
  }

  const paginationParams = new URLSearchParams();
  if (category) paginationParams.set("category", category);
  if (search) paginationParams.set("q", search);
  const paginationQuery = paginationParams.toString();
  const paginationBaseUrl = `/tin-tuc${paginationQuery ? `?${paginationQuery}` : ""}`;

  return (
    <main className="min-h-screen bg-canvas pb-24">
      <PageHeader
        title="Tin tức & Sự kiện"
        subtitle="Cập nhật thông tin mới nhất về tuyển sinh, sự kiện và hoạt động đào tạo"
        breadcrumbs={[{ label: "Trang chủ", href: "/" }, { label: "Tin tức" }]}
      />

      <Container className="my-16 lg:my-24">
        <NewsFilterBar categories={categories} />

        {/* Featured Article */}
        {featuredArticle && (
          <div className="mb-16">
            <ArticleCard article={featuredArticle} variant="featured" />
          </div>
        )}

        {/* Search Results Summary */}
        {(search || category) && (
          <div className="mb-8 text-body text-ink-600">
            Tìm thấy <span className="text-ink-900 font-bold">{articles.length}</span> kết quả
            {search && (
              <span>
                {" "}
                cho từ khóa &quot;<span className="text-ink-900 font-bold">{search}</span>&quot;
              </span>
            )}
            {category && <span> trong chuyên mục này</span>}
          </div>
        )}

        {/* Articles Grid */}
        {cmsUnavailable ? (
          <div className="rounded-lg border border-line-200 bg-paper px-6 py-12 text-center">
            <h2 className="font-display text-h3 text-ink-950">Tin tức tạm thời chưa khả dụng</h2>
            <p className="mt-2 text-body text-ink-600">Vui lòng quay lại sau.</p>
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="default" />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <h3 className="text-h4 mb-2 font-bold text-ink-950">Không tìm thấy bài viết nào</h3>
            <p className="text-ink-600">Vui lòng thử lại với từ khóa khác.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center">
            <Pagination currentPage={page} totalPages={totalPages} baseUrl={paginationBaseUrl} />
          </div>
        )}
      </Container>
      <AdmissionCTA />
    </main>
  );
}
