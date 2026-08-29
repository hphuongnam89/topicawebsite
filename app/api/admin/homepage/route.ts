import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getSetting, setSetting } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isSameOrigin } from "@/lib/security/request";

export interface HomepageHeroSettings {
  badge: string;
  title: string;
  description: string;
  bgImage: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
  showLeadForm: boolean;
}

export interface TrustItemSetting {
  label: string;
}

export interface TestimonialSetting {
  id: string;
  name: string;
  role: string;
  quote: string;
  program: string;
  avatar?: string;
}

export interface AdmissionStepSetting {
  step: number;
  title: string;
  description: string;
  icon: string;
}

const DEFAULT_HERO: HomepageHeroSettings = {
  badge: "Trực thuộc Trường Đại học Phú Xuân — Thành viên EQuest",
  title: "HỌC CHỦ ĐỘNG —\nKIẾN TẠO TƯƠNG LAI",
  description: "Chương trình đào tạo từ xa chất lượng cao, linh hoạt thời gian, được Bộ GD&ĐT công nhận.",
  bgImage: "https://topicauni.edu.vn/wp-content/uploads/2026/06/gen-h-z7974881374708_9928c332948e9dc73c1de5527deb67d3.jpg",
  ctaPrimaryText: "Đăng ký xét tuyển",
  ctaPrimaryLink: "https://www.tuyensinh.topicauni.edu.vn/",
  ctaSecondaryText: "Xem ngành học",
  ctaSecondaryLink: "/nganh-dao-tao/",
  showLeadForm: true,
};

const DEFAULT_TRUST_ITEMS: TrustItemSetting[] = [
  { label: "Trực thuộc ĐH Phú Xuân" },
  { label: "Bằng cấp được công nhận" },
  { label: "Đào tạo từ xa 100%" },
  { label: "15,000+ sinh viên" },
  { label: "9 ngành đào tạo" },
  { label: "Thành viên EQuest" },
];

const DEFAULT_TESTIMONIALS: TestimonialSetting[] = [
  {
    id: "t1",
    name: "Nguyễn Văn A",
    role: "Cựu sinh viên",
    quote: "Chương trình đào tạo tại Topica rất thực tiễn, giúp tôi tự tin áp dụng vào công việc ngay sau khi tốt nghiệp.",
    program: "Công nghệ thông tin",
  },
  {
    id: "t2",
    name: "Trần Thị B",
    role: "Sinh viên năm 3",
    quote: "Đội ngũ giảng viên nhiệt tình và luôn hỗ trợ sinh viên trong suốt quá trình học tập.",
    program: "Quản trị Kinh doanh - Marketing",
  },
  {
    id: "t3",
    name: "Lê Văn C",
    role: "Trưởng phòng Marketing",
    quote: "Môi trường học tập trực tuyến linh hoạt đã giúp tôi cân bằng giữa công việc và việc học.",
    program: "Ngôn ngữ Anh",
  },
  {
    id: "t4",
    name: "Phạm Thị D",
    role: "Chuyên viên Nhân sự",
    quote: "Kiến thức từ chương trình đã mở ra nhiều cơ hội phát triển nghề nghiệp cho tôi.",
    program: "Quản lý công nghiệp",
  },
];

const DEFAULT_STEPS: AdmissionStepSetting[] = [
  { step: 1, title: "Đăng ký trực tuyến", description: "Điền form thông tin tư vấn ngành học", icon: "Search" },
  { step: 2, title: "Tư vấn & Hướng dẫn", description: "Chuyên viên liên hệ hướng dẫn hồ sơ", icon: "PhoneCall" },
  { step: 3, title: "Nộp hồ sơ xét tuyển", description: "Gửi bản sao công chứng bằng cấp", icon: "FileText" },
  { step: 4, title: "Nhận kết quả trúng tuyển", description: "Nhận giấy báo nhập học chính thức", icon: "CheckCircle" },
  { step: 5, title: "Bắt đầu học tập", description: "Kích hoạt tài khoản học viện trực tuyến", icon: "GraduationCap" },
];

export async function GET() {
  const hero = getSetting<HomepageHeroSettings>("homepage_hero", DEFAULT_HERO);
  const trustItems = getSetting<TrustItemSetting[]>("homepage_trust", DEFAULT_TRUST_ITEMS);
  const testimonials = getSetting<TestimonialSetting[]>("homepage_testimonials", DEFAULT_TESTIMONIALS);
  const admissionSteps = getSetting<AdmissionStepSetting[]>("homepage_steps", DEFAULT_STEPS);

  return NextResponse.json({
    hero,
    trustItems,
    testimonials,
    admissionSteps,
  });
}

export async function PUT(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  try {
    const body = await request.json();
    const { hero, trustItems, testimonials, admissionSteps } = body;

    if (hero) {
      setSetting("homepage_hero", hero);
    }

    if (trustItems) {
      setSetting("homepage_trust", trustItems);
    }

    if (testimonials) {
      setSetting("homepage_testimonials", testimonials);
    }

    if (admissionSteps) {
      setSetting("homepage_steps", admissionSteps);
    }

    // On-demand revalidation
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      hero,
      trustItems,
      testimonials,
      admissionSteps,
    });
  } catch (error) {
    console.error("Save homepage error:", error);
    return NextResponse.json({ error: "Lỗi lưu cấu hình trang chủ." }, { status: 500 });
  }
}
