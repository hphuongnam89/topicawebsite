import { cn } from "@/components/ui/cn";
import { ArticleCard } from "@/components/news/ArticleCard";
import { ButtonLink } from "@/components/ui/Button";
import type { Article } from "@/lib/cms/types";

interface RelatedContentProps {
  articles: Article[];
  showCTA?: boolean;
  className?: string;
}

export function RelatedContent({ articles, showCTA = true, className }: RelatedContentProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className={cn("mt-16 border-t border-line-200 pt-12", className)}>
      <h2 className="mb-8 font-display text-h2 text-ink-950">Bài viết liên quan</h2>

      <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {articles.slice(0, 3).map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {showCTA && (
        <div className="rounded-xl bg-elevated p-8 text-center shadow-sm sm:p-12">
          <h2 className="mb-4 font-display text-h2 text-ink-950">Bạn cần tư vấn?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-body text-ink-800">
            Đội ngũ chuyên viên tư vấn của chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc
            của bạn về chương trình học.
          </p>
          <ButtonLink href="/dang-ky" variant="primary" className="min-w-[200px]">
            Đăng ký ngay
          </ButtonLink>
        </div>
      )}
    </section>
  );
}
