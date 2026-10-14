import { NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin } from "@/lib/security/request";
import { readBoundedJson, BodyLimitError } from "@/lib/http/read-json";
import { recordAnalyticsEvent } from "@/lib/services/cms-models";
import { BoundedRateLimiter, getClientIp } from "@/lib/security/rate-limit";

const eventsLimiter = new BoundedRateLimiter({
  windowMs: 60 * 1000,
  maxAttempts: 60,
  maxKeys: 10000,
});

const eventSchema = z
  .object({
    eventName: z.enum(["cta_click", "search"]),
    pagePath: z.string().max(2048),
    button: z.enum(["admission", "consultation", "program", "contact"]).optional(),
  })
  .strict();

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ success: false }, { status: 403 });

  const clientIp = getClientIp(request);
  const limitStatus = eventsLimiter.increment(clientIp);
  if (!limitStatus.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(limitStatus.retryAfterSeconds) },
      },
    );
  }

  try {
    const data = eventSchema.safeParse(await readBoundedJson(request, 4096));
    if (!data.success) return NextResponse.json({ success: false }, { status: 422 });
    recordAnalyticsEvent({
      ...data.data,
      metadata: data.data.button ? { button: data.data.button } : undefined,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false },
      { status: error instanceof BodyLimitError ? 413 : 400 },
    );
  }
}
