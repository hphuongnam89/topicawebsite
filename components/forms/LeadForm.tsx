"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { leadFormSchema, type LeadFormData, type LeadFormErrors } from "@/lib/form-schema";
import { homepageContent } from "@/data/homepage-content";
import { trackEvent } from "@/lib/analytics";

type FormStatus = "idle" | "validating" | "submitting" | "success" | "error";
type LeadFormProps = {
  id?: string;
  heading?: string;
  description?: string;
  responseTime?: string;
  programCode?: string;
  programName?: string;
  programDirection?: string;
  onSubmit?: (data: LeadFormData) => Promise<void>;
};
type FormValues = { fullName?: string; phone?: string; consent?: boolean };
const attributionKeys = ["source", "medium", "campaign", "content", "term"] as const;
type AttributionKey = (typeof attributionKeys)[number];

function getAttribution(): Record<
  AttributionKey | "landing_page" | "referrer" | "submitted_at" | "device_type",
  string
> {
  const empty = {
    source: "",
    medium: "",
    campaign: "",
    content: "",
    term: "",
    landing_page: "",
    referrer: "",
    submitted_at: "",
    device_type: "",
  };
  if (typeof window === "undefined") return empty;
  const values = Object.fromEntries(
    attributionKeys.map((key) => [
      key,
      new URLSearchParams(window.location.search).get(`utm_${key}`) ||
        sessionStorage.getItem(`utm_${key}`) ||
        "",
    ]),
  ) as Record<AttributionKey, string>;
  for (const key of attributionKeys)
    if (values[key]) sessionStorage.setItem(`utm_${key}`, values[key]);
  return {
    ...values,
    landing_page: window.location.pathname,
    referrer: document.referrer.slice(0, 512),
    submitted_at: new Date().toISOString(),
    device_type: window.innerWidth < 768 ? "mobile" : "desktop",
  };
}

