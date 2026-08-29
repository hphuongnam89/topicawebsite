import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getSetting, setSetting } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isSameOrigin } from "@/lib/security/request";

const DEFAULT_SETTINGS = {
  hotline: "1800 646466",
  email: "tuyensinh@topica.edu.vn",
  address: "Tầng 5, Tòa nhà HITC, 239 Xuân Thủy, Cầu Giấy, Hà Nội",
  facebook: "https://www.facebook.com/topica.edu.vn",
  youtube: "https://www.youtube.com/user/TopicaVietnam",
  zalo: "https://zalo.me/topica",
  siteTitle: "Viện Đào tạo Quốc tế Topica - Tiên phong Giáo dục Trực tuyến",
  siteDescription: "Chương trình cử nhân trực tuyến chất lượng cao từ các trường đại học hàng đầu.",
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
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json({ error: "Dữ liệu cài đặt không hợp lệ." }, { status: 400 });
    }

    setSetting("site_settings", settings);

    // Revalidate whole website layout
    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Save settings error:", error);
    return NextResponse.json({ error: "Lỗi lưu cài đặt." }, { status: 500 });
  }
}
