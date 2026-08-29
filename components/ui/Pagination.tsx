import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "./cn";

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  className,
  ...props
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}page=${page}`;
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      pages.push(
        <PaginationItem key="1" page={1} current={currentPage === 1} href={getPageUrl(1)} />,
      );
      if (startPage > 2) {
        pages.push(<PaginationEllipsis key="ellipsis-start" />);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i} page={i} current={currentPage === i} href={getPageUrl(i)} />,
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<PaginationEllipsis key="ellipsis-end" />);
      }
      pages.push(
        <PaginationItem
          key={totalPages}
          page={totalPages}
          current={currentPage === totalPages}
          href={getPageUrl(totalPages)}
        />,
      );
    }

    return pages;
  };

  return (
    <nav
      aria-label="Điều hướng trang"
      className={cn("flex flex-wrap items-center justify-center gap-1 sm:gap-2", className)}
      {...props}
    >
      <PaginationNavButton
        href={currentPage > 1 ? getPageUrl(currentPage - 1) : undefined}
        disabled={currentPage <= 1}
        direction="prev"
      />
      {renderPageNumbers()}
      <PaginationNavButton
        href={currentPage < totalPages ? getPageUrl(currentPage + 1) : undefined}
        disabled={currentPage >= totalPages}
        direction="next"
      />
    </nav>
  );
}

function PaginationItem({ page, current, href }: { page: number; current: boolean; href: string }) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg border text-body-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:h-10 sm:w-10 sm:text-body",
        current
          ? "border-brand-500 bg-brand-500 font-bold text-white"
          : "border-line-200 bg-canvas font-medium text-ink-600 hover:border-brand-500 hover:text-brand-700",
      )}
    >
      {page}
    </Link>
  );
}

function PaginationEllipsis() {
  return (
    <span className="flex h-9 w-9 items-center justify-center text-ink-400 sm:h-10 sm:w-10">
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">Thêm trang</span>
    </span>
  );
}

function PaginationNavButton({
  href,
  disabled,
  direction,
}: {
  href?: string;
  disabled: boolean;
  direction: "prev" | "next";
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  const label = direction === "prev" ? "Trang trước" : "Trang tiếp theo";

  if (disabled || !href) {
    return (
      <button
        disabled
        aria-label={label}
        className="text-ink-300 flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-lg border border-line-200 bg-paper sm:h-10 sm:w-10"
      >
        <Icon className="h-5 w-5" />
      </button>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-line-200 bg-canvas text-ink-600 transition-colors hover:border-brand-500 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:h-10 sm:w-10"
    >
      <Icon className="h-5 w-5" />
    </Link>
  );
}
