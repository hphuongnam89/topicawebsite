import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getCategories, createCategory, deleteCategory } from "@/lib/db";
import { isSameOrigin } from "@/lib/security/request";
import { categorySchema } from "@/lib/validation/admin";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const categories = getCategories();
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  try {
    const parsed = categorySchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Dữ liệu danh mục không hợp lệ." }, { status: 422 });
    const { name, slug, description } = parsed.data;

    const created = createCategory(name.trim(), slug.trim(), description?.trim());
    return NextResponse.json({ success: true, category: created });
  } catch (error: unknown) {
    console.error("Create category error:", error);
    if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
      return NextResponse.json({ error: "Đường dẫn danh mục đã tồn tại." }, { status: 409 });
    }
    return NextResponse.json({ error: "Lỗi tạo danh mục." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Thiếu ID danh mục." }, { status: 400 });
  }

  deleteCategory(Number(id));
  return NextResponse.json({ success: true });
}
