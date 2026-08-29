import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/components/ui/cn";
import type { Article } from "@/lib/cms/types";

interface ArticleHeaderProps {
  article: Article;
  readingTime?: number;
}

export function ArticleHeader({ article, readingTime }: ArticleHeaderProps) {
  const publishedDate = article.publishedAt;
  const showUpdated = article.updatedAt && article.updatedAt !== publishedDate;

  return (
    <header className="mb-8 border-b border-line-200 pb-8">
      {article.category && (
        <div className="mb-4">
          <Link
            href={`/tin-tuc?category=${article.category.slug}`}
            className="text-body-sm font-medium tracking-wider text-brand-700 uppercase hover:underline"
          >
            {article.category.title}
          </Link>
        </div>
      )}
      <h1 className="mb-6 font-display text-h1 leading-tight text-ink-950">{article.title}</h1>

      {article.excerpt && (
        <p className="mb-6 text-body-lg font-medium text-ink-800">{article.excerpt}</p>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-body-sm text-ink-600">
        {article.author && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-ink-950">{article.author.name}</span>
          </div>
        )}

        {publishedDate && (
          <time dateTime={publishedDate}>{format(new Date(publishedDate), "dd/MM/yyyy")}</time>
        )}

        {showUpdated && (
          <span className="text-ink-400">
            (Cập nhật:{" "}
            <time dateTime={article.updatedAt}>
              {format(new Date(article.updatedAt), "dd/MM/yyyy")}
            </time>
            )
          </span>
        )}

        {readingTime && (
          <span className="flex items-center gap-1 before:mr-6 before:text-line-200 before:content-['•']">
            {readingTime} phút đọc
          </span>
        )}
      </div>
    </header>
  );
}
