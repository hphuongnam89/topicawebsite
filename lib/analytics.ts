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

export const ANALYTICS_CONSENT_KEY = "topica_analytics_consent";
export type AnalyticsConsentState = "granted" | "denied" | null;

export function getAnalyticsConsent(): AnalyticsConsentState {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return "denied";
  }
}

export function trackEvent(
  name: AnalyticsEventName,
  properties: Record<string, string | number> = {},
) {
  if (typeof window === "undefined") return;
  let consent = "denied";
  try {
    consent = getAnalyticsConsent() || "denied";
  } catch {
    return;
  }
  if (consent !== "granted") return;
  let sessionId = "";
  try {
    sessionId =
      window.sessionStorage.getItem("topica_analytics_session") ||
      crypto.randomUUID().replaceAll("-", "");
    window.sessionStorage.setItem("topica_analytics_session", sessionId);
  } catch {
    sessionId = crypto.randomUUID().replaceAll("-", "");
  }
  const eventId = crypto.randomUUID().replaceAll("-", "");
  const safeProperties = Object.fromEntries(
    Object.entries(properties).filter(
      ([key, value]) => key.length <= 64 && (typeof value === "number" || value.length <= 200),
    ),
  );
  window.dispatchEvent(
    new CustomEvent("topica:analytics", {
      detail: { name, properties: safeProperties, eventId, sessionId },
    }),
  );
  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  dataLayer?.push({ event: name, ...safeProperties });
  void fetch("/api/public/event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Topica-Analytics-Consent": "granted",
    },
    body: JSON.stringify({
      name,
      event_id: eventId,
      session_id: sessionId,
      properties: safeProperties,
      path: window.location.pathname,
    }),
    keepalive: true,
  }).catch(() => {
    // Analytics must not affect the user flow.
  });
}

export function setAnalyticsConsent(granted: boolean): void {
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, granted ? "granted" : "denied");
    if (!granted) window.sessionStorage.removeItem("topica_analytics_session");
    window.dispatchEvent(
      new CustomEvent("topica:analytics-consent", { detail: granted ? "granted" : "denied" }),
    );
  } catch {
    // Restricted storage keeps analytics disabled.
  }
}
