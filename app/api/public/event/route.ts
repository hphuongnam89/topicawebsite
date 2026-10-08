import { NextResponse } from "next/server";
import { normalizeAnalyticsPath } from "@/lib/security/analytics-path";
import { z } from "zod";
import { recordAnalyticsEvent } from "@/lib/db";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { getRateLimitKey, readJsonBody, BodyTooLargeError } from "@/lib/security/request";
const eventNames = [
    "page_view",
    "hero_primary_cta_click",
    "hero_secondary_cta_click",
    "form_start",
    "form_field_error",
    "form_submit",
    "form_success",
    "form_error",
    "program_card_click",
    "program_cta_click",
    "curriculum_expand",
    "tuition_click",
    "eligibility_click",
    "tuition_info_click",
    "eligibility_check_click",
    "phone_click",
    "zalo_click",
    "official_source_click",
    "faq_open",
    "scroll_depth_25",
    "scroll_depth_50",
    "scroll_depth_75",
    "scroll_depth_90",
] as const;
const MAX_BODY_BYTES = 16 * 1024;
const MAX_PROPERTY_COUNT = 20;
const MAX_PATH_LENGTH = 256;
const eventSchema = z.object({
    name: z.enum(eventNames),
    event_id: z.string().regex(/^[a-zA-Z0-9_-]{16,80}$/).optional(),
    session_id: z.string().regex(/^[a-zA-Z0-9_-]{16,80}$/).optional(),
    properties: z
        .record(z.string().regex(/^[a-zA-Z0-9_.-]{1,64}$/), z.union([z.string().max(200), z.number().finite().gte(-1e9).lte(1e9)]))
        .refine((properties) => Object.keys(properties).length <= MAX_PROPERTY_COUNT)
        .default({}),
    path: z.string().startsWith("/").max(MAX_PATH_LENGTH).optional(),
});
export async function POST(request: Request) {
    try {
        const body = await readJsonBody(request, MAX_BODY_BYTES);
        const client = getRateLimitKey(request);
        if (await consumeRateLimit(`event:${client.key}`, { limit: 240, windowMs: 60 * 60 * 1000 }) !== null) {
            return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
        }
        const parsed = eventSchema.safeParse(body);
        if (!parsed.success)
            return NextResponse.json({ success: false }, { status: 422 });
        const normalizedPath = parsed.data.path === undefined ? undefined : await normalizeAnalyticsPath(parsed.data.path);
        if (normalizedPath === null)
            return NextResponse.json({ success: false }, { status: 422 });
        await recordAnalyticsEvent(parsed.data.name, parsed.data.properties, normalizedPath, parsed.data.event_id, parsed.data.session_id);
        const response = NextResponse.json({ success: true }, { status: 202 });
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
