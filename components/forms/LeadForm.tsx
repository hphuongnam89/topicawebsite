"use client";

import { LocalizedText } from "@/components/i18n/LocalizedText";
import { LocalizedElement } from "@/components/i18n/LocalizedElement";
import React, { useState, useRef, useEffect } from "react";
import Link from "@/components/i18n/LocalizedLink";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { leadFormSchema, LeadFormData, LeadFormErrors } from "@/lib/form-schema";
import { ZodError } from "zod";
import { leadPrograms } from "@/data/lead-options";

interface LeadFormProps {
  onSubmit?: (data: LeadFormData) => Promise<void>;
}

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
    educationLevel: "",
  });

  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [globalError, setGlobalError] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string>("");
  const submittingRef = useRef(false);
  const payloadRef = useRef("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }
  }, []);

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
    if (submittingRef.current) return;
    submittingRef.current = true;
    setErrors({});
    setGlobalError(null);
    setStatus("loading");

    try {
      // Validate
      const validData = leadFormSchema.parse(formData);
      const fingerprint = JSON.stringify(validData);
      if (payloadRef.current && payloadRef.current !== fingerprint) {
        idempotencyKeyRef.current = crypto.randomUUID();
      }
      payloadRef.current = fingerprint;

      if (onSubmit) {
        await onSubmit(validData);
      } else {
        const res = await fetch("/api/public/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullname: validData.fullName,
            phone: validData.phone,
            email: validData.email ? validData.email : undefined,
            program: validData.program,
            educationLevel: validData.educationLevel,
            consent: validData.consent,
            source: typeof window !== "undefined" ? window.location.pathname : undefined,
            idempotency_key: idempotencyKeyRef.current,
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Gửi thông tin thất bại.");
        }
        const confirmation = await res.json();
        if (confirmation.success !== true || !Number.isInteger(confirmation.id)) {
          throw new Error("Chưa xác nhận được yêu cầu. Vui lòng thử lại.");
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
        const firstField = error.issues[0]?.path[0];
        requestAnimationFrame(() => {
          const field = formRef.current?.querySelector<HTMLElement>(
            `[name="${String(firstField)}"]`,
          );
          const optional = field?.closest("details");
          if (optional) optional.open = true;
          field?.focus();
        });
      } else {
        setGlobalError(
          error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")
            ? "Kết nối chậm. Thông tin của bạn vẫn được giữ; hãy thử gửi lại."
            : error instanceof Error
              ? error.message
              : "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
        );
      }
    } finally {
      submittingRef.current = false;
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-line-200 bg-paper p-8 text-center shadow-sm">
        <CheckCircle className="h-12 w-12 text-success" />
        <h3 className="font-serif text-h3 font-bold text-ink-950">
          <LocalizedText>Gửi yêu cầu tư vấn thành công!</LocalizedText>
        </h3>
        <p className="max-w-sm text-body leading-relaxed text-ink-600">
          <LocalizedText>
            Cảm ơn bạn đã quan tâm. Chuyên viên tư vấn tuyển sinh Topica sẽ liên hệ qua số điện
            thoại
          </LocalizedText>
          <LocalizedText> </LocalizedText>
          <strong className="text-navy-900">
            <LocalizedText>{formData.phone}</LocalizedText>
          </strong>{" "}
          <LocalizedText>để hỗ trợ bạn.</LocalizedText>
        </p>
        <p className="text-xs text-ink-400 italic">
          <LocalizedText>
            (Lưu ý: Đây là xác nhận tiếp nhận thông tin tư vấn, không phải thông báo trúng tuyển
            chính thức).
          </LocalizedText>
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              idempotencyKeyRef.current = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
              payloadRef.current = "";
              setFormData({ fullName: "", phone: "", email: "", educationLevel: "" });
            }}
            className="text-body-sm font-semibold text-navy-900 underline transition-colors hover:text-navy-700"
          >
            <LocalizedText>Gửi yêu cầu tư vấn khác</LocalizedText>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-[0.75rem] border border-white/60 bg-paper p-5 shadow-sm sm:p-6"
      aria-live="polite"
      aria-busy={status === "loading"}
    >
      <div className="border-b border-line-200 pb-4">
        <p className="text-body-sm font-semibold tracking-[0.1em] text-brand-700 uppercase">
          <LocalizedText>Tư vấn tuyển sinh</LocalizedText>
        </p>
        <h2 className="mt-1 font-display text-[1.5rem] leading-tight font-bold text-ink-950">
          <LocalizedText>Nhận lộ trình phù hợp với bạn</LocalizedText>
        </h2>
      </div>
      {status === "error" && Object.keys(errors).length > 0 && (
        <div
          className="flex items-start gap-2 rounded-md bg-error/10 p-3 text-body-sm text-error"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p>
              <LocalizedText>Vui lòng kiểm tra lại thông tin bên dưới.</LocalizedText>
            </p>
            <ul>
              {Object.entries(errors)
                .filter(([, message]) => message)
                .map(([field, message]) => (
                  <li key={field}>
                    <a
                      className="underline"
                      href={`#${field}`}
                      onClick={() =>
                        formRef.current?.querySelector<HTMLElement>(`[name="${field}"]`)?.focus()
                      }
                    >
                      <LocalizedText>{message}</LocalizedText>
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}

      <LocalizedText>
        {globalError && (
          <div
            className="flex items-start gap-2 rounded-md bg-error/10 p-3 text-body-sm text-error"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <LocalizedText>{globalError}</LocalizedText>
            </span>
          </div>
        )}
      </LocalizedText>

      <div className="space-y-1.5">
        <label htmlFor="fullName" className="block text-body-sm font-medium text-ink-950">
          <LocalizedText>Họ tên </LocalizedText>
          <span className="text-error">
            <LocalizedText>*</LocalizedText>
          </span>
        </label>
        <LocalizedElement
          as="input"
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
        <LocalizedText>
          {errors.fullName && (
            <p id="fullName-error" className="mt-1 flex items-center gap-1 text-body-sm text-error">
              <AlertCircle className="h-3.5 w-3.5" />{" "}
              <LocalizedText>{errors.fullName}</LocalizedText>
            </p>
          )}
        </LocalizedText>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="phone" className="block text-body-sm font-medium text-ink-950">
          <LocalizedText>Số điện thoại </LocalizedText>
          <span className="text-error">
            <LocalizedText>*</LocalizedText>
          </span>
        </label>
        <LocalizedElement
          as="input"
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
        <LocalizedText>
          {errors.phone && (
            <p id="phone-error" className="mt-1 flex items-center gap-1 text-body-sm text-error">
              <AlertCircle className="h-3.5 w-3.5" /> <LocalizedText>{errors.phone}</LocalizedText>
            </p>
          )}
        </LocalizedText>
      </div>

      <details className="rounded-md border border-line-200 p-3">
        <summary className="min-h-11 cursor-pointer text-body-sm font-medium text-ink-950">
          <LocalizedText>Bổ sung thông tin (không bắt buộc)</LocalizedText>
        </summary>
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-body-sm font-medium text-ink-950">
            <LocalizedText>Email (không bắt buộc)</LocalizedText>
          </label>
          <LocalizedElement
            as="input"
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
          <LocalizedText>
            {errors.email && (
              <p id="email-error" className="mt-1 flex items-center gap-1 text-body-sm text-error">
                <AlertCircle className="h-3.5 w-3.5" />{" "}
                <LocalizedText>{errors.email}</LocalizedText>
              </p>
            )}
          </LocalizedText>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="educationLevel" className="block text-body-sm font-medium text-ink-950">
            <LocalizedText>Trình độ học vấn hiện tại (không bắt buộc)</LocalizedText>
          </label>
          <LocalizedElement
            as="select"
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
            <option value="">
              <LocalizedText>Chọn trình độ</LocalizedText>
            </option>
            {educationLevels.map((lvl) => (
              <option key={lvl} value={lvl}>
                <LocalizedText>{lvl}</LocalizedText>
              </option>
            ))}
          </LocalizedElement>
          <LocalizedText>
            {errors.educationLevel && (
              <p
                id="educationLevel-error"
                className="mt-1 flex items-center gap-1 text-body-sm text-error"
              >
                <AlertCircle className="h-3.5 w-3.5" />{" "}
                <LocalizedText>{errors.educationLevel}</LocalizedText>
              </p>
            )}
          </LocalizedText>
        </div>
      </details>
      <div className="space-y-1.5">
        <label htmlFor="program" className="block text-body-sm font-medium text-ink-950">
          <LocalizedText>Ngành quan tâm </LocalizedText>
          <span className="text-error">
            <LocalizedText>*</LocalizedText>
          </span>
        </label>
        <LocalizedElement
          as="select"
          id="program"
          name="program"
          value={formData.program || ""}
          onChange={handleChange}
          disabled={status === "loading"}
          className={`h-11 w-full rounded-md border bg-white px-3 focus:ring-1 focus:outline-none ${errors.program ? "border-error focus:ring-error" : "border-line-200 focus:ring-info"}`}
          aria-invalid={!!errors.program}
          aria-describedby={errors.program ? "program-error" : undefined}
        >
          <option value="" disabled>
            <LocalizedText>Chọn ngành học</LocalizedText>
          </option>
          {leadPrograms.map((program) => (
            <option key={program.id} value={program.id}>
              <LocalizedText>{program.label}</LocalizedText>
            </option>
          ))}
        </LocalizedElement>
        <LocalizedText>
          {errors.program && (
            <p id="program-error" className="text-body-sm text-error">
              <LocalizedText>{errors.program}</LocalizedText>
            </p>
          )}
        </LocalizedText>
      </div>

      <div className="space-y-1.5 pt-2">
        <div className="flex items-start gap-2">
          <LocalizedElement
            as="input"
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
            <LocalizedText>Tôi đồng ý với</LocalizedText>
            <LocalizedText> </LocalizedText>
            <Link
              href="/chinh-sach-bao-mat/"
              target="_blank"
              className="font-medium text-navy-800 underline decoration-navy-800/40 underline-offset-2 transition-colors hover:text-navy-950"
            >
              <LocalizedText>Chính sách bảo mật</LocalizedText>
            </Link>
            <LocalizedText> </LocalizedText>
            <LocalizedText>và cho phép Topica liên hệ để tư vấn.</LocalizedText>
          </label>
        </div>
        <LocalizedText>
          {errors.consent && (
            <p id="consent-error" className="flex items-center gap-1 text-body-sm text-error">
              <AlertCircle className="h-3.5 w-3.5" />{" "}
              <LocalizedText>{errors.consent}</LocalizedText>
            </p>
          )}
        </LocalizedText>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-4 flex h-12 w-full items-center justify-center rounded-md bg-brand-700 font-semibold text-white shadow-xs transition-[background-color,transform,box-shadow] hover:bg-brand-800 hover:shadow-sm active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
      >
        <LocalizedText>
          {status === "loading" ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <LocalizedText>Đang xử lý...</LocalizedText>
            </>
          ) : (
            "Đăng ký tư vấn miễn phí"
          )}
        </LocalizedText>
      </button>
    </form>
  );
}
