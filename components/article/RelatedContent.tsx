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
    <section className={cn("mt-16 pt-12 border-t border-line-200", className)}>
      <h2 className="font-display text-h2 text-ink-950 mb-8">
        Bài viết liên quan
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {articles.slice(0, 3).map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {showCTA && (
        <div className="bg-elevated p-8 sm:p-12 rounded-xl text-center shadow-sm">
          <h2 className="font-display text-h2 text-ink-950 mb-4">
            Bạn cần tư vấn?
          </h2>
          <p className="text-body text-ink-800 mb-8 max-w-2xl mx-auto">
            Đội ngũ chuyên viên tư vấn của chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn về chương trình học.
          </p>
          <ButtonLink href="/dang-ky" variant="primary" className="min-w-[200px]">
            Đăng ký ngay
          </ButtonLink>
        </div>
      )}
    </section>
  );
}
