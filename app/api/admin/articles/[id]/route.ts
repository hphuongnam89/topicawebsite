import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getArticleById, updateArticle, deleteArticle } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const article = getArticleById(Number(id));
  if (!article) {
    return NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });
  }
  return NextResponse.json({ article });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const articleId = Number(id);

  try {
    const body = await request.json();
    const updated = updateArticle(articleId, {
      ...body,
      category_id: body.category_id !== undefined ? (body.category_id ? Number(body.category_id) : null) : undefined,
      is_featured: body.is_featured !== undefined ? (body.is_featured ? 1 : 0) : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: "Không tìm thấy bài viết để cập nhật." }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/tin-tuc");
    if (updated.slug) {
      revalidatePath(`/tin-tuc/${updated.slug}`);
    }

    return NextResponse.json({ success: true, article: updated });
  } catch (error: any) {
    console.error("Update article error:", error);
    if (error.message && error.message.includes("UNIQUE constraint failed: articles.slug")) {
      return NextResponse.json({ error: "Đường dẫn (slug) bài viết đã tồn tại." }, { status: 409 });
    }
    return NextResponse.json({ error: "Lỗi cập nhật bài viết." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const success = deleteArticle(Number(id));
  if (!success) {
    return NextResponse.json({ error: "Không tìm thấy bài viết để xóa." }, { status: 404 });
  }

  revalidatePath("/");
  revalidatePath("/tin-tuc");

  return NextResponse.json({ success: true });
}
