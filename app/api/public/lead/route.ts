import { NextResponse } from "next/server";
import { leadApiSchema } from "@/lib/form-schema";
import { submitLead } from "@/lib/services/leads";
import { getRateLimitKey, readJsonBody, BodyTooLargeError } from "@/lib/security/request";
import { consumeRateLimit } from "@/lib/security/rate-limit";
const MAX_SUBMISSIONS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_BODY_BYTES = 32 * 1024;
export async function POST(request: Request) {
    try {
        const parsed = leadApiSchema.safeParse(await readJsonBody(request, MAX_BODY_BYTES));
        if (!parsed.success)
            return NextResponse.json({ error: "Dữ liệu đăng ký không hợp lệ." }, { status: 422 });
        const rateLimit = getRateLimitKey(request);
        const retryAfter = await consumeRateLimit(`lead:${rateLimit.key}`, {
            limit: MAX_SUBMISSIONS,
            windowMs: WINDOW_MS,
        });
        const phoneRetryAfter = await consumeRateLimit(`lead:phone:${parsed.data.phone.replace(/\D/g, "").replace(/^84/, "0")}`, { limit: MAX_SUBMISSIONS, windowMs: WINDOW_MS });
        if (retryAfter !== null || phoneRetryAfter !== null) {
            const response = NextResponse.json({ error: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau." }, {
                status: 429,
                headers: { "Retry-After": String(retryAfter ?? phoneRetryAfter) },
            });
            if (rateLimit.setCookie)
                response.headers.append("Set-Cookie", rateLimit.setCookie);
            return response;
        }
        const { fullname, phone, email, program, program_name, program_code, program_direction, notes, source, medium, campaign, content, term, landing_page, referrer, submitted_at, device_type, consent, } = parsed.data;
        const attribution = { source, medium, campaign, content, term, landing_page, referrer, submitted_at, device_type };
        const attributionNote = Object.values(attribution).some(Boolean)
            ? `\nAttribution: ${JSON.stringify(attribution)}`
            : "";
        const lead = await submitLead({
            fullname: fullname.trim(),
            phone: phone.trim(),
            email: email ? email.trim() : undefined,
            program: (program_name || program)?.trim() || undefined,
            notes: `${notes ? notes.trim() : ""}${program_code ? `\nMã ngành: ${program_code}` : ""}${program_direction ? `\nĐịnh hướng: ${program_direction}` : ""}${attributionNote}`.trim() ||
                undefined,
            consent,
        });
        const response = NextResponse.json({ success: true, id: lead.id });
        if (rateLimit.setCookie)
            response.headers.append("Set-Cookie", rateLimit.setCookie);
        return response;
    }
    catch (error) {
        if (error instanceof BodyTooLargeError)
            return NextResponse.json({ error: "Dữ liệu gửi lên quá lớn." }, { status: 413 });
        if (error instanceof SyntaxError)
            return NextResponse.json({ error: "JSON không hợp lệ." }, { status: 400 });
        console.error("Public lead submit error:", error);
        return NextResponse.json({ error: "Đã xảy ra lỗi khi gửi thông tin. Vui lòng thử lại sau." }, { status: 500 });
    }
}
