import { NextResponse } from "next/server";
import { readBoundedJson } from "@/lib/http/read-json";
import { requireUser } from "@/lib/auth/guards";
import { getPages, createPage, getPageBySlug } from "@/lib/db";
import { isSameOrigin } from "@/lib/security/request";
import { pageCreateSchema } from "@/lib/validation/admin";
import { sanitizeWordPressHtml } from "@/lib/cms/html";
import { recordAdminAudit } from "@/lib/services/admin-audit";
import { getRevisionOnlyPages } from "@/lib/services/admin-content";
export async function GET(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(request.url);
  const rawPage = Number(searchParams.get("page") || 1);
  const rawLimit = Number(searchParams.get("limit") || 50);
  const page = Number.isFinite(rawPage) ? Math.max(1, Math.trunc(rawPage)) : 1;
  const limit = Number.isFinite(rawLimit) ? Math.min(100, Math.max(1, Math.trunc(rawLimit))) : 50;
  const offset = (page - 1) * limit;

  const allPages = [...getPages(), ...getRevisionOnlyPages()].sort((left, right) =>
    String(right.updated_at ?? right.published_at).localeCompare(
      String(left.updated_at ?? left.published_at),
    ),
  );
  const total = allPages.length;
  const items = allPages.slice(offset, offset + limit);

  return NextResponse.json({
    pages: items,
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  });
}
export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  try {
    const parsed = pageCreateSchema.safeParse(await readBoundedJson(request, 2_097_152));
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
