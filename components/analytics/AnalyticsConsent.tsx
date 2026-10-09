"use client";

import { useEffect, useState } from "react";
import {
  getAnalyticsConsent,
  setAnalyticsConsent,
  type AnalyticsConsentState,
} from "@/lib/analytics";

export function AnalyticsConsent() {
  const [state, setState] = useState<AnalyticsConsentState>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const current = getAnalyticsConsent();
        setState(current);
        setVisible(current === null);
      } catch {
        setVisible(false);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const save = (granted: boolean) => {
    setAnalyticsConsent(granted);
    setState(granted ? "granted" : "denied");
    setVisible(false);
  };
  if (!visible && state !== null)
    return (
      <button
        type="button"
        className="border-line-300 text-ink-700 fixed right-4 bottom-4 z-40 rounded-full border bg-paper px-3 py-2 text-xs font-semibold shadow"
        onClick={() => setVisible(true)}
      >
        Cài đặt đo lường
      </button>
    );
  if (!visible) return null;
  return (
    <aside
      className="fixed inset-x-4 bottom-4 z-50 rounded-lg border border-line-200 bg-paper p-4 shadow-lg md:left-auto md:max-w-md"
      aria-label="Tùy chọn đo lường"
    >
      <p className="text-ink-700 text-body-sm">
        Cho phép đo lường ẩn danh để cải thiện nội dung và trải nghiệm website?
      </p>
      <div className="mt-3 flex gap-2">
        <button
          className="rounded-md bg-brand-700 px-3 py-2 text-sm font-semibold text-white"
          onClick={() => {
            save(true);
          }}
        >
          Cho phép
        </button>
        <button
          className="border-line-300 text-ink-700 rounded-md border px-3 py-2 text-sm font-semibold"
          onClick={() => {
            save(false);
          }}
        >
          {state === null ? "Từ chối" : "Rút lại / từ chối"}
        </button>
      </div>
    </aside>
  );
}
