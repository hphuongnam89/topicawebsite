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
    if (
      process.env.NODE_ENV !== "test" &&
      process.env.STUB_NOTIFICATIONS !== "true" &&
      process.env.TELEGRAM_DISABLED !== "true"
    ) {
      const createdAt = new Date().toISOString();
      db.prepare(
        "INSERT INTO lead_notification_outbox (lead_id, available_at, created_at) VALUES (?, ?, ?)",
      ).run(lead.id, createdAt, createdAt);
    }
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
  if (
    process.env.NODE_ENV !== "test" &&
    process.env.STUB_NOTIFICATIONS !== "true" &&
    process.env.TELEGRAM_DISABLED !== "true"
  ) {
    void drainLeadNotificationOutbox(1).catch(() => {
      console.warn("[LeadNotification] Queue dispatch failed; scheduled retry remains available.");
    });
  }

  return { lead, duplicate: false };
}

async function notifyTelegram(lead: {
  fullname: string;
  phone: string;
  email?: string;
  program?: string;
  notes?: string;
}): Promise<boolean> {
  // Không gửi notification thực tế khi đang ở chế độ test hoặc cấu hình vô hiệu hóa
  if (
    process.env.NODE_ENV === "test" ||
    process.env.STUB_NOTIFICATIONS === "true" ||
    process.env.TELEGRAM_DISABLED === "true"
  ) {
    return true;
  }

  try {
    const settings = getSetting<{ telegramBotToken?: string; telegramChatId?: string }>(
      "site_settings",
      {},
    );
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || settings.telegramBotToken;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID || settings.telegramChatId;
    if (!telegramBotToken || !telegramChatId) return false;

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

    const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: telegramChatId, text: message }),
      signal: AbortSignal.timeout(10000),
    });
    return response.ok;
  } catch {
    console.warn("[LeadNotification] Thông báo thất bại; yêu cầu tư vấn đã được lưu trong CMS.");
    return false;
  }
}

export async function drainLeadNotificationOutbox(limit = 10) {
  const db = getDb();
  const now = new Date();
  const nowIso = now.toISOString();
  const safeLimit = Math.max(1, Math.min(50, Math.floor(limit)));
  const leaseUntil = new Date(now.getTime() + safeLimit * 15_000 + 30_000).toISOString();

  db.exec("BEGIN IMMEDIATE");
  let rows: Array<{
    id: number;
    attempts: number;
    fullname: string;
    phone: string;
    email: string | null;
    program: string | null;
    notes: string | null;
  }>;
  try {
    rows = db
      .prepare(
        `
        SELECT o.id, o.attempts, l.fullname, l.phone, l.email, l.program, l.notes
        FROM lead_notification_outbox o JOIN leads l ON l.id = o.lead_id
        WHERE (o.status = 'pending' AND o.available_at <= ?)
           OR (o.status = 'processing' AND o.locked_until <= ?)
        ORDER BY o.id LIMIT ?
      `,
      )
      .all(nowIso, nowIso, safeLimit) as typeof rows;
    for (const row of rows) {
      db.prepare(
        "UPDATE lead_notification_outbox SET status = 'processing', locked_until = ? WHERE id = ?",
      ).run(leaseUntil, row.id);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  let sent = 0;
  let retried = 0;
  let failed = 0;
  for (const row of rows) {
    const delivered = await notifyTelegram({
      fullname: row.fullname,
      phone: row.phone,
      email: row.email ?? undefined,
      program: row.program ?? undefined,
      notes: row.notes ?? undefined,
    });
    if (delivered) {
      db.prepare(
        "UPDATE lead_notification_outbox SET status = 'sent', sent_at = ?, locked_until = NULL, last_error = NULL WHERE id = ?",
      ).run(new Date().toISOString(), row.id);
      sent++;
      continue;
    }

    const attempts = row.attempts + 1;
    const terminal = attempts >= 12;
    const delayMs = Math.min(6 * 60 * 60 * 1000, 60_000 * 2 ** Math.min(attempts - 1, 8));
    db.prepare(
      `
      UPDATE lead_notification_outbox
      SET status = ?, attempts = ?, available_at = ?, locked_until = NULL, last_error = 'delivery_failed'
      WHERE id = ?
    `,
    ).run(
      terminal ? "failed" : "pending",
      attempts,
      new Date(Date.now() + delayMs).toISOString(),
      row.id,
    );
    if (terminal) failed++;
    else retried++;
  }
  return { claimed: rows.length, sent, retried, failed };
}
