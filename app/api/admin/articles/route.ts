import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getArticles } from "@/lib/db";
import { getRevisionOnlyArticles } from "@/lib/services/admin-content";
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
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 20)));
  const offset = (page - 1) * limit;
  const legacy = getArticles({ search, categoryId, status, limit: 10000, offset: 0 });
  const articles = [...legacy.items, ...getRevisionOnlyArticles({ search, categoryId, status })].sort(
    (left, right) => String(right.updated_at ?? right.published_at).localeCompare(String(left.updated_at ?? left.published_at)),
  );
  const total = articles.length;

  return NextResponse.json({
    articles: articles.slice(offset, offset + limit),
    total,
    page,
    totalPages: Math.ceil(total / limit),
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
    const created = createArticleFromInput(parsed.data, user.name);
    recordAdminAudit(user, "create", "article", String(created.id), [
      "title",
      "slug",
      "content_html",
    ]);

    revalidatePath("/");
    revalidatePath("/tin-tuc");

    return NextResponse.json({ success: true, article: created });
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
