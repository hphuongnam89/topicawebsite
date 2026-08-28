import { NextResponse } from "next/server";
import { createLead, getSetting } from "@/lib/db";

async function notifyTelegram(lead: {
  fullname: string;
  phone: string;
  email?: string;
  program?: string;
  notes?: string;
}) {
  try {
    const settings = getSetting<any>("site_settings", {});
    const token = settings.telegramBotToken;
    const chatId = settings.telegramChatId;

    if (!token || !chatId) return;

    const message = [
      "🎓 *HỌC VIÊN ĐĂNG KÝ TƯ VẤN MỚI*",
      `👤 *Họ tên:* ${lead.fullname}`,
      `📞 *Số điện thoại:* \`${lead.phone}\``,
      lead.email ? `✉️ *Email:* ${lead.email}` : "",
      lead.program ? `📚 *Ngành quan tâm:* ${lead.program}` : "",
      lead.notes ? `📝 *Ghi chú:* ${lead.notes}` : "",
      `⏰ *Thời gian:* ${new Date().toLocaleString("vi-VN")}`,
    ]
      .filter(Boolean)
      .join("\n");

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });
  } catch (err) {
    console.error("Telegram notification error:", err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullname, phone, email, program, notes } = body;

    if (!fullname || !phone) {
      return NextResponse.json(
        { error: "Vui lòng nhập họ tên và số điện thoại." },
        { status: 400 }
      );
    }

    const lead = createLead({
      fullname: fullname.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : undefined,
      program: program ? program.trim() : undefined,
      notes: notes ? notes.trim() : undefined,
    });

    // Notify in background (non-blocking)
    notifyTelegram({
      fullname: lead.fullname,
      phone: lead.phone,
      email: lead.email ?? undefined,
      program: lead.program ?? undefined,
      notes: lead.notes ?? undefined,
    }).catch(console.error);

    return NextResponse.json({ success: true, id: lead.id });
  } catch (error) {
    console.error("Public lead submit error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi gửi thông tin. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
