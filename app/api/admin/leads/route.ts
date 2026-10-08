import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getLeads, updateLeadStatus, deleteLead, retryLeadDelivery, writeAuditLog } from "@/lib/db";
import { isSameOrigin, readJsonBody, BodyTooLargeError } from "@/lib/security/request";
import { leadStatusSchema } from "@/lib/validation/admin";
export async function GET(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined;
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 20)));
  const offset = (page - 1) * limit;
  const result = await getLeads({ search, status, limit, offset });
  return NextResponse.json({
    leads: result.items,
    total: result.total,
    page,
    totalPages: Math.ceil(result.total / limit),
  });
}
export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  try {
    const body = await readJsonBody(request, 4096);
    if (body && typeof body === "object" && "action" in body && body.action === "retry_delivery") {
      const id = "id" in body ? body.id : undefined;
      if (
        typeof id !== "number" ||
        !Number.isSafeInteger(id) ||
        id < 1 ||
        Object.keys(body).some((key) => !["id", "action"].includes(key))
      )
        return NextResponse.json({ error: "Invalid retry request" }, { status: 422 });
      if (!(await retryLeadDelivery(id)))
        return NextResponse.json(
          { error: "Chưa đến lịch thử lại, đã vượt giới hạn, hoặc không có delivery lỗi." },
          { status: 409 },
        );
      await writeAuditLog({
        action: "lead.delivery_retry",
        actorId: auth.user.id,
        target: String(id),
      });
      return NextResponse.json({ success: true });
    }
    const parsed = leadStatusSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: "Dữ liệu cập nhật không hợp lệ." }, { status: 422 });
    const { id, status } = parsed.data;
    const success = await updateLeadStatus(Number(id), status);
    if (!success) {
      return NextResponse.json({ error: "Không tìm thấy lead." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof BodyTooLargeError)
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
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
  await deleteLead(Number(id));
  return NextResponse.json({ success: true });
}
