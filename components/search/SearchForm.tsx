"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2, X } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { Container } from "@/components/ui/Container";

interface SearchFormProps {
  initialQuery?: string;
  isSearching?: boolean;
}

export function SearchForm({ initialQuery = "", isSearching = false }: SearchFormProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/tim-kiem?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/tim-kiem`);
    }
  };

  const handleClear = () => {
    setQuery("");
    const input = document.getElementById("search-input");
    if (input) input.focus();
  };

  return (
    <form onSubmit={handleSearch} className="relative mx-auto w-full max-w-2xl">
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-5 w-5 text-ink-400" />
        <input
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm thông tin tuyển sinh, ngành học, tin tức..."
          className="w-full rounded-full border-2 border-line-200 bg-canvas py-3 pr-12 pl-12 text-body font-medium text-ink-950 transition-colors outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
        />
        {query && !isSearching && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 rounded-full p-1 text-ink-400 transition-colors hover:bg-line-100 hover:text-ink-600"
            aria-label="Xóa nội dung tìm kiếm"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isSearching && (
          <div className="absolute right-4">
            <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
          </div>
        )}
      </div>
    </form>
  );
}
