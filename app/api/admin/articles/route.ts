import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getArticles } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isSameOrigin } from "@/lib/security/request";
import { articleCreateSchema } from "@/lib/validation/admin";
import { createArticleFromInput } from "@/lib/services/articles";

export async function GET(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const categoryId = searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined;
  const status = searchParams.get("status") || undefined;
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 20)));
  const offset = (page - 1) * limit;

  const result = getArticles({ search, categoryId, status, limit, offset });

  return NextResponse.json({
    articles: result.items,
    total: result.total,
    page,
    totalPages: Math.ceil(result.total / limit),
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const { user } = auth;
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  try {
    const parsed = articleCreateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Dữ liệu bài viết không hợp lệ." }, { status: 422 });
    const created = createArticleFromInput(parsed.data, user.name);

    revalidatePath("/");
    revalidatePath("/tin-tuc");

    return NextResponse.json({ success: true, article: created });
  } catch (error: unknown) {
    console.error("Create article error:", error);
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed: articles.slug")) {
      return NextResponse.json({ error: "Đường dẫn (slug) bài viết đã tồn tại. Vui lòng chọn đường dẫn khác." }, { status: 409 });
    }
    return NextResponse.json({ error: "Lỗi tạo bài viết." }, { status: 500 });
  }
}
