import { LocalizedText } from "@/components/i18n/LocalizedText";
import { LocalizedElement } from "@/components/i18n/LocalizedElement";
import React from "react";
import Link from "@/components/i18n/LocalizedLink";
import { ChevronRight } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { env } from "@/lib/env";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  includeSchema?: boolean;
}

export function Breadcrumbs({ items, className, includeSchema = true }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  const baseUrl = env.NEXT_PUBLIC_SITE_URL || "https://topica.edu.vn";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href
        ? item.href.startsWith("http")
          ? item.href
          : `${baseUrl}${item.href.startsWith("/") ? item.href : `/${item.href}`}`
        : undefined,
    })),
  };

  return (
    <>
      {includeSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <LocalizedElement as="nav" aria-label="Breadcrumb" className={cn("w-full py-2", className)}>
        <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-body-sm text-ink-600">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <React.Fragment key={index}>
                <li className="inline-flex items-center">
                  {isLast ? (
                    <LocalizedElement as="span"
                      className="font-semibold text-ink-950 truncate max-w-[220px] sm:max-w-none"
                      aria-current="page"
                      title={item.label}
                    >
                      <LocalizedText>{item.label}</LocalizedText>
                    </LocalizedElement>
                  ) : (
                    <Link
                      href={item.href || "/"}
                      className="transition-colors hover:text-brand-700 hover:underline"
                    >
                      <LocalizedText>{item.label}</LocalizedText>
                    </Link>
                  )}
                </li>
                {!isLast && (
                  <li aria-hidden="true" className="inline-flex items-center">
                    <ChevronRight size={13} className="text-ink-400 shrink-0" />
                  </li>
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </LocalizedElement>
    </>
  );
}
