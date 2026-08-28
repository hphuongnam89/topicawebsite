import { Article } from "@/lib/cms/types";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type ArticleCardProps = {
  article: Article;
  variant?: "default" | "featured" | "homepage-featured" | "compact" | "horizontal";
  className?: string;
};

export function ArticleCard({ article, variant = "default", className }: ArticleCardProps) {
  const publishedDate = article.publishedAt
    ? format(new Date(article.publishedAt), "dd/MM/yyyy")
    : "";

  if (variant === "featured") {
    return (
      <Link href={`/tin-tuc/${article.slug}`} className={cn("group block", className)}>
        <article className="grid gap-8 rounded-2xl border border-line-200 bg-paper p-6 transition-shadow hover:shadow-md lg:grid-cols-2 lg:p-10">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-line-100">
            {article.featuredImage ? (
              <Image
                src={article.featuredImage.url}
                alt={article.featuredImage.alt || article.title}
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-[4rem] text-brand-300">
                T
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-4 text-body-sm text-ink-600">
              {article.category && (
                <span className="font-semibold text-brand-700">{article.category.title}</span>
              )}
              {publishedDate && <span>{publishedDate}</span>}
            </div>
            <h2 className="mt-4 font-display text-h2 text-ink-950 transition-colors group-hover:text-brand-700">
              {article.title}
            </h2>
            <p className="mt-4 line-clamp-3 text-body-lg text-ink-600">{article.excerpt}</p>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "homepage-featured") {
    return (
      <Link href={`/tin-tuc/${article.slug}`} className={cn("group flex h-full flex-col", className)}>
        <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line-200 bg-paper transition-shadow hover:shadow-lg">
          <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-line-100">
            {article.featuredImage ? (
              <Image
                src={article.featuredImage.url}
                alt={article.featuredImage.alt || article.title}
                fill
                priority
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-[4rem] text-brand-300">
                T
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col p-6 md:p-8">
            <div className="mb-4 flex items-center gap-4 text-body-sm text-ink-600">
              {article.category && (
                <span className="font-semibold text-brand-700">{article.category.title}</span>
              )}
              {publishedDate && <span>{publishedDate}</span>}
            </div>
            <h2 className="line-clamp-3 font-display text-h3 text-ink-950 transition-colors group-hover:text-brand-700">
              {article.title}
            </h2>
            <p className="mt-4 line-clamp-3 flex-1 text-body-lg text-ink-600">{article.excerpt}</p>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link
        href={`/tin-tuc/${article.slug}`}
        className={cn(
          "group hover:bg-line-50 flex gap-4 rounded-xl p-4 transition-colors md:gap-6",
          className,
        )}
      >
        <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-lg bg-line-100 md:aspect-[4/3] md:w-32">
          {article.featuredImage ? (
            <Image
              src={article.featuredImage.url}
              alt={article.featuredImage.alt || article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-xl text-brand-300">
              T
            </div>
          )}
        </div>
        <div className="flex flex-col py-1">
          <div className="mb-2 flex items-center gap-3 text-body-sm text-ink-600">
            {article.category && (
              <span className="font-semibold text-brand-700">{article.category.title}</span>
            )}
            {publishedDate && <span className="hidden md:inline">{publishedDate}</span>}
          </div>
          <h3 className="line-clamp-2 font-display text-body-lg font-bold text-ink-950 transition-colors group-hover:text-brand-700">
            {article.title}
          </h3>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/tin-tuc/${article.slug}`}
        className={cn("group flex flex-col gap-2", className)}
      >
        <div className="text-ink-500 flex items-center gap-2 text-body-sm">
          {publishedDate && <time>{publishedDate}</time>}
        </div>
        <h3 className="text-ink-900 line-clamp-2 font-bold transition-colors group-hover:text-brand-700">
          {article.title}
        </h3>
      </Link>
    );
  }

  // Default Grid Card
  return (
    <Link href={`/tin-tuc/${article.slug}`} className={cn("group flex h-full flex-col", className)}>
      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-line-200 bg-canvas transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-line-100">
          {article.featuredImage ? (
            <Image
              src={article.featuredImage.url}
              alt={article.featuredImage.alt || article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-[3rem] text-brand-300">
              T
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3 flex items-center gap-3 text-body-sm text-ink-600">
            {article.category && (
              <span className="font-semibold text-brand-700">{article.category.title}</span>
            )}
            {publishedDate && <span>{publishedDate}</span>}
          </div>
          <h3 className="text-h4 line-clamp-2 font-display font-bold text-ink-950 transition-colors group-hover:text-brand-700">
            {article.title}
          </h3>
          <p className="mt-3 line-clamp-2 flex-1 text-body text-ink-600">{article.excerpt}</p>
        </div>
      </article>
    </Link>
  );
}
