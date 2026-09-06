import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s.-]/g, ""))
  .refine((value) => /^(0[3-9]\d{8}|\+84[3-9]\d{8})$/.test(value), "Số điện thoại không hợp lệ");

export const leadFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập họ tên")
    .max(100, "Họ tên không được quá 100 ký tự"),
  phone: phoneSchema,
  email: z
    .string()
    .trim()
    .email("Email không hợp lệ")
    .max(254, "Email không hợp lệ")
    .optional()
    .or(z.literal("")),
  program: z.string().optional(),
  educationLevel: z.string().optional(),
  consent: z.literal(true, {
    error: "Vui lòng đồng ý với chính sách bảo mật",
  }),
});

export const leadApiSchema = z
  .object({
    fullname: z.string().trim().min(2).max(100),
    phone: z
      .string()
      .trim()
      .regex(/^(0[3-9]\d{8}|\+84[3-9]\d{8})$/),
    email: z.string().trim().email().max(254).optional(),
    program: z.string().trim().max(200).optional(),
    program_code: z.string().trim().max(32).optional(),
    program_name: z.string().trim().max(200).optional(),
    program_direction: z.string().trim().max(200).optional(),
    notes: z.string().trim().max(1000).optional(),
    source: z.string().trim().max(100).optional(),
    medium: z.string().trim().max(100).optional(),
    campaign: z.string().trim().max(200).optional(),
    content: z.string().trim().max(200).optional(),
    term: z.string().trim().max(200).optional(),
    landing_page: z.string().trim().max(512).optional(),
    referrer: z.string().trim().max(512).optional(),
    submitted_at: z.string().trim().max(64).optional(),
    device_type: z.enum(["mobile", "desktop"]).optional(),
  })
  .strict();

export type LeadFormData = z.infer<typeof leadFormSchema>;
export type LeadFormErrors = Partial<Record<keyof LeadFormData, string>>;
