import { Metadata } from "next";
import { cms } from "@/lib/cms";
import { Container } from "@/components/ui/Container";
import { SearchForm } from "@/components/search/SearchForm";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { Pagination } from "@/components/ui/Pagination";
import Link from "next/link";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Tìm kiếm",
  description: "Tìm kiếm thông tin trên website tuyển sinh Topica",
  robots: {
    index: false,
    follow: false,
  },
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === "string" ? resolvedParams.q : undefined;
  const page = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page, 10) : 1;

  return (
    <main className="min-h-screen bg-canvas pt-8 pb-24 lg:pt-16">
      <Container size="narrow">
        <div className="mb-12 text-center">
          <h1 className="mb-8 font-display text-display text-ink-950">Tìm kiếm</h1>
          <SearchForm initialQuery={q} />
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
            </div>
          }
        >
          <SearchResults query={q} page={page} />
        </Suspense>
      </Container>
    </main>
  );
}

async function SearchResults({ query, page }: { query?: string; page: number }) {
  if (!query) {
    return (
      <div className="py-12 text-center">
        <h3 className="mb-4 font-display text-h3 font-bold text-ink-950">
          Gợi ý tìm kiếm phổ biến
        </h3>
        <div className="flex flex-wrap justify-center gap-2">
          {["Học phí", "Công nghệ thông tin", "Xét tuyển học bạ", "Văn bằng 2", "Học bổng"].map(
            (term) => (
              <Link
                key={term}
                href={`/tim-kiem?q=${encodeURIComponent(term)}`}
                className="rounded-full border border-line-200 bg-paper px-4 py-2 text-body-sm font-medium text-ink-800 transition-colors hover:border-brand-500 hover:text-brand-700"
              >
                {term}
              </Link>
            ),
          )}
        </div>
      </div>
    );
  }

  const result = await cms.getArticles({ search: query, page, limit: 10 }).catch(() => null);

  if (!result || result.articles.length === 0) {
    return (
      <div className="rounded-lg border border-line-200 bg-paper py-12 text-center">
        <h3 className="text-h4 mb-2 font-bold text-ink-950">Không tìm thấy kết quả</h3>
        <p className="text-ink-600">
          Chúng tôi không tìm thấy kết quả nào phù hợp với từ khóa &quot;{query}&quot;. Vui lòng thử
          lại với từ khóa khác.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between border-b border-line-200 pb-4">
        <h2 className="text-body font-semibold text-ink-950">
          Tìm thấy {result.total} kết quả cho &quot;{query}&quot;
        </h2>
      </div>

      <div className="relative flex flex-col">
        {result.articles.map((article) => (
          <SearchResultCard key={article.id} article={article} query={query} className="relative" />
        ))}
      </div>

      {result.totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={result.totalPages}
            baseUrl={`/tim-kiem?q=${encodeURIComponent(query)}`}
          />
        </div>
      )}
    </div>
  );
}
