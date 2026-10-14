import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getArticleById, deleteArticle, getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isSameOrigin } from "@/lib/security/request";
import { articleUpdateSchema } from "@/lib/validation/admin";
import { updateArticleFromInput } from "@/lib/services/articles";
import { getRevisions } from "@/lib/services/revisions";
import { recordAdminAudit } from "@/lib/services/admin-audit";

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
  if (!isSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  const { id } = await params;
  const articleId = Number(id);
  if (!Number.isSafeInteger(articleId) || articleId < 1)
    return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });

  try {
    const parsed = articleUpdateSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success)
      return NextResponse.json({ error: "Dữ liệu bài viết không hợp lệ." }, { status: 422 });

    const db = getDb();
    db.exec("BEGIN IMMEDIATE");
    try {
      const current = getArticleById(articleId);
      if (!current) {
        db.exec("ROLLBACK");
        return NextResponse.json(
          { error: "Không tìm thấy bài viết để cập nhật." },
          { status: 404 },
        );
      }
      if (
        current.status === "published" ||
        parsed.data.status === "published" ||
        getRevisions("article", String(articleId)).length
      ) {
        db.exec("ROLLBACK");
        return NextResponse.json(
          { error: "Tạo bản nháp revision để sửa và duyệt nội dung công khai" },
          { status: 409 },
        );
      }
      if (
        !parsed.data.expected_updated_at ||
        parsed.data.expected_updated_at !== current.updated_at
      ) {
        db.exec("ROLLBACK");
        return NextResponse.json(
          { error: "Bài viết đã thay đổi hoặc thiếu phiên bản. Tải lại trước khi lưu." },
          { status: 409 },
        );
      }
      const updated = updateArticleFromInput(articleId, parsed.data);
      if (!updated) {
        db.exec("ROLLBACK");
        return NextResponse.json(
          { error: "Không tìm thấy bài viết để cập nhật." },
          { status: 404 },
        );
      }
      recordAdminAudit(
        auth.user,
        "update",
        "article",
        String(articleId),
        Object.keys(parsed.data).filter((k) => k !== "expected_updated_at"),
      );

      db.exec("COMMIT");

      revalidatePath("/");
      revalidatePath("/tin-tuc");
      if (updated.slug) {
        revalidatePath(`/tin-tuc/${updated.slug}`);
      }

      return NextResponse.json({ success: true, article: updated });
    } catch (innerError) {
      db.exec("ROLLBACK");
      throw innerError;
    }
  } catch (error: unknown) {
    console.error("Update article error:", error);
    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed: articles.slug")
    ) {
      return NextResponse.json({ error: "Đường dẫn (slug) bài viết đã tồn tại." }, { status: 409 });
    }
    return NextResponse.json({ error: "Lỗi cập nhật bài viết." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(_request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  if (auth.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (getArticleById(Number(id))?.status === "published" || getRevisions("article", id).length)
    return NextResponse.json({ error: "Lưu trữ nội dung qua luồng phê duyệt" }, { status: 409 });
  const success = deleteArticle(Number(id));
  if (!success) {
    return NextResponse.json({ error: "Không tìm thấy bài viết để xóa." }, { status: 404 });
  }
  recordAdminAudit(auth.user, "delete", "article", String(id), ["record"]);

  revalidatePath("/");
  revalidatePath("/tin-tuc");

  return NextResponse.json({ success: true });
}
