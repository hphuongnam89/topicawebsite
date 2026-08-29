import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getPageById } from "@/lib/db";
import { redirect } from "next/navigation";
import { PageEditorForm } from "@/components/admin/PageEditorForm";
import { PageRecord } from "@/lib/db/types";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }

  const resolvedParams = await params;
  const pageId = parseInt(resolvedParams.id, 10);
  if (isNaN(pageId)) {
    redirect("/admin/pages");
  }

  const pageRecord = getPageById(pageId) as PageRecord | null;
  if (!pageRecord) {
    redirect("/admin/pages");
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageEditorForm
        initialData={{
          id: pageRecord.id,
          title: pageRecord.title,
          slug: pageRecord.slug,
          excerpt: pageRecord.excerpt || "",
          content_html: pageRecord.content_html,
          featured_image: pageRecord.featured_image || "",
          status: (pageRecord.status as "published" | "draft") || "published",
          seo_title: pageRecord.seo_title || "",
          seo_description: pageRecord.seo_description || "",
          published_at: pageRecord.published_at || new Date().toISOString(),
        }}
        isEdit={true}
      />
    </div>
  );
}
