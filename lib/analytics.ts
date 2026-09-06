"use client";

export type AnalyticsEventName =
  | "page_view"
  | "hero_primary_cta_click"
  | "hero_secondary_cta_click"
  | "form_start"
  | "form_field_error"
  | "form_submit"
  | "form_success"
  | "form_error"
  | "program_card_click"
  | "program_cta_click"
  | "curriculum_expand"
  | "tuition_click"
  | "eligibility_click"
  | "tuition_info_click"
  | "eligibility_check_click"
  | "phone_click"
  | "zalo_click"
  | "faq_open"
  | "scroll_depth_25"
  | "scroll_depth_50"
  | "scroll_depth_75"
  | "scroll_depth_90";

export function trackEvent(
  name: AnalyticsEventName,
  properties: Record<string, string | number> = {},
) {
  if (typeof window === "undefined") return;
  const safeProperties = Object.fromEntries(
    Object.entries(properties).filter(
      ([key, value]) => key.length <= 64 && (typeof value === "number" || value.length <= 200),
    ),
  );
  window.dispatchEvent(
    new CustomEvent("topica:analytics", { detail: { name, properties: safeProperties } }),
  );
  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  dataLayer?.push({ event: name, ...safeProperties });
}
