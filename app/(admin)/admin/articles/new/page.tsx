import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getCategories } from "@/lib/db";
import { redirect } from "next/navigation";
import { ArticleEditorForm } from "@/components/admin/ArticleEditorForm";
export default async function NewArticlePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }
  const categories = await getCategories();
  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-10">
      <ArticleEditorForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        isEdit={false}
      />
    </div>
  );
}
