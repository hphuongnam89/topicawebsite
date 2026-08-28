import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/components/ui/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("w-full", className)}>
      <ol className="flex flex-wrap items-center gap-2 text-body-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              <li className="flex items-center">
                {isLast ? (
                  <span className="font-semibold text-ink-950" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className="text-ink-600 transition-colors hover:text-brand-700"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
              {!isLast && (
                <li aria-hidden="true" className="flex items-center">
                  <ChevronRight size={14} className="text-ink-400" />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
