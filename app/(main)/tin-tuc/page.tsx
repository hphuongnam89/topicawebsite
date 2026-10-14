import { LocalizedText } from "@/components/i18n/LocalizedText";
import { cms } from "@/lib/cms";
import { Article, Category } from "@/lib/cms/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { ArticleCard } from "@/components/news/ArticleCard";
import { NewsFilterBar } from "@/components/news/NewsFilterBar";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { AdmissionCTA } from "@/components/sections/AdmissionCTA";
import { env } from "@/lib/env";

import { buildLocalizedMetadata, resolveRequestLocale } from "@/lib/i18n/metadata";

export async function generateMetadata({ searchParams }: Props) {
  const [resolvedParams, locale] = await Promise.all([
    searchParams,
    resolveRequestLocale(searchParams),
  ]);
  const category = resolvedParams?.category as string | undefined;
  const page = resolvedParams?.page as string | undefined;

  let querySuffix = "";
  const query = new URLSearchParams();
  if (category) query.set("category", category);
  if (page) query.set("page", page);
  const queryString = query.toString();
  if (queryString) querySuffix = `?${queryString}`;

  return buildLocalizedMetadata({
    locale,
    title: "Tin tức & Sự kiện",
    description:
      "Cập nhật những tin tức, sự kiện và thông báo mới nhất từ Viện Đào tạo Quốc tế Topica.",
    viPath: `/tin-tuc${querySuffix}`,
    enPath: `/en/tin-tuc${querySuffix}`,
  });
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
    <div className="min-h-screen bg-canvas pb-24">
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
        <LocalizedText>
          {(search || category) && (
            <div className="mb-8 text-body text-ink-600">
              <LocalizedText>Tìm thấy </LocalizedText>
              <span className="font-bold text-ink-900">{articles.length}</span>{" "}
              <LocalizedText>kết quả</LocalizedText>
              <LocalizedText>
                {search && (
                  <span>
                    <LocalizedText> </LocalizedText>
                    <LocalizedText>cho từ khóa &quot;</LocalizedText>
                    <span className="font-bold text-ink-900">
                      <LocalizedText>{search}</LocalizedText>
                    </span>
                    <LocalizedText>&quot;</LocalizedText>
                  </span>
                )}
              </LocalizedText>
              <LocalizedText>
                {category && (
                  <span>
                    {" "}
                    <LocalizedText>trong chuyên mục này</LocalizedText>
                  </span>
                )}
              </LocalizedText>
            </div>
          )}
        </LocalizedText>

        {/* Articles Grid */}
        {cmsUnavailable ? (
          <div className="rounded-lg border border-line-200 bg-paper px-6 py-12 text-center">
            <h2 className="font-display text-h3 text-ink-950">
              <LocalizedText>Tin tức tạm thời chưa khả dụng</LocalizedText>
            </h2>
            <p className="mt-2 text-body text-ink-600">
              <LocalizedText>Vui lòng quay lại sau.</LocalizedText>
            </p>
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="default" />
            ))}
          </div>
        ) : (
          <div className="py-8">
            <EmptyState
              title="Không tìm thấy bài viết nào"
              description={
                search
                  ? `Không tìm thấy kết quả nào phù hợp với từ khóa "${search}". Vui lòng thử lại với từ khóa khác.`
                  : "Hiện chưa có bài viết nào trong chuyên mục này."
              }
              actionHref="/tin-tuc"
              actionLabel="Xem tất cả tin tức"
              secondaryActionHref="/nganh-dao-tao"
              secondaryActionLabel="Khám phá 5 ngành học"
            />
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
    </div>
  );
}
