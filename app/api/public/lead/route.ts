import { NextResponse } from "next/server";
import { leadApiSchema } from "@/lib/form-schema";
import { submitLead } from "@/lib/services/leads";

const MAX_SUBMISSIONS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const submissions = new Map<string, { count: number; resetAt: number }>();

function getClientKey(request: Request): string {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "unknown";
}

function consumeSubmission(request: Request): number | null {
  const key = getClientKey(request);
  const now = Date.now();
  for (const [storedKey, value] of submissions) {
    if (value.resetAt <= now) submissions.delete(storedKey);
  }
  if (!submissions.has(key) && submissions.size >= 10_000) return 3600;
  const entry = submissions.get(key);
  if (!entry || entry.resetAt <= now) {
    submissions.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }
  if (entry.count >= MAX_SUBMISSIONS) return Math.ceil((entry.resetAt - now) / 1000);
  entry.count += 1;
  return null;
}

export async function POST(request: Request) {
  try {
    const retryAfter = consumeSubmission(request);
    if (retryAfter !== null) {
      return NextResponse.json({ error: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau." }, {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      });
    }

    const parsed = leadApiSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Dữ liệu đăng ký không hợp lệ." }, { status: 422 });
    const {
      fullname,
      phone,
      email,
      program,
      program_name,
      program_code,
      program_direction,
      notes,
      source,
      medium,
      campaign,
      content,
      term,
      landing_page,
      referrer,
      submitted_at,
      device_type,
    } = parsed.data;
    const attribution = { source, medium, campaign, content, term, landing_page, referrer, submitted_at, device_type };
    const attributionNote = Object.values(attribution).some(Boolean)
      ? `\nAttribution: ${JSON.stringify(attribution)}`
      : "";

    const lead = submitLead({
      fullname: fullname.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : undefined,
      program: (program_name || program)?.trim() || undefined,
      notes:
        `${notes ? notes.trim() : ""}${program_code ? `\nMã ngành: ${program_code}` : ""}${program_direction ? `\nĐịnh hướng: ${program_direction}` : ""}${attributionNote}`.trim() ||
        undefined,
    });

    return NextResponse.json({ success: true, id: lead.id });
  } catch (error) {
    console.error("Public lead submit error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi gửi thông tin. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
