import { getCurrentUser } from "@/lib/auth/session";
import { verifyPreviewToken } from "@/lib/auth/preview";
import { getRevisionById } from "@/lib/services/revisions";
import { notFound } from "next/navigation";
import { CmsPageView } from "@/components/cms/CmsPageView";
import { sanitizeWordPressHtml } from "@/lib/cms/html";
import Link from "next/link";
import { fieldLabels } from "@/components/admin/content-fields";
export const metadata = { title: "Xem trước nội dung", robots: { index: false, follow: false } };
export default async function Preview({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) notFound();
  const id = Number((await params).id),
    revision = getRevisionById(id),
    token = (await searchParams).token;
  if (!revision || !token || !verifyPreviewToken(token, user.id, id, revision.updated_at))
    notFound();
  const payload = JSON.parse(revision.payload);
  return (
    <div className="min-w-0">
      <div role="status" className="border-b border-gold-600 bg-gold-100 p-4 text-navy-950">
        Xem trước bản {revision.version} — {revision.workflow_state}. Chưa thay đổi trang công khai.{" "}
        <Link className="underline" href="/admin/content">
          Thoát xem trước
        </Link>
      </div>
      {revision.entity_type === "article" || revision.entity_type === "page" ? (
        <CmsPageView
          showAdmissionCTA={false}
          page={{
            id,
            slug: payload.slug || "preview",
            title: payload.title || revision.title,
            sourceUrl: "",
            contentHtml: sanitizeWordPressHtml(payload.content_html || ""),
            publishedAt: revision.created_at,
            updatedAt: revision.updated_at,
            excerpt: payload.excerpt || "",
          }}
        />
      ) : (
        <section className="m-4 rounded-xl bg-white p-6 sm:m-8">
          <h1 className="text-h2 font-bold">{revision.title}</h1>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {Object.entries(payload)
              .filter(([key]) => !["created_at", "updated_at", "id", "version"].includes(key))
              .map(([key, value]) => (
                <div key={key} className="min-w-0 border-b pb-3">
                  <dt className="text-sm text-ink-600">{fieldLabels[key] || key}</dt>
                  <dd className="break-words text-ink-950">
                    {typeof value === "object" ? JSON.stringify(value) : String(value ?? "—")}
                  </dd>
                </div>
              ))}
          </dl>
        </section>
      )}
    </div>
  );
}
