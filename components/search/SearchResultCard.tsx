import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/components/ui/cn";
import type { Article } from "@/lib/cms/types";

export interface SearchResultCardProps {
  article: Article;
  query?: string;
  className?: string;
}

export function SearchResultCard({ article, query, className }: SearchResultCardProps) {
  // Highlight search term in title
  const highlightQuery = (text: string, term?: string) => {
    if (!term || term.trim() === "") return text;

    try {
      const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
      const parts = text.split(regex);
      return parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="rounded bg-brand-500/20 px-0.5 font-semibold text-brand-700">
            {part}
          </mark>
        ) : (
          part
        ),
      );
    } catch {
      return text;
    }
  };

  return (
    <article
      className={cn(
        "group flex flex-col gap-4 border-b border-line-200 py-6 last:border-0 sm:flex-row sm:gap-6",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center gap-3 text-body-sm">
          {article.category && (
            <span className="font-semibold tracking-wider text-brand-700 uppercase">
              {article.category.title}
            </span>
          )}
          {article.publishedAt && (
            <>
              {article.category && <span className="text-line-200">•</span>}
              <time className="text-ink-600" dateTime={article.publishedAt}>
                {format(new Date(article.publishedAt), "dd/MM/yyyy")}
              </time>
            </>
          )}
        </div>

        <h3 className="text-h4 mb-2 font-display font-bold text-ink-950 transition-colors group-hover:text-brand-700">
          <Link href={`/tin-tuc/${article.slug}`}>
            <span className="absolute inset-0" aria-hidden="true" />
            {highlightQuery(article.title, query)}
          </Link>
        </h3>

        <p className="line-clamp-2 text-body-sm text-ink-600">
          {highlightQuery(article.excerpt, query)}
        </p>
      </div>
    </article>
  );
}
