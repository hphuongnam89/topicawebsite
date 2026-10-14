import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getLeads, updateLeadStatus, deleteLead } from "@/lib/db";
import { isSameOrigin } from "@/lib/security/request";
import { leadStatusSchema } from "@/lib/validation/admin";
import { recordAdminAudit } from "@/lib/services/admin-audit";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined;
  const rawPage = Number(searchParams.get("page") || 1);
  const rawLimit = Number(searchParams.get("limit") || 20);
  const isExport = searchParams.get("export") === "true";
  const page = Number.isFinite(rawPage) ? Math.max(1, Math.trunc(rawPage)) : 1;
  const limit = isExport
    ? 10000
    : Number.isFinite(rawLimit)
      ? Math.min(50, Math.max(1, Math.trunc(rawLimit)))
      : 20;
  const offset = (page - 1) * limit;

  const result = getLeads({ search, status, limit, offset });

  return NextResponse.json({
    leads: result.items,
    items: result.items,
    total: result.total,
    page,
    limit,
    totalPages: Math.ceil(result.total / limit) || 1,
  });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  try {
    const parsed = leadStatusSchema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json({ error: "Dữ liệu cập nhật không hợp lệ." }, { status: 422 });
    const { id, status } = parsed.data;

    const success = updateLeadStatus(Number(id), status);
    if (!success) {
      return NextResponse.json({ error: "Không tìm thấy lead." }, { status: 404 });
    }
    recordAdminAudit(auth.user, "update", "lead", String(id), ["status"]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update lead error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật trạng thái lead." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Thiếu ID lead." }, { status: 400 });
  }

  const deleted = deleteLead(Number(id));
  if (!deleted) return NextResponse.json({ error: "Không tìm thấy lead." }, { status: 404 });
  recordAdminAudit(auth.user, "delete", "lead", id, ["record"]);
  return NextResponse.json({ success: true });
}
