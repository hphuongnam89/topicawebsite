import {
  createLead,
  getLeadByIdempotencyKey,
  findRecentDuplicateLead,
  getSetting,
  getDb,
  type LeadRecord,
} from "@/lib/db";
import { leadPrograms } from "@/data/lead-options";
import { recordAnalyticsEvent } from "./cms-models";

export interface SubmitLeadInput {
  fullname: string;
  phone: string;
  email?: string;
  program?: string;
  notes?: string;
  consent?: boolean;
  consent_version?: string;
  source?: string;
  idempotency_key?: string;
}

export interface SubmitLeadResult {
  lead: LeadRecord;
  duplicate: boolean;
}
export class LeadConflictError extends Error {}
function sameSubmission(lead: LeadRecord, data: SubmitLeadInput) {
  return (
    lead.phone === data.phone &&
    lead.fullname === data.fullname &&
    (lead.program || "undecided") === (data.program || "undecided") &&
    (lead.email || "") === (data.email || "") &&
    (lead.notes || "") === (data.notes || "")
  );
}

export function submitLead(data: SubmitLeadInput): SubmitLeadResult {
  if (data.consent !== true) throw new Error("Consent is required");
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  let lead: LeadRecord;
  try {
    // 1. Kiểm tra Idempotency theo idempotency_key (chống duplicate click / retry)
    if (data.idempotency_key) {
      const existing = getLeadByIdempotencyKey(data.idempotency_key);
      if (existing) {
        if (!sameSubmission(existing, data)) {
          throw new LeadConflictError("Yêu cầu đã thay đổi. Vui lòng gửi lại với mã yêu cầu mới.");
        }
        db.exec("COMMIT");
        return { lead: existing, duplicate: true };
      }
    }

    // 2. Chống double-submit nhanh cùng số điện thoại và ngành trong 30 giây
    const recent = findRecentDuplicateLead(data.phone, data.program, 30);
    if (recent && sameSubmission(recent, data)) {
      db.exec("COMMIT");
      return { lead: recent, duplicate: true };
    }

    // 3. Lưu lead an toàn vào cơ sở dữ liệu
    lead = createLead(data);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  // 4. Bắn thông báo nội bộ bất đồng bộ (Lỗi notification không ảnh hưởng tới kết quả lưu lead)
  try {
    recordAnalyticsEvent({
      eventName: "form_submit",
      pagePath: lead.source || "/",
      programId:
        leadPrograms.find((row) => row.id === lead.program || row.label === lead.program)?.id ||
        "undecided",
    });
  } catch {
    console.warn("[Analytics] Không ghi được sự kiện; yêu cầu tư vấn đã được lưu.");
  }
  void notifyTelegram({
    fullname: lead.fullname,
    phone: lead.phone,
    email: lead.email ?? undefined,
    program: lead.program ?? undefined,
    notes: lead.notes ?? undefined,
  }).catch(() => {
    // Không ném lỗi ra ngoài làm sai lệch trạng thái lưu lead
  });

  return { lead, duplicate: false };
}

async function notifyTelegram(lead: {
  fullname: string;
  phone: string;
  email?: string;
  program?: string;
  notes?: string;
}): Promise<void> {
  // Không gửi notification thực tế khi đang ở chế độ test hoặc cấu hình vô hiệu hóa
  if (
    process.env.NODE_ENV === "test" ||
    process.env.STUB_NOTIFICATIONS === "true" ||
    process.env.TELEGRAM_DISABLED === "true"
  ) {
    return;
  }

  try {
    const settings = getSetting<{ telegramBotToken?: string; telegramChatId?: string }>(
      "site_settings",
      {},
    );
    if (!settings.telegramBotToken || !settings.telegramChatId) return;

    const message = [
      "🎓 *HỌC VIÊN ĐĂNG KÝ TƯ VẤN MỚI*",
      `👤 *Họ tên:* ${lead.fullname}`,
      `📞 *Số điện thoại:* \`${lead.phone}\``,
      lead.email ? `✉️ *Email:* ${lead.email}` : "",
      lead.program
        ? `📚 Ngành quan tâm: ${leadPrograms.find((item) => item.id === lead.program)?.label ?? lead.program}`
        : "",
      lead.notes ? `📝 *Ghi chú:* ${lead.notes}` : "",
      `⏰ *Thời gian:* ${new Date().toLocaleString("vi-VN")}`,
    ]
      .filter(Boolean)
      .join("\n");

    const response = await fetch(
      `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: settings.telegramChatId, text: message }),
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!response.ok) throw new Error("Provider rejected notification");
  } catch {
    console.warn("[LeadNotification] Thông báo thất bại; yêu cầu tư vấn đã được lưu trong CMS.");
  }
}
