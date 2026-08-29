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
    <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-5 w-5 text-ink-400" />
        <input
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm thông tin tuyển sinh, ngành học, tin tức..."
          className="w-full rounded-full border-2 border-line-200 bg-canvas py-3 pl-12 pr-12 text-body font-medium text-ink-950 outline-none transition-colors focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
        />
        {query && !isSearching && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 p-1 rounded-full text-ink-400 hover:text-ink-600 hover:bg-line-100 transition-colors"
            aria-label="Xóa nội dung tìm kiếm"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isSearching && (
          <div className="absolute right-4">
            <Loader2 className="h-5 w-5 text-brand-500 animate-spin" />
          </div>
        )}
      </div>
    </form>
  );
}
