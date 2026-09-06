import { NextResponse } from "next/server";
import { recordPageView } from "@/lib/db";

const MAX_HITS = 60;
const WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request): string {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(request: Request): boolean {
  const now = Date.now();
  for (const [key, value] of hits) {
    if (value.resetAt <= now) hits.delete(key);
  }
  const key = clientKey(request);
  const current = hits.get(key);
  if (!current || current.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_HITS;
}

export async function POST(request: Request) {
  try {
    if (isRateLimited(request)) {
      // Page-view analytics is non-critical; keep the abuse limit without surfacing
      // expected throttling as a red browser-console error.
      return new NextResponse(null, {
        status: 204,
        headers: { "Cache-Control": "no-store" },
      });
    }
    const { path } = await request.json();
    if (typeof path === "string" && path.startsWith("/") && path.length <= 512) {
      recordPageView(path);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    // Fail silently for analytics
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
