import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getSetting, setSetting } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isSameOrigin } from "@/lib/security/request";
import { recordAdminAudit } from "@/lib/services/admin-audit";

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
    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json({ error: "Dữ liệu cài đặt không hợp lệ." }, { status: 400 });
    }

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
