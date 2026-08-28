import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getCategories, createCategory, deleteCategory } from "@/lib/db";

export async function GET() {
  const categories = getCategories();
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, slug, description } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Tên và đường dẫn danh mục là bắt buộc." }, { status: 400 });
    }

    const created = createCategory(name.trim(), slug.trim(), description?.trim());
    return NextResponse.json({ success: true, category: created });
  } catch (error: any) {
    console.error("Create category error:", error);
    if (error.message && error.message.includes("UNIQUE constraint")) {
      return NextResponse.json({ error: "Đường dẫn danh mục đã tồn tại." }, { status: 409 });
    }
    return NextResponse.json({ error: "Lỗi tạo danh mục." }, { status: 500 });
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
    return NextResponse.json({ error: "Thiếu ID danh mục." }, { status: 400 });
  }

  deleteCategory(Number(id));
  return NextResponse.json({ success: true });
}
