import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getArticleById, getCategories } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { ArticleEditorForm } from "@/components/admin/ArticleEditorForm";

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const article = getArticleById(Number(id));

  if (!article) {
    notFound();
  }

  const categories = getCategories();

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <ArticleEditorForm
        isEdit={true}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        initialData={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt || "",
          content_html: article.content_html,
          featured_image: article.featured_image || "",
          category_id: article.category_id,
          tags: article.tags || "",
          author_name: article.author_name || "Ban Biên Tập Topica",
          is_featured: article.is_featured === 1,
          status: (article.status as "published" | "draft") || "published",
          seo_title: article.seo_title || "",
          seo_description: article.seo_description || "",
          published_at: article.published_at,
        }}
      />
    </div>
  );
}
