import { z } from "zod";
const publicUrl = z
  .string()
  .refine(
    (value) => /^https?:\/\//.test(value) || (/^\/(?!\/)/.test(value) && !value.includes("\\")),
    "URL phải dùng http/https hoặc đường dẫn nội bộ",
  );

const isoDateString = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: "Thời gian phải là định dạng ISO chuẩn",
});

export const organizationSchema = z.object({
  id: z.string().min(1, "ID không được để trống"),
  name: z.string().min(1, "Tên tổ chức không được để trống"),
  role_scope: z.string().min(1, "Phạm vi hoạt động không được để trống"),
  phone: z.string().min(8, "Số điện thoại không hợp lệ"),
  hotline: z.string().min(8, "Hotline không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  website_url: z.string().url("URL website không hợp lệ"),
  support_hours: z.string().min(1, "Giờ hỗ trợ không được để trống"),
  locations: z.union([
    z.string(),
    z.array(
      z.object({
        name: z.string(),
        address: z.string(),
        city: z.string(),
        hotline: z.string().optional(),
      }),
    ),
  ]),
  service_urls: z.union([
    z.string(),
    z.object({
      library: z.string(),
      lms: z.string(),
      assessment: z.string(),
      application: z.string(),
      status: z.string(),
    }),
  ]),
  source: z.string().min(1, "Nguồn dữ liệu không được để trống"),
  version: z.number().int().min(1).default(1),
  updated_at: isoDateString.optional(),
});

export const programSchema = z.object({
  id: z.string().regex(/^[a-z0-9_-]+$/, "ID chỉ gồm chữ thường, số, dấu gạch nối"),
  slug: z.string().min(1, "Slug không được để trống"),
  aliases: z.union([z.string(), z.array(z.string())]).default([]),
  name: z.string().min(1, "Tên chính thức không được để trống"),
  major: z.string().min(1, "Chuyên ngành không được để trống"),
  code: z.string().regex(/^\d{7}$/, "Mã ngành đào tạo phải gồm đúng 7 chữ số theo chuẩn Bộ GD&ĐT"),
  form: z.string().min(1, "Hình thức đào tạo không được để trống"),
  degree_name: z.string().min(1, "Tên văn bằng không được để trống"),
  awarding_institution: z.string().min(1, "Đơn vị cấp bằng không được để trống"),
  duration_credits: z.union([
    z.string(),
    z.object({
      credits: z.number().int().min(1, "Số tín chỉ phải lớn hơn 0"),
      semesters: z.number().int().min(1, "Số học kỳ phải lớn hơn 0"),
      estimatedMonths: z.number().optional(),
      tracks: z.array(z.any()).optional(),
    }),
  ]),
  source: z.string().min(1, "Nguồn xác minh không được để trống"),
  summary: z.string().nullable().optional(),
  marketing_label: z.string().nullable().optional(),
  hero_label: z.string().nullable().optional(),
  group: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  course_count: z.string().nullable().optional(),
  careers: z.union([z.string(), z.array(z.string())]).nullable().optional(),
  curriculum: z.union([z.string(), z.array(z.any())]).nullable().optional(),
  semesters: z.union([z.string(), z.array(z.any())]).nullable().optional(),
  outcomes: z.union([z.string(), z.array(z.any())]).nullable().optional(),
  admissions: z.string().nullable().optional(),
  graduation: z.string().nullable().optional(),
  further_study: z.string().nullable().optional(),
  confirmations: z.union([z.string(), z.array(z.string())]).nullable().optional(),
  faqs: z.union([z.string(), z.array(z.any())]).nullable().optional(),
  version: z.number().int().min(1).default(1),
  created_at: isoDateString.optional(),
  updated_at: isoDateString.optional(),
});

export const admissionRoundSchema = z
  .object({
    id: z.string().min(1, "ID không được để trống"),
    name: z.string().min(1, "Tên kỳ tuyển sinh không được để trống"),
    program_ids: z.union([z.string(), z.array(z.string())]),
    cohort: z.string().min(1, "Khóa tuyển sinh không được để trống"),
    audience: z.string().min(1, "Đối tượng tuyển sinh không được để trống"),
    open_at: isoDateString,
    deadline_at: isoDateString,
    start_at: isoDateString,
    application_url: publicUrl,
    documents: z.union([z.string(), z.array(z.any())]).default([]),
    source: z.string().min(1, "Nguồn công bố không được để trống"),
    status: z.enum(["planned", "open", "closed", "archived"]).default("planned"),
    version: z.number().int().min(1).default(1),
    created_at: isoDateString.optional(),
    updated_at: isoDateString.optional(),
  })
  .refine((data) => Date.parse(data.open_at) <= Date.parse(data.deadline_at), {
    message: "Thời điểm mở nhận hồ sơ phải trước hoặc bằng hạn chót nộp hồ sơ",
    path: ["deadline_at"],
  })
  .refine((data) => Date.parse(data.deadline_at) <= Date.parse(data.start_at), {
    message: "Hạn chót nộp hồ sơ phải trước hoặc bằng ngày khai giảng",
    path: ["start_at"],
  });

export const tuitionPolicySchema = z
  .object({
    id: z.string().min(1, "ID không được để trống"),
    program_id: z.string().min(1, "ID ngành không được để trống"),
    cohort: z.string().min(1, "Khóa tuyển sinh không được để trống"),
    audience: z.string().min(1, "Đối tượng áp dụng không được để trống"),
    currency: z.literal("VND").default("VND"),
    unit_price_per_credit: z.number().int().positive("Đơn giá tín chỉ phải là số nguyên dương"),
    total_credits: z.number().int().positive("Tổng số tín chỉ phải là số nguyên dương"),
    total_tuition: z.number().int().positive("Tổng học phí phải là số nguyên dương"),
    other_fees: z.union([z.string(), z.record(z.string(), z.number().nonnegative())]).default("{}"),
    assumptions: z.union([z.string(), z.record(z.string(), z.any())]).default("{}"),
    effective_from: isoDateString,
    effective_to: isoDateString.nullable().optional(),
    source: z.string().min(1, "Nguồn quyết định học phí không được để trống"),
    doc_ref: z.string().nullable().optional(),
    version: z.number().int().min(1).default(1),
    created_at: isoDateString.optional(),
    updated_at: isoDateString.optional(),
  })
  .refine(
    (data) => {
      // Khi không có phụ phí đặc thù, tổng học phí phải khớp đơn giá * tín chỉ
      return data.total_tuition === data.unit_price_per_credit * data.total_credits;
    },
    {
      message: "Tổng học phí phải bằng đơn giá tín chỉ nhân với tổng số tín chỉ",
      path: ["total_tuition"],
    },
  );

export const scholarshipSchema = z.object({
  id: z.string().min(1, "ID không được để trống"),
  name: z.string().min(1, "Tên học bổng không được để trống"),
  program_ids: z.union([z.string(), z.array(z.string())]),
  scope: z.string().min(1, "Phạm vi áp dụng không được để trống"),
  value_type: z.enum(["percent", "amount"]),
  value: z.number().positive("Giá trị học bổng phải lớn hơn 0"),
  conditions: z.string().min(1, "Điều kiện xét học bổng không được để trống"),
  deadline_at: isoDateString.nullable().optional(),
  evaluation_method: z.string().min(1, "Phương thức xét duyệt không được để trống"),
  source: z.string().min(1, "Nguồn quy chế học bổng không được để trống"),
  version: z.number().int().min(1).default(1),
  created_at: isoDateString.optional(),
  updated_at: isoDateString.optional(),
});

export const documentSchema = z.object({
  id: z.string().min(1, "ID tài liệu không được để trống"),
  title: z.string().min(1, "Tiêu đề tài liệu không được để trống"),
  type: z.enum(["curriculum", "admission_guide", "policy", "form", "license", "other"]),
  file_url: publicUrl,
  view_url: publicUrl,
  mime_type: z.string().min(1, "MIME type không được để trống"),
  byte_size: z.number().int().nonnegative("Dung lượng byte không được âm"),
  checksum_sha256: z.string().regex(/^[a-fA-F0-9]{64}$/, "Mã SHA-256 phải có 64 ký tự hex"),
  published_date: z.string().min(1, "Ngày ban hành không được để trống"),
  version: z.string().default("1.0"),
  source: z.string().min(1, "Nguồn tài liệu không được để trống"),
  rights: z.string().min(1, "Bản quyền/quyền truy cập không được để trống"),
  access: z.enum(["public", "private"]).default("public"),
  alt: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
  focal: z.string().nullable().optional(),
  created_at: isoDateString.optional(),
  updated_at: isoDateString.optional(),
});

export const contentRevisionSchema = z.object({
  id: z.number().int().optional(),
  entity_type: z.enum([
    "article",
    "page",
    "program",
    "tuition_policy",
    "admission_round",
    "organization",
    "scholarship",
    "document",
  ]),
  entity_id: z.string().min(1, "entity_id không được để trống"),
  version: z.number().int().min(1, "Version phải lớn hơn hoặc bằng 1"),
  title: z.string().min(1, "Tiêu đề revision không được để trống"),
  payload: z.union([z.string(), z.record(z.string(), z.any())]),
  workflow_state: z
    .enum(["draft", "in_review", "approved", "published", "archived"])
    .default("draft"),
  reviewer_notes: z.string().nullable().optional(),
  created_by: z.string().min(1, "created_by không được để trống"),
  approved_by: z.string().nullable().optional(),
  published_at: isoDateString.nullable().optional(),
  expired_at: isoDateString.nullable().optional(),
  highlight_until: isoDateString.nullable().optional(),
  created_at: isoDateString.optional(),
  updated_at: isoDateString.optional(),
});

export const auditLogSchema = z.object({
  actor_id: z.string().min(1, "actor_id không được để trống"),
  actor_name: z.string().min(1, "actor_name không được để trống"),
  action: z.enum([
    "create",
    "update",
    "delete",
    "submit_review",
    "approve",
    "publish",
    "archive",
    "reject",
    "rollback",
    "backup",
    "restore",
  ]),
  entity_type: z.string().min(1),
  entity_id: z.string().min(1),
  revision_id: z.number().int().nullable().optional(),
  timestamp: isoDateString,
  changed_fields: z.union([z.string(), z.record(z.string(), z.any()), z.array(z.string())]),
  reason: z.string().nullable().optional(),
  ip_address: z.string().nullable().optional(),
});

export const analyticsEventSchema = z
  .object({
    event_name: z.enum(["cta_click", "form_submit", "file_download", "page_view", "search"]),
    page_path: z.string().min(1, "page_path không được để trống"),
    program_id: z
      .enum(["ba", "tourism", "it", "english", "chinese", "undecided"])
      .nullable()
      .optional(),
    category: z.enum(["public", "admissions", "programs"]).nullable().optional(),
    session_id: z.null().optional(),
    server_time: isoDateString,
    environment: z
      .enum(["production", "development", "test", "qa", "staging"])
      .default("production"),
    metadata: z
      .object({
        button: z.enum(["hero_cta", "admission", "consultation", "program", "contact"]).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();
