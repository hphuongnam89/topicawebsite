import { createLead, getSetting, type LeadRecord } from "@/lib/db";

interface LeadNotification {
  fullname: string;
  phone: string;
  email?: string;
  program?: string;
  notes?: string;
}

export function submitLead(data: LeadNotification): LeadRecord {
  const lead = createLead(data);
  void notifyTelegram({
    fullname: lead.fullname,
    phone: lead.phone,
    email: lead.email ?? undefined,
    program: lead.program ?? undefined,
    notes: lead.notes ?? undefined,
  });
  return lead;
}

async function notifyTelegram(lead: LeadNotification): Promise<void> {
  try {
    const settings = getSetting<{ telegramBotToken?: string; telegramChatId?: string }>("site_settings", {});
    if (!settings.telegramBotToken || !settings.telegramChatId) return;

    const message = [
      "🎓 *HỌC VIÊN ĐĂNG KÝ TƯ VẤN MỚI*",
      `👤 *Họ tên:* ${lead.fullname}`,
      `📞 *Số điện thoại:* \`${lead.phone}\``,
      lead.email ? `✉️ *Email:* ${lead.email}` : "",
      lead.program ? `📚 *Ngành quan tâm:* ${lead.program}` : "",
      lead.notes ? `📝 *Ghi chú:* ${lead.notes}` : "",
      `⏰ *Thời gian:* ${new Date().toLocaleString("vi-VN")}`,
    ].filter(Boolean).join("\n");

    await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: settings.telegramChatId, text: message, parse_mode: "Markdown" }),
    });
  } catch (error) {
    console.error("Telegram notification failed", error instanceof Error ? error.message : "unknown error");
  }
}
