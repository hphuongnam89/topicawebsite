"use client";

import { Category } from "@/lib/cms/types";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type NewsFilterBarProps = {
  categories: Category[];
};

export function NewsFilterBar({ categories }: NewsFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("q") || "";

  const [searchValue, setSearchValue] = useState(currentSearch);

  const handleCategoryClick = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    params.delete("page"); // reset pagination

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue.trim()) {
      params.set("q", searchValue.trim());
    } else {
      params.delete("q");
    }
    params.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-center">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryClick("")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            currentCategory === ""
              ? "bg-brand-500 text-white"
              : "border border-line-200 bg-paper text-ink-600 hover:border-brand-500 hover:text-brand-500",
          )}
        >
          Tất cả
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.slug)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              currentCategory === cat.slug
                ? "bg-brand-500 text-white"
                : "border border-line-200 bg-paper text-ink-600 hover:border-brand-500 hover:text-brand-500",
            )}
          >
            {cat.title}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
        <input
          type="search"
          placeholder="Tìm kiếm bài viết..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="text-ink-900 w-full rounded-full border border-line-200 bg-paper py-2.5 pr-4 pl-11 text-sm transition-all outline-none placeholder:text-ink-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-ink-400" size={18} />
        {isPending && (
          <div className="border-brand-200 absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-t-brand-500" />
        )}
      </form>
    </div>
  );
}
