import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getSetting, setSetting } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isSameOrigin } from "@/lib/security/request";
import { recordAdminAudit } from "@/lib/services/admin-audit";
import { z } from "zod";

const DEFAULT_SETTINGS = {
  hotline: "1800 646 857",
  email: "tuyensinh@topicauni.edu.vn",
  address: "27 Lê Văn Lương, Phường Nhân Chính, Quận Thanh Xuân, Hà Nội",
  facebook: "https://www.facebook.com/topica.edu.vn",
  youtube: "https://www.youtube.com/user/TopicaVietnam",
  zalo: "https://zalo.me/topica",
  siteTitle: "Viện Đào tạo Quốc tế Topica – Trường Đại học Phú Xuân",
  siteDescription:
    "Chương trình đào tạo cử nhân trực tuyến chuẩn quốc gia do Trường Đại học Phú Xuân cấp bằng, hợp tác cùng Viện Đào tạo Quốc tế Topica.",
  telegramBotToken: "",
  telegramChatId: "",
};

export const siteSettingsSchema = z
  .object({
    hotline: z.string().trim().min(1).max(50),
    email: z.string().trim().min(1).max(100),
    address: z.string().trim().min(1).max(500),
    facebook: z.string().trim().max(500).optional().or(z.literal("")),
    youtube: z.string().trim().max(500).optional().or(z.literal("")),
    zalo: z.string().trim().max(500).optional().or(z.literal("")),
    siteTitle: z.string().trim().min(1).max(300),
    siteDescription: z.string().trim().min(1).max(1000),
    telegramBotToken: z.string().trim().max(200).optional().or(z.literal("")),
    telegramChatId: z.string().trim().max(100).optional().or(z.literal("")),
  })
  .strict();

export const settingsPayloadSchema = z.union([
  z.object({ settings: siteSettingsSchema }).strict(),
  siteSettingsSchema,
]);

export async function GET() {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const settings = getSetting("site_settings", DEFAULT_SETTINGS);
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  try {
    const rawBody = await request.json().catch(() => null);
    const parsed = settingsPayloadSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json({ error: "Dữ liệu cài đặt không hợp lệ." }, { status: 422 });
    }

    const settings = "settings" in parsed.data ? parsed.data.settings : parsed.data;

    setSetting("site_settings", settings);
    recordAdminAudit(auth.user, "update", "setting", "site_settings", Object.keys(settings));

    // Revalidate whole website layout
    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Save settings error:", error);
    return NextResponse.json({ error: "Lỗi lưu cài đặt." }, { status: 500 });
  }
}
