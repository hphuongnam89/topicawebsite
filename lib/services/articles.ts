import { createArticle, updateArticle, type ArticleRecord } from "@/lib/db";
import type { z } from "zod";
import { articleCreateSchema, articleUpdateSchema } from "@/lib/validation/admin";
import { sanitizeWordPressHtml } from "@/lib/cms/html";

type ArticleCreateInput = z.infer<typeof articleCreateSchema>;
type ArticleUpdateInput = z.infer<typeof articleUpdateSchema>;

function serializeTags(tags: ArticleCreateInput["tags"]): string {
  return typeof tags === "string" ? tags : JSON.stringify(tags ?? []);
}

export function createArticleFromInput(
  input: ArticleCreateInput,
  fallbackAuthor: string,
): ArticleRecord {
  return createArticle({
    ...input,
    content_html: sanitizeWordPressHtml(input.content_html),
    excerpt: input.excerpt ?? null,
    featured_image: input.featured_image ?? null,
    category_id: input.category_id ?? null,
    tags: serializeTags(input.tags),
    author_name: input.author_name ?? fallbackAuthor,
    is_featured: input.is_featured ? 1 : 0,
    status: input.status ?? "draft",
    seo_title: input.seo_title ?? null,
    seo_description: input.seo_description ?? null,
    published_at: input.published_at ?? new Date().toISOString(),
  });
}

export function updateArticleFromInput(
  id: number,
  input: ArticleUpdateInput,
): ArticleRecord | null {
  return updateArticle(id, {
    ...input,
    content_html:
      input.content_html === undefined ? undefined : sanitizeWordPressHtml(input.content_html),
    tags: input.tags === undefined ? undefined : serializeTags(input.tags),
    is_featured: input.is_featured === undefined ? undefined : input.is_featured ? 1 : 0,
  });
}