export function LeadForm({
  id = "lead-form",
  heading = homepageContent.hero.formTitle,
  description = homepageContent.hero.formDescription,
  responseTime = homepageContent.hero.responseTime,
  programCode,
  programName,
  programDirection,
  onSubmit,
}: LeadFormProps) {
  const [formData, setFormData] = useState<FormValues>({
    fullName: "",
    phone: "",
    consent: false,
  });
  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [globalError, setGlobalError] = useState<string | null>(null);
  const updateField = (name: keyof FormValues, value: string | boolean) => {
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "validating" || status === "submitting") return;
    setErrors({});
    setGlobalError(null);
    setStatus("validating");
    const result = leadFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: LeadFormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LeadFormData | undefined;
        if (field) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      setStatus("error");
      trackEvent("form_field_error", { count: result.error.issues.length });
      return;
    }
    trackEvent("form_submit");
    setStatus("submitting");
    try {
      if (onSubmit) await onSubmit(result.data);
      else {
        const response = await fetch("/api/public/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullname: result.data.fullName,
            phone: result.data.phone,
            email: result.data.email || undefined,
            program: programName,
            program_code: programCode,
            program_name: programName,
            program_direction: programDirection,
            notes: "Đăng ký nhận lộ trình và học phí.",
            ...getAttribution(),
          }),
        });
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) throw new Error(payload.error || "Gửi thông tin thất bại.");
      }
      setStatus("success");
      trackEvent("form_success");
    } catch {
      setGlobalError("Không thể gửi thông tin lúc này. Vui lòng thử lại hoặc gọi hotline.");
      setStatus("error");
      trackEvent("form_error");
    }
  };

  if (status === "success")
    return (
      <div className="rounded-md border border-success/30 bg-paper p-6 text-center" role="status">
        <CheckCircle className="mx-auto h-10 w-10 text-success" aria-hidden="true" />
        <h2 className="mt-4 font-display text-h3 font-semibold text-ink-950">Đã nhận thông tin</h2>
        <p className="mt-3 text-body-sm text-ink-600">
          Chúng tôi sẽ liên hệ theo số{" "}
          {formData.phone
            ? `${String(formData.phone).slice(0, 3)}••••${String(formData.phone).slice(-3)}`
            : "bạn cung cấp"}
          . {responseTime}
        </p>
      </div>
    );
  const busy = status === "validating" || status === "submitting";
  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      noValidate
      className="rounded-md bg-paper p-5 text-ink-950 shadow-md sm:p-7"
      aria-busy={busy}
    >
      <div className="border-b border-line-200 pb-4">
        <p className="text-body-sm font-semibold tracking-[0.12em] text-brand-700 uppercase">
          Tư vấn tuyển sinh
        </p>
        <h2 className="mt-2 font-display text-[1.65rem] leading-tight font-semibold text-ink-950">
          {heading}
        </h2>
        <p className="mt-3 text-body-sm leading-relaxed text-ink-600">{description}</p>
        {programName && (
          <p className="text-ink-700 mt-4 border-l-2 border-brand-500 pl-3 text-body-sm font-semibold">
            Ngành đã chọn: {programName}
            {programDirection ? ` · ${programDirection}` : ""}
          </p>
        )}
      </div>
      {(Object.keys(errors).length > 0 || globalError) && (
        <div
          className="mt-5 flex items-start gap-2 rounded-md bg-error/10 p-3 text-body-sm text-error"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{globalError || "Vui lòng kiểm tra lại thông tin."}</span>
        </div>
      )}
      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-body-sm font-semibold">
            Họ tên <span className="text-error">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            autoComplete="name"
            value={formData.fullName || ""}
            onChange={(event) => updateField("fullName", event.target.value)}
            disabled={busy}
            className={`mt-1.5 h-12 w-full rounded-sm border bg-white px-3 outline-none focus:ring-2 focus:ring-info/20 ${errors.fullName ? "border-error" : "border-line-200 focus:border-info"}`}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            placeholder="Nhập họ tên của bạn"
          />
          {errors.fullName && (
            <p id="fullName-error" className="mt-1 text-body-sm text-error">
              {errors.fullName}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="phone" className="block text-body-sm font-semibold">
            Số điện thoại <span className="text-error">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={formData.phone || ""}
            onChange={(event) => updateField("phone", event.target.value)}
            disabled={busy}
            className={`mt-1.5 h-12 w-full rounded-sm border bg-white px-3 outline-none focus:ring-2 focus:ring-info/20 ${errors.phone ? "border-error" : "border-line-200 focus:border-info"}`}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            placeholder="VD: 0912 345 678"
          />
          {errors.phone && (
            <p id="phone-error" className="mt-1 text-body-sm text-error">
              {errors.phone}
            </p>
          )}
        </div>
        <div className="flex items-start gap-3">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            checked={Boolean(formData.consent)}
            onChange={(event) => updateField("consent", event.target.checked)}
            disabled={busy}
            className="mt-1 h-4 w-4 rounded border-line-200 text-brand-700 focus:ring-info"
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? "consent-error" : undefined}
          />
          <label htmlFor="consent" className="text-body-sm leading-relaxed text-ink-600">
            Tôi đồng ý để Topica tiếp nhận đăng ký, tư vấn tuyển sinh và liên hệ theo thông tin tôi
            cung cấp.{" "}
            <a
              href={homepageContent.privacyPolicyHref}
              className="font-semibold text-info underline underline-offset-2"
            >
              Chính sách bảo mật
            </a>
          </label>
        </div>
        {errors.consent && (
          <p id="consent-error" className="text-body-sm text-error">
            {errors.consent}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={busy}
        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-sm bg-brand-700 px-5 text-body-sm font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {status === "submitting" ? "Đang gửi thông tin…" : homepageContent.hero.primaryCta}
      </button>
      <p className="mt-3 text-center text-[0.75rem] text-ink-600">
        Thông tin chỉ dùng cho mục đích tư vấn tuyển sinh. {responseTime}
      </p>
    </form>
  );
}
