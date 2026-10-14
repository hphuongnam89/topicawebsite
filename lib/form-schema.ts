import { z } from "zod";
import { leadProgramIds, leadPrograms } from "@/data/lead-options";

const optionalEmail = z
  .string()
  .trim()
  .max(254)
  .email("Vui lòng nhập email hợp lệ")
  .or(z.literal(""))
  .optional()
  .transform((value) => value || undefined);
const optionalEducation = z
  .string()
  .trim()
  .max(100)
  .optional()
  .transform((value) => value || undefined);
const programChoice = z.enum(leadProgramIds, {
  error: "Vui lòng chọn ngành quan tâm hoặc chưa xác định ngành",
});
const apiProgramChoice = z.preprocess((value) => {
  if (value === undefined || value === "") return "undecided";
  return leadPrograms.find((program) => program.label === value)?.id ?? value;
}, programChoice);

export const leadFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập họ tên (tối thiểu 2 ký tự)")
    .max(100, "Họ tên không được quá 100 ký tự"),
  phone: z
    .string()
    .trim()
    .regex(/^(0[3-9]\d{8}|\+84[3-9]\d{8})$/, "Số điện thoại không hợp lệ (10 chữ số)"),
  email: optionalEmail,
  program: programChoice,
  educationLevel: optionalEducation,
  consent: z.literal(true, {
    error: "Vui lòng đồng ý với chính sách bảo mật",
  }),
  source: z.string().trim().max(255).optional(),
  idempotencyKey: z.string().trim().max(100).optional(),
});

export const leadApiSchema = z
  .object({
    fullname: z
      .string()
      .trim()
      .min(2, "Họ tên phải có ít nhất 2 ký tự")
      .max(100, "Họ tên tối đa 100 ký tự"),
    phone: z
      .string()
      .trim()
      .regex(/^(0[3-9]\d{8}|\+84[3-9]\d{8})$/, "Số điện thoại không hợp lệ"),
    email: optionalEmail,
    program: apiProgramChoice,
    educationLevel: optionalEducation,
    notes: z.string().trim().max(1000).optional(),
    source: z.string().trim().max(255).optional(),
    consent: z.literal(true, {
      error: "Bắt buộc phải đồng ý với chính sách bảo mật",
    }),
    consent_version: z.string().trim().max(20).optional().default("2026.1"),
    idempotency_key: z.string().trim().max(100).optional(),
  })
  .strict();

export type LeadFormData = z.infer<typeof leadFormSchema>;
export type LeadApiPayload = z.infer<typeof leadApiSchema>;
export type LeadFormErrors = Partial<Record<keyof LeadFormData, string>>;
