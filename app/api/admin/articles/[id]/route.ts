import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getArticleById, deleteArticle } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isSameOrigin } from "@/lib/security/request";
import { articleUpdateSchema } from "@/lib/validation/admin";
import { updateArticleFromInput } from "@/lib/services/articles";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const article = getArticleById(Number(id));
  if (!article) {
    return NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });
  }
  return NextResponse.json({ article });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  const { id } = await params;
  const articleId = Number(id);

  try {
    const parsed = articleUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Dữ liệu bài viết không hợp lệ." }, { status: 422 });
    const updated = updateArticleFromInput(articleId, parsed.data);

    if (!updated) {
      return NextResponse.json({ error: "Không tìm thấy bài viết để cập nhật." }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/tin-tuc");
    if (updated.slug) {
      revalidatePath(`/tin-tuc/${updated.slug}`);
    }

    return NextResponse.json({ success: true, article: updated });
  } catch (error: unknown) {
    console.error("Update article error:", error);
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed: articles.slug")) {
      return NextResponse.json({ error: "Đường dẫn (slug) bài viết đã tồn tại." }, { status: 409 });
    }
    return NextResponse.json({ error: "Lỗi cập nhật bài viết." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(_request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  const { id } = await params;
  const success = deleteArticle(Number(id));
  if (!success) {
    return NextResponse.json({ error: "Không tìm thấy bài viết để xóa." }, { status: 404 });
  }

  revalidatePath("/");
  revalidatePath("/tin-tuc");

  return NextResponse.json({ success: true });
}
