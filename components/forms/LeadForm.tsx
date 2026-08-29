"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { leadFormSchema, LeadFormData, LeadFormErrors } from "@/lib/form-schema";
import { ZodError } from "zod";

interface LeadFormProps {
  onSubmit?: (data: LeadFormData) => Promise<void>;
}

const programs = [
  "Quản trị Kinh doanh - Marketing",
  "Quản trị Dịch vụ Du lịch và Lữ hành",
  "Công nghệ thông tin",
  "Ngôn ngữ Anh",
  "Ngôn ngữ Trung Quốc",
];

const educationLevels = [
  "Tốt nghiệp THPT / Trung học nghề",
  "Tốt nghiệp Trung cấp",
  "Tốt nghiệp Cao đẳng",
  "Tốt nghiệp Đại học",
];

type FormStatus = "idle" | "loading" | "success" | "error";

export function LeadForm({ onSubmit }: LeadFormProps) {
  const [formData, setFormData] = useState<Partial<LeadFormData>>({
    fullName: "",
    phone: "",
    email: "",
    program: "",
    educationLevel: "",
  });

  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({ ...prev, [name]: val }));
    // Clear error for the field when typing
    if (errors[name as keyof LeadFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError(null);
    setStatus("loading");

    try {
      // Validate
      const validData = leadFormSchema.parse(formData);

      if (onSubmit) {
        await onSubmit(validData);
      } else {
        const res = await fetch("/api/public/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullname: validData.fullName,
            phone: validData.phone,
            email: validData.email,
            program: validData.program,
            notes: `Trình độ học vấn: ${validData.educationLevel}`,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Gửi thông tin thất bại.");
        }
      }

      setStatus("success");
    } catch (error) {
      setStatus("error");
      if (error instanceof ZodError) {
        const fieldErrors: LeadFormErrors = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof LeadFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setGlobalError("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-line-200 bg-paper p-8 text-center shadow-sm">
        <CheckCircle className="h-12 w-12 text-success" />
        <h3 className="font-display text-h3 text-ink-950">Đăng ký thành công!</h3>
        <p className="text-body text-ink-600">
          Cảm ơn bạn đã quan tâm. Chuyên viên tư vấn của Topica sẽ liên hệ với bạn trong thời gian
          sớm nhất.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-[0.75rem] border border-white/60 bg-paper p-5 shadow-sm sm:p-6"
      aria-live="polite"
      aria-busy={status === "loading"}
    >
      <div className="border-b border-line-200 pb-4">
        <p className="text-body-sm font-semibold tracking-[0.1em] text-brand-700 uppercase">
          Tư vấn tuyển sinh
        </p>
        <h2 className="mt-1 font-display text-[1.5rem] leading-tight font-bold text-ink-950">
          Nhận lộ trình phù hợp với bạn
        </h2>
      </div>
      {status === "error" && Object.keys(errors).length > 0 && (
        <div
          className="flex items-start gap-2 rounded-md bg-error/10 p-3 text-body-sm text-error"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Vui lòng kiểm tra lại thông tin bên dưới.</span>
        </div>
      )}

      {globalError && (
        <div
          className="flex items-start gap-2 rounded-md bg-error/10 p-3 text-body-sm text-error"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="fullName" className="block text-body-sm font-medium text-ink-950">
          Họ tên <span className="text-error">*</span>
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          autoComplete="name"
          value={formData.fullName || ""}
          onChange={handleChange}
          disabled={status === "loading"}
          className={`h-11 w-full rounded-md border bg-white px-3 transition-colors focus:ring-1 focus:outline-none ${
            errors.fullName
              ? "border-error focus:border-error focus:ring-error"
              : "border-line-200 focus:border-info focus:ring-info"
          }`}
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? "fullName-error" : undefined}
          placeholder="Nhập họ tên của bạn"
        />
        {errors.fullName && (
          <p id="fullName-error" className="mt-1 flex items-center gap-1 text-body-sm text-error">
            <AlertCircle className="h-3.5 w-3.5" /> {errors.fullName}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="phone" className="block text-body-sm font-medium text-ink-950">
          Số điện thoại <span className="text-error">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          autoComplete="tel"
          inputMode="tel"
          value={formData.phone || ""}
          onChange={handleChange}
          disabled={status === "loading"}
          className={`h-11 w-full rounded-md border bg-white px-3 transition-colors focus:ring-1 focus:outline-none ${
            errors.phone
              ? "border-error focus:border-error focus:ring-error"
              : "border-line-200 focus:border-info focus:ring-info"
          }`}
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          placeholder="VD: 0912345678"
        />
        {errors.phone && (
          <p id="phone-error" className="mt-1 flex items-center gap-1 text-body-sm text-error">
            <AlertCircle className="h-3.5 w-3.5" /> {errors.phone}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-body-sm font-medium text-ink-950">
          Email <span className="text-error">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          value={formData.email || ""}
          onChange={handleChange}
          disabled={status === "loading"}
          className={`h-11 w-full rounded-md border bg-white px-3 transition-colors focus:ring-1 focus:outline-none ${
            errors.email
              ? "border-error focus:border-error focus:ring-error"
              : "border-line-200 focus:border-info focus:ring-info"
          }`}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          placeholder="Nhập địa chỉ email"
        />
        {errors.email && (
          <p id="email-error" className="mt-1 flex items-center gap-1 text-body-sm text-error">
            <AlertCircle className="h-3.5 w-3.5" /> {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="program" className="block text-body-sm font-medium text-ink-950">
          Ngành quan tâm <span className="text-error">*</span>
        </label>
        <select
          id="program"
          name="program"
          value={formData.program || ""}
          onChange={handleChange}
          disabled={status === "loading"}
          className={`h-11 w-full rounded-md border bg-white px-3 transition-colors focus:ring-1 focus:outline-none ${
            errors.program
              ? "border-error focus:border-error focus:ring-error"
              : "border-line-200 focus:border-info focus:ring-info"
          }`}
          aria-invalid={!!errors.program}
          aria-describedby={errors.program ? "program-error" : undefined}
        >
          <option value="" disabled>
            Chọn ngành học
          </option>
          {programs.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {errors.program && (
          <p id="program-error" className="mt-1 flex items-center gap-1 text-body-sm text-error">
            <AlertCircle className="h-3.5 w-3.5" /> {errors.program}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="educationLevel" className="block text-body-sm font-medium text-ink-950">
          Trình độ học vấn hiện tại <span className="text-error">*</span>
        </label>
        <select
          id="educationLevel"
          name="educationLevel"
          value={formData.educationLevel || ""}
          onChange={handleChange}
          disabled={status === "loading"}
          className={`h-11 w-full rounded-md border bg-white px-3 transition-colors focus:ring-1 focus:outline-none ${
            errors.educationLevel
              ? "border-error focus:border-error focus:ring-error"
              : "border-line-200 focus:border-info focus:ring-info"
          }`}
          aria-invalid={!!errors.educationLevel}
          aria-describedby={errors.educationLevel ? "educationLevel-error" : undefined}
        >
          <option value="" disabled>
            Chọn trình độ
          </option>
          {educationLevels.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>
        {errors.educationLevel && (
          <p
            id="educationLevel-error"
            className="mt-1 flex items-center gap-1 text-body-sm text-error"
          >
            <AlertCircle className="h-3.5 w-3.5" /> {errors.educationLevel}
          </p>
        )}
      </div>

      <div className="space-y-1.5 pt-2">
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="consent"
            name="consent"
            checked={!!formData.consent}
            onChange={handleChange}
            disabled={status === "loading"}
            className="mt-1 h-4 w-4 rounded border-line-200 text-brand-700 focus:ring-info"
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? "consent-error" : undefined}
          />
          <label htmlFor="consent" className="text-body-sm text-ink-600">
            Tôi đồng ý với{" "}
            <span className="font-medium text-info underline decoration-info/40 underline-offset-2">
              Chính sách bảo mật
            </span>{" "}
            và cho phép Topica liên hệ để tư vấn.
          </label>
        </div>
        {errors.consent && (
          <p id="consent-error" className="flex items-center gap-1 text-body-sm text-error">
            <AlertCircle className="h-3.5 w-3.5" /> {errors.consent}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-4 flex h-12 w-full items-center justify-center rounded-md bg-brand-700 font-semibold text-white shadow-xs transition-[background-color,transform,box-shadow] hover:bg-brand-800 hover:shadow-sm active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang xử lý...
          </>
        ) : (
          "Đăng ký tư vấn miễn phí"
        )}
      </button>
    </form>
  );
}
