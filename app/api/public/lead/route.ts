import { NextResponse } from "next/server";
import { leadApiSchema } from "@/lib/form-schema";
import { submitLead, LeadConflictError } from "@/lib/services/leads";
import { safePublicPath } from "@/lib/analytics-path";
import { readBoundedJson, BodyLimitError } from "@/lib/http/read-json";
import { BoundedRateLimiter, getClientIp } from "@/lib/security/rate-limit";

const leadLimiter = new BoundedRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
  maxKeys: 5000,
});

export async function POST(request: Request) {
  try {
    const origin=request.headers.get("origin");
    if(origin && origin!==new URL(request.url).origin)return NextResponse.json({error:"Invalid origin"},{status:403});
    const clientIp = getClientIp(request);
    const limitStatus = leadLimiter.increment(clientIp);
    if (!limitStatus.allowed) {
      return NextResponse.json(
        { error: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau." },
        {
          status: 429,
          headers: { "Retry-After": String(limitStatus.retryAfterSeconds) },
        }
      );
    }

    let rawBody: any;
    try {
      rawBody = await readBoundedJson(request);
    } catch (error) {
      return NextResponse.json({ error: "Dữ liệu JSON không hợp lệ hoặc quá lớn." }, { status: error instanceof BodyLimitError ? 413 : 400 });
    }

    const parsed = leadApiSchema.safeParse(rawBody);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          error: firstIssue?.message || "Dữ liệu đăng ký không hợp lệ.",
          issues: parsed.error.format(),
        },
        { status: 422 }
      );
    }

    const {
      fullname,
      phone,
      email,
      program,
      educationLevel,
      notes,
      source,
      consent,
      consent_version,
      idempotency_key,
    } = parsed.data;

    const fullNotes = [
      educationLevel ? `Trình độ: ${educationLevel}` : "",
      notes || "",
    ]
      .filter(Boolean)
      .join(" - ") || undefined;

    const { lead, duplicate } = submitLead({
      fullname: fullname.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : undefined,
      program: program ? program.trim() : undefined,
      notes: fullNotes,
      source: safePublicPath(source) ?? undefined,
      consent,
      consent_version,
      idempotency_key: idempotency_key ? idempotency_key.trim() : undefined,
    });

    return NextResponse.json({
      success: true,
      id: lead.id,
      leadId: lead.id,
      duplicate,
      message: duplicate
        ? "Yêu cầu của bạn đã được ghi nhận trước đó."
        : "Đăng ký tư vấn thành công.",
    });

  } catch (error) {
    if (error instanceof LeadConflictError) return NextResponse.json({error: error.message}, {status:409});
    console.error("Public lead submit failed");
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi gửi thông tin. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
