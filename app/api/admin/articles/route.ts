import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getArticles, createArticle } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
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
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content_html,
      featured_image,
      category_id,
      tags,
      author_name,
      is_featured,
      status,
      seo_title,
      seo_description,
      published_at,
    } = body;

    if (!title || !slug || !content_html) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ tiêu đề, đường dẫn (slug) và nội dung bài viết." },
        { status: 400 }
      );
    }

    const created = createArticle({
      title,
      slug,
      excerpt,
      content_html,
      featured_image,
      category_id: category_id ? Number(category_id) : null,
      tags: typeof tags === "string" ? tags : JSON.stringify(tags || []),
      author_name: author_name || user.name,
      is_featured: is_featured ? 1 : 0,
      status: status || "published",
      seo_title,
      seo_description,
      published_at: published_at || new Date().toISOString(),
    });

    revalidatePath("/");
    revalidatePath("/tin-tuc");

    return NextResponse.json({ success: true, article: created });
  } catch (error: any) {
    console.error("Create article error:", error);
    if (error.message && error.message.includes("UNIQUE constraint failed: articles.slug")) {
      return NextResponse.json({ error: "Đường dẫn (slug) bài viết đã tồn tại. Vui lòng chọn đường dẫn khác." }, { status: 409 });
    }
    return NextResponse.json({ error: "Lỗi tạo bài viết." }, { status: 500 });
  }
}
