import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getPages, createPage } from "@/lib/db";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const pages = getPages();
    return NextResponse.json({ pages, totalPages: 1 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await request.json();
    if (!data.title || !data.slug || !data.content_html) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newPage = createPage(data);
    return NextResponse.json(newPage, { status: 201 });
  } catch (error: any) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return NextResponse.json({ error: "Đường dẫn (slug) đã tồn tại." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
