import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getPages, createPage, getPageBySlug } from "@/lib/db";
import { isSameOrigin } from "@/lib/security/request";
import { pageCreateSchema } from "@/lib/validation/admin";
import { sanitizeWordPressHtml } from "@/lib/cms/html";
import { recordAdminAudit } from "@/lib/services/admin-audit";
import { getRevisionOnlyPages } from "@/lib/services/admin-content";
export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const pages = [...getPages(), ...getRevisionOnlyPages()].sort((left, right) =>
    String(right.updated_at ?? right.published_at).localeCompare(String(left.updated_at ?? left.published_at)),
  );
  return NextResponse.json({ pages, totalPages: 1 });
}
export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  try {
    const parsed = pageCreateSchema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json({ error: "Thông tin trang không hợp lệ" }, { status: 422 });
    if (parsed.data.status === "published")
      return NextResponse.json(
        { error: "Lưu nháp rồi gửi duyệt tại mục Nội dung & phê duyệt" },
        { status: 422 },
      );
    if (getPageBySlug(parsed.data.slug))
      return NextResponse.json({ error: "Đường dẫn đã tồn tại" }, { status: 409 });
    const page = createPage({
      ...parsed.data,
      status: "draft",
      content_html: sanitizeWordPressHtml(parsed.data.content_html),
    });
    recordAdminAudit(auth.user, "create", "page", String(page.id), [
      "title",
      "slug",
      "content_html",
    ]);
    return NextResponse.json(page, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Không lưu được trang" }, { status: 500 });
  }
}
