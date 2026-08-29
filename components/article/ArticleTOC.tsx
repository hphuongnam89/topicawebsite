"use client";

import { useEffect, useState } from "react";
import { cn } from "@/components/ui/cn";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface ArticleTOCProps {
  headings: TOCItem[];
}

interface TOCListProps {
  headings: TOCItem[];
  activeId: string;
  onItemClick: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}

function TOCList({
  headings,
  activeId,
  onItemClick,
  className,
}: TOCListProps & { className?: string }) {
  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {headings.map((heading) => (
        <li key={heading.id} style={{ paddingLeft: `${(heading.level - 2) * 1}rem` }}>
          <a
            href={`#${heading.id}`}
            onClick={(e) => onItemClick(e, heading.id)}
            className={cn(
              "block text-body-sm transition-colors duration-200",
              activeId === heading.id
                ? "font-medium text-brand-700"
                : "text-ink-600 hover:text-ink-950",
            )}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function ArticleTOC({ headings }: ArticleTOCProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      { rootMargin: "0px 0px -80% 0px" },
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100; // Account for header offset
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);
      setIsExpanded(false);
    }
  };

  if (!headings || headings.length === 0) {
    return null;
  }

  return (
    <nav className="flex flex-col" aria-label="Table of contents">
      {/* Mobile view */}
      <div className="mb-8 rounded-md border border-line-200 bg-paper lg:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between px-4 py-3 text-body-sm font-medium text-ink-950"
          aria-expanded={isExpanded}
        >
          <span>Nội dung bài viết</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {isExpanded && (
          <div className="border-t border-line-200 px-4 pt-3 pb-4">
            <TOCList headings={headings} activeId={activeId} onItemClick={handleClick} />
          </div>
        )}
      </div>

      {/* Desktop view */}
      <div className="sticky top-[calc(var(--height-header,5.5rem)+1.5rem)] hidden lg:block">
        <h2 className="mb-4 text-body font-medium tracking-wider text-ink-950 uppercase">
          Nội dung chính
        </h2>
        <div className="border-l-2 border-line-200 pl-4">
          <TOCList headings={headings} activeId={activeId} onItemClick={handleClick} />
        </div>
      </div>
    </nav>
  );
}
