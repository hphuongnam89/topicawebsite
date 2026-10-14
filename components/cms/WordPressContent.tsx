"use client";
import type { SanitizedHtml } from "@/lib/cms/html";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { translateHtml } from "@/lib/i18n/translate";

interface WordPressContentProps {
  html: SanitizedHtml;
  className?: string;
}

export function WordPressContent({ html, className }: WordPressContentProps) {
  const { locale } = useLanguage();
  if (!html) return null;

  return (
    <div
      className={cn("article-content prose-editorial", className)}
      dangerouslySetInnerHTML={{ __html: translateHtml(html, locale) }}
    />
  );
}
