import type { SanitizedHtml } from "@/lib/cms/html";
import { cn } from "@/lib/utils";

interface WordPressContentProps {
  html: SanitizedHtml;
  className?: string;
}

export function WordPressContent({ html, className }: WordPressContentProps) {
  if (!html) return null;

  return (
    <div className={cn("article-content", className)} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
