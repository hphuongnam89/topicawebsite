import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { drainLeadNotificationOutbox } from "@/lib/services/leads";

export async function POST(request: Request) {
  const expected = process.env.LEAD_NOTIFICATION_CRON_SECRET;
  const supplied = request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (
    !expected ||
    !supplied ||
    !timingSafeEqual(
      createHash("sha256").update(expected).digest(),
      createHash("sha256").update(supplied).digest(),
    )
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await drainLeadNotificationOutbox());
  } catch {
    return NextResponse.json({ error: "Notification queue unavailable" }, { status: 503 });
  }
}
