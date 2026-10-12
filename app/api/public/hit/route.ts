import { NextResponse } from "next/server";
import { recordPageView } from "@/lib/db";
import { safePublicPath } from "@/lib/analytics-path";
import { readBoundedJson, BodyLimitError } from "@/lib/http/read-json";

export async function POST(request: Request) {
  try {
    const origin=request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return NextResponse.json({success:false},{status:403});
    const body = await readBoundedJson(request);
    const path = safePublicPath(body && typeof body === "object" ? (body as {path?:unknown}).path : null);
    if (!path) return NextResponse.json({success:false},{status:422});
    recordPageView(path);
    return NextResponse.json({ success: true });
  } catch (error) {
    // Fail silently for analytics
    return NextResponse.json({ success: false }, { status: error instanceof BodyLimitError ? 413 : 400 });
  }
}
