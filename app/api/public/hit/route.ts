import { NextResponse } from "next/server";
import { recordPageView } from "@/lib/db";
import { getRateLimitKey, readJsonBody, BodyTooLargeError } from "@/lib/security/request";
import { normalizeAnalyticsPath } from "@/lib/security/analytics-path";
import { consumeRateLimit } from "@/lib/security/rate-limit";
const MAX_HITS = 60;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_BODY_BYTES = 2 * 1024;
export async function POST(request: Request) {
    try {
        const body = await readJsonBody(request, MAX_BODY_BYTES);
        const client = getRateLimitKey(request);
        if (await consumeRateLimit(`hit:${client.key}`, { limit: MAX_HITS, windowMs: WINDOW_MS }) !== null) {
            // Page-view analytics is non-critical; keep the abuse limit without surfacing
            // expected throttling as a red browser-console error.
            return new NextResponse(null, {
                status: 204,
                headers: { "Cache-Control": "no-store" },
            });
        }
        const normalizedPath = await normalizeAnalyticsPath(body && typeof body === "object" ? (body as {
            path?: unknown;
        }).path : undefined);
        if (!normalizedPath)
            return NextResponse.json({ success: false }, { status: 422 });
        await recordPageView(normalizedPath);
        const response = NextResponse.json({ success: true });
        if (client.setCookie)
            response.headers.append("Set-Cookie", client.setCookie);
        return response;
    }
    catch (error) {
        if (error instanceof BodyTooLargeError)
            return new NextResponse(null, { status: 413 });
        return NextResponse.json({ success: false }, { status: 400 });
    }
}
