import { LocalizedText } from "@/components/i18n/LocalizedText";
import Link from "@/components/i18n/LocalizedLink";
import { formatDateVN } from "@/lib/date";
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
            <LocalizedText>{article.category.title}</LocalizedText>
          </Link>
        </div>
      )}
      <h1 className="mb-6 font-display text-h1 leading-tight text-ink-950"><LocalizedText>{article.title}</LocalizedText></h1>

      <LocalizedText>{article.excerpt && (
        <p className="mb-6 text-body-lg font-medium text-ink-800"><LocalizedText>{article.excerpt}</LocalizedText></p>
      )}</LocalizedText>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-body-sm text-ink-600">
        {article.author && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-ink-950"><LocalizedText>{article.author.name}</LocalizedText></span>
          </div>
        )}

        <LocalizedText>{publishedDate && (
          <time dateTime={publishedDate}><LocalizedText>{formatDateVN(publishedDate)}</LocalizedText></time>
        )}</LocalizedText>

        <LocalizedText>{showUpdated && (
          <span className="text-ink-400">
            <LocalizedText>(Cập nhật:</LocalizedText><LocalizedText>{" "}</LocalizedText>
            <time dateTime={article.updatedAt}>
              <LocalizedText>{formatDateVN(article.updatedAt)}</LocalizedText>
            </time>
            <LocalizedText>)
          </LocalizedText></span>
        )}</LocalizedText>

        {readingTime && (
          <span className="flex items-center gap-1 before:mr-6 before:text-line-200 before:content-['•']">
            {readingTime} <LocalizedText>phút đọc
          </LocalizedText></span>
        )}
      </div>
    </header>
  );
}
