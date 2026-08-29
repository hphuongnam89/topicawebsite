"use client";

import { useState, useMemo } from "react";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { Search } from "lucide-react";
import { cn } from "@/components/ui/cn";

export interface FAQCategory {
  id: string;
  title: string;
  faqs: { question: string; answer: string }[];
}

interface FAQHubProps {
  categories: FAQCategory[];
}

export function FAQHub({ categories }: FAQHubProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    let filtered = categories;

    // Filter by text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = categories
        .map((cat) => ({
          ...cat,
          faqs: cat.faqs.filter(
            (faq) => faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q),
          ),
        }))
        .filter((cat) => cat.faqs.length > 0);
    }

    // Filter by active category tab (if not searching)
    if (!searchQuery.trim() && activeCategory !== "all") {
      filtered = filtered.filter((cat) => cat.id === activeCategory);
    }

    return filtered;
  }, [categories, activeCategory, searchQuery]);

  return (
    <div className="w-full">
      {/* Search & Tabs Header */}
      <div className="mb-12">
        <div className="relative mx-auto mb-8 max-w-2xl">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm câu hỏi (VD: học phí, xét tuyển...)"
            className="w-full rounded-full border-2 border-line-200 bg-canvas py-3 pr-6 pl-12 text-body font-medium text-ink-950 transition-colors outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
          />
        </div>

        {!searchQuery && (
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "rounded-full border px-4 py-2 text-body-sm font-medium transition-colors",
                activeCategory === "all"
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-line-200 bg-paper text-ink-600 hover:border-brand-500 hover:text-brand-700",
              )}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-body-sm font-medium transition-colors",
                  activeCategory === cat.id
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-line-200 bg-paper text-ink-600 hover:border-brand-500 hover:text-brand-700",
                )}
              >
                {cat.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mx-auto max-w-3xl space-y-12">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((cat) => (
            <div key={cat.id} className="scroll-mt-24" id={cat.id}>
              {filteredCategories.length > 1 && (
                <h3 className="mb-6 inline-block border-b-2 border-brand-500 pb-2 font-display text-h3 font-bold text-ink-950">
                  {cat.title}
                </h3>
              )}
              <div className="rounded-xl border border-line-200 bg-canvas p-4 shadow-sm sm:p-6 lg:p-8">
                <FAQAccordion faqs={cat.faqs} allowMultiple={true} />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-line-200 bg-paper py-12 text-center">
            <p className="text-body-lg font-medium text-ink-600">
              Không tìm thấy câu hỏi nào phù hợp với &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 font-semibold text-brand-700 hover:underline"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
