import { NextResponse } from "next/server";
import { recordPageView } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { path } = await request.json();
    if (path && typeof path === "string") {
      recordPageView(path);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    // Fail silently for analytics
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
