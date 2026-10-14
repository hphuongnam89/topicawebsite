import { NextResponse } from "next/server";
import { requireAdmin as requireUser } from "@/lib/auth/guards";
import { getSetting, setSetting } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isSameOrigin } from "@/lib/security/request";
import { recordAdminAudit } from "@/lib/services/admin-audit";
import { z } from "zod";

const homepageHeroSchema = z
  .object({
    badge: z.string().trim().min(1).max(300),
    title: z.string().trim().min(1).max(300),
    description: z.string().trim().max(1000),
    bgImage: z.string().trim().min(1).max(2000),
    videoUrl: z.string().trim().max(2000).optional(),
    ctaPrimaryText: z.string().trim().min(1).max(100),
    ctaPrimaryLink: z.string().trim().min(1).max(1000),
    ctaSecondaryText: z.string().trim().min(1).max(100),
    ctaSecondaryLink: z.string().trim().min(1).max(1000),
    showLeadForm: z.boolean(),
  })
  .strict();

const trustItemSchema = z
  .object({
    label: z.string().trim().min(1).max(200),
  })
  .strict();

const testimonialSchema = z
  .object({
    id: z.string().trim().min(1).max(100),
    name: z.string().trim().min(1).max(200),
    role: z.string().trim().max(200),
    quote: z.string().trim().min(1).max(2000),
    program: z.string().trim().max(200),
    avatar: z.string().trim().max(2000).optional(),
  })
  .strict();

const admissionStepSchema = z
  .object({
    step: z.number().int().min(1).max(20),
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(1000),
    icon: z.string().trim().min(1).max(100),
  })
  .strict();

const homepageUpdateSchema = z
  .object({
    hero: homepageHeroSchema.optional(),
    trustItems: z.array(trustItemSchema).optional(),
    testimonials: z.array(testimonialSchema).optional(),
    admissionSteps: z.array(admissionStepSchema).optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.hero !== undefined ||
      data.trustItems !== undefined ||
      data.testimonials !== undefined ||
      data.admissionSteps !== undefined,
    { message: "Cần ít nhất một trường để cập nhật" },
  );

export type HomepageHeroSettings = z.infer<typeof homepageHeroSchema>;
export type TrustItemSetting = z.infer<typeof trustItemSchema>;
export type TestimonialSetting = z.infer<typeof testimonialSchema>;
export type AdmissionStepSetting = z.infer<typeof admissionStepSchema>;

const DEFAULT_HERO: HomepageHeroSettings = {
  badge: "Trực thuộc Trường Đại học Phú Xuân — Thành viên EQuest",
  title: "HỌC CHỦ ĐỘNG —\nKIẾN TẠO TƯƠNG LAI",
  description:
    "Chương trình đào tạo từ xa chất lượng cao, linh hoạt thời gian, được Bộ GD&ĐT công nhận.",
  bgImage:
    "https://topicauni.edu.vn/wp-content/uploads/2026/06/gen-h-z7974881374708_9928c332948e9dc73c1de5527deb67d3.jpg",
  ctaPrimaryText: "Đăng ký xét tuyển",
  ctaPrimaryLink: "https://www.tuyensinh.topicauni.edu.vn/",
  ctaSecondaryText: "Xem ngành học",
  ctaSecondaryLink: "/nganh-dao-tao/",
  showLeadForm: false,
};

const DEFAULT_TRUST_ITEMS: TrustItemSetting[] = [
  { label: "Trực thuộc ĐH Phú Xuân" },
  { label: "Bằng cấp được công nhận" },
  { label: "Đào tạo từ xa trực tuyến" },
  { label: "5 ngành đào tạo trọng điểm" },
  { label: "Thành viên EQuest" },
];

// Chưa có chứng thực được xác nhận: không tạo tên hoặc trích dẫn giả.
const DEFAULT_TESTIMONIALS: TestimonialSetting[] = [];

const DEFAULT_STEPS: AdmissionStepSetting[] = [
  {
    step: 1,
    title: "Đăng ký trực tuyến",
    description: "Điền form thông tin tư vấn ngành học",
    icon: "Search",
  },
  {
    step: 2,
    title: "Tư vấn & Hướng dẫn",
    description: "Chuyên viên liên hệ hướng dẫn hồ sơ",
    icon: "PhoneCall",
  },
  {
    step: 3,
    title: "Nộp hồ sơ xét tuyển",
    description: "Gửi bản sao công chứng bằng cấp",
    icon: "FileText",
  },
  {
    step: 4,
    title: "Nhận kết quả trúng tuyển",
    description: "Nhận giấy báo nhập học chính thức",
    icon: "CheckCircle",
  },
  {
    step: 5,
    title: "Bắt đầu học tập",
    description: "Kích hoạt tài khoản học viện trực tuyến",
    icon: "GraduationCap",
  },
];

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const hero = getSetting<HomepageHeroSettings>("homepage_hero", DEFAULT_HERO);
  const trustItems = getSetting<TrustItemSetting[]>("homepage_trust", DEFAULT_TRUST_ITEMS);
  const testimonials = getSetting<TestimonialSetting[]>(
    "homepage_testimonials",
    DEFAULT_TESTIMONIALS,
  );
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
  if (!isSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  try {
    const rawBody = await request.json().catch(() => null);
    const parsed = homepageUpdateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu cấu hình trang chủ không hợp lệ." },
        { status: 422 },
      );
    }

    const { hero, trustItems, testimonials, admissionSteps } = parsed.data;

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
    recordAdminAudit(auth.user, "update", "homepage", "homepage", [
      ...(hero ? ["hero"] : []),
      ...(trustItems ? ["trustItems"] : []),
      ...(testimonials ? ["testimonials"] : []),
      ...(admissionSteps ? ["admissionSteps"] : []),
    ]);

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
