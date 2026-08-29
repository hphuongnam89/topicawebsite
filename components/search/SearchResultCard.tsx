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
      const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) => 
        regex.test(part) ? <mark key={i} className="bg-brand-500/20 text-brand-700 font-semibold px-0.5 rounded">{part}</mark> : part
      );
    } catch {
      return text;
    }
  };

  return (
    <article className={cn("group flex flex-col sm:flex-row gap-4 sm:gap-6 py-6 border-b border-line-200 last:border-0", className)}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2 text-body-sm">
          {article.category && (
            <span className="font-semibold text-brand-700 uppercase tracking-wider">
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
        
        <h3 className="text-h4 font-display font-bold text-ink-950 mb-2 group-hover:text-brand-700 transition-colors">
          <Link href={`/tin-tuc/${article.slug}`}>
            <span className="absolute inset-0" aria-hidden="true" />
            {highlightQuery(article.title, query)}
          </Link>
        </h3>
        
        <p className="text-body-sm text-ink-600 line-clamp-2">
          {highlightQuery(article.excerpt, query)}
        </p>
      </div>
    </article>
  );
}
