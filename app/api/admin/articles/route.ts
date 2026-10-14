import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getArticles, getArticleBySlug } from "@/lib/db";
import { getAllAdminArticles } from "@/lib/services/admin-content";
import { revalidatePath } from "next/cache";
import { isSameOrigin } from "@/lib/security/request";
import { articleCreateSchema } from "@/lib/validation/admin";
import { createArticleFromInput } from "@/lib/services/articles";
import { recordAdminAudit } from "@/lib/services/admin-audit";

export async function GET(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const categoryId = searchParams.get("categoryId")
    ? Number(searchParams.get("categoryId"))
    : undefined;
  const status = searchParams.get("status") || undefined;
  const rawPage = Number(searchParams.get("page") || 1);
  const rawLimit = Number(searchParams.get("limit") || 20);
  const page = Number.isFinite(rawPage) ? Math.max(1, Math.trunc(rawPage)) : 1;
  const limit = Number.isFinite(rawLimit) ? Math.min(50, Math.max(1, Math.trunc(rawLimit))) : 20;
  const offset = (page - 1) * limit;
  const articles = getAllAdminArticles({ search, categoryId, status });
  const total = articles.length;
  const items = articles.slice(offset, offset + limit);

  return NextResponse.json({
    articles: items,
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
  const { user } = auth;
  if (!isSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  try {
    const parsed = articleCreateSchema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json({ error: "Dữ liệu bài viết không hợp lệ." }, { status: 422 });
    if (parsed.data.status === "published")
      return NextResponse.json(
        { error: "Lưu nháp rồi gửi duyệt tại mục Nội dung & phê duyệt" },
        { status: 422 },
      );
    if (getArticleBySlug(parsed.data.slug))
      return NextResponse.json(
        { error: "Đường dẫn (slug) bài viết đã tồn tại. Vui lòng chọn đường dẫn khác." },
        { status: 409 },
      );
    const created = createArticleFromInput({ ...parsed.data, status: "draft" }, user.name);
    recordAdminAudit(user, "create", "article", String(created.id), [
      "title",
      "slug",
      "content_html",
    ]);

    revalidatePath("/");
    revalidatePath("/tin-tuc");

    return NextResponse.json({ success: true, article: created }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create article error:", error);
    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed: articles.slug")
    ) {
      return NextResponse.json(
        { error: "Đường dẫn (slug) bài viết đã tồn tại. Vui lòng chọn đường dẫn khác." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Lỗi tạo bài viết." }, { status: 500 });
  }
}
