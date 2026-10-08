import {
  createLeadWithDelivery,
  claimLeadDelivery,
  finishLeadDelivery,
  getSetting,
  type LeadRecord,
} from "@/lib/db";
interface LeadNotification {
  fullname: string;
  phone: string;
  email?: string;
  program?: string;
  notes?: string;
}
export async function submitLead(
  data: LeadNotification & {
    consent: true;
  },
): Promise<LeadRecord> {
  return await createLeadWithDelivery(data);
}
export async function deliverPendingLeadDeliveries(limit = 20): Promise<number> {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100)
    throw new Error("Invalid delivery batch size");
  let processed = 0;
  while (processed < limit) {
    const delivery = await claimLeadDelivery();
    if (!delivery) break;
    const result = await notifyTelegram({
      ...delivery,
      email: delivery.email ?? undefined,
      program: delivery.program ?? undefined,
      notes: delivery.notes ?? undefined,
    });
    await finishLeadDelivery(delivery, result.ok ? undefined : result.error);
    processed++;
  }
  return processed;
}
async function notifyTelegram(lead: LeadNotification): Promise<
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    }
> {
  try {
    const settings = await getSetting<{
      telegramBotToken?: string;
      telegramChatId?: string;
    }>("site_settings", {});
    if (!settings.telegramBotToken || !settings.telegramChatId) {
      return { ok: false, error: "Telegram is not configured" };
    }
    const message = [
      "🎓 HỌC VIÊN ĐĂNG KÝ TƯ VẤN MỚI",
      `👤 Họ tên: ${lead.fullname}`,
      `📞 Số điện thoại: ${lead.phone}`,
      lead.email ? `✉️ Email: ${lead.email}` : "",
      lead.program ? `📚 Ngành quan tâm: ${lead.program}` : "",
      lead.notes ? `📝 Ghi chú: ${lead.notes}` : "",
      `⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}`,
    ]
      .filter(Boolean)
      .join("\n");
    const response = await fetch(
      `https://api.telegram.org/bot${encodeURIComponent(settings.telegramBotToken.trim())}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: settings.telegramChatId.trim(), text: message }),
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!response.ok) return { ok: false, error: `Telegram HTTP ${response.status}` };
    const result = (await response.json()) as {
      ok?: boolean;
    };
    if (result.ok !== true) return { ok: false, error: "Telegram rejected message" };
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error && error.name === "TimeoutError"
          ? "Telegram timeout"
          : "Telegram transport error",
    };
  }
}
