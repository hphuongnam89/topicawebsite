import { NextResponse } from "next/server";
import { readBoundedJson } from "@/lib/http/read-json";
import { requireUser, requireAdmin } from "@/lib/auth/guards";
import { getPageById, updatePage, deletePage, getDb } from "@/lib/db";
import { isSameOrigin } from "@/lib/security/request";
import { pageUpdateSchema } from "@/lib/validation/admin";
import { sanitizeWordPressHtml } from "@/lib/cms/html";
import { getRevisions } from "@/lib/services/revisions";
import { recordAdminAudit } from "@/lib/services/admin-audit";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const page = getPageById(Number((await context.params).id));
  return page
    ? NextResponse.json(page)
    : NextResponse.json({ error: "Không tìm thấy trang" }, { status: 404 });
}
export async function PUT(request: Request, context: Context) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const id = Number((await context.params).id);
  if (!Number.isSafeInteger(id) || id < 1)
    return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
  const parsed = pageUpdateSchema.safeParse(
    await readBoundedJson(request, 2_097_152).catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json({ error: "Thông tin trang không hợp lệ" }, { status: 422 });
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const current = getPageById(id);
    if (!current) {
      db.exec("ROLLBACK");
      return NextResponse.json({ error: "Không tìm thấy trang" }, { status: 404 });
    }
    if (
      current.status === "published" ||
      parsed.data.status === "published" ||
      getRevisions("page", String(id)).length
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
        { error: "Trang đã thay đổi hoặc thiếu phiên bản. Tải lại trước khi lưu." },
        { status: 409 },
      );
    }
    const input = {
      ...parsed.data,
      content_html:
        parsed.data.content_html === undefined
          ? undefined
          : sanitizeWordPressHtml(parsed.data.content_html),
    };
    const page = updatePage(id, input);
    recordAdminAudit(
      auth.user,
      "update",
      "page",
      String(id),
      Object.keys(parsed.data).filter((key) => key !== "expected_updated_at"),
    );
    db.exec("COMMIT");
    return NextResponse.json(page);
  } catch {
    db.exec("ROLLBACK");
    return NextResponse.json({ error: "Không lưu được trang" }, { status: 500 });
  }
}
export async function DELETE(request: Request, context: Context) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const id = Number((await context.params).id);
  if (getPageById(id)?.status === "published" || getRevisions("page", String(id)).length)
    return NextResponse.json(
      { error: "Hãy lưu trữ revision thay vì xóa trang công khai" },
      { status: 409 },
    );
  const deleted = deletePage(id);
  if (deleted) recordAdminAudit(auth.user, "delete", "page", String(id), ["record"]);
  return NextResponse.json({ success: deleted });
}
