import { z } from "zod";

export const leadFormSchema = z.object({
  fullName: z.string().min(2, "Vui lòng nhập họ tên").max(100, "Họ tên không được quá 100 ký tự"),
  phone: z.string().regex(/^(0[3-9]\d{8}|\+84[3-9]\d{8})$/, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  program: z.string().min(1, "Vui lòng chọn ngành quan tâm"),
  educationLevel: z.string().min(1, "Vui lòng chọn trình độ học vấn"),
  consent: z.literal(true, {
    error: "Vui lòng đồng ý với chính sách bảo mật",
  }),
});

export const leadApiSchema = z.object({
  fullname: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^(0[3-9]\d{8}|\+84[3-9]\d{8})$/),
  email: z.string().trim().email().max(254).optional(),
  program: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(1000).optional(),
}).strict();

export type LeadFormData = z.infer<typeof leadFormSchema>;
export type LeadFormErrors = Partial<Record<keyof LeadFormData, string>>;
