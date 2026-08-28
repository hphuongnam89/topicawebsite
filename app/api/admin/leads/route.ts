import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getLeads, updateLeadStatus, deleteLead } from "@/lib/db";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined;
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 20)));
  const offset = (page - 1) * limit;

  const result = getLeads({ search, status, limit, offset });

  return NextResponse.json({
    leads: result.items,
    total: result.total,
    page,
    totalPages: Math.ceil(result.total / limit),
  });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Thiếu thông tin cập nhật." }, { status: 400 });
    }

    const success = updateLeadStatus(Number(id), status);
    if (!success) {
      return NextResponse.json({ error: "Không tìm thấy lead." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update lead error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật trạng thái lead." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Thiếu ID lead." }, { status: 400 });
  }

  deleteLead(Number(id));
  return NextResponse.json({ success: true });
}
