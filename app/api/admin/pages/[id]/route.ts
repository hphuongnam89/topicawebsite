import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getPageById, updatePage, deletePage } from "@/lib/db";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await context.params;
  const id = parseInt(resolvedParams.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const page = getPageById(id);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(page);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await context.params;
  const id = parseInt(resolvedParams.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const data = await request.json();
    const updated = updatePage(id, data);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return NextResponse.json({ error: "Đường dẫn (slug) đã tồn tại." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await context.params;
  const id = parseInt(resolvedParams.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const success = deletePage(id);
  if (!success) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
