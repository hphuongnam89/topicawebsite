"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const target = locale === "vi" ? "en" : "vi";
  return (
    <button
      type="button"
      lang={target}
      aria-label={target === "en" ? "Read this page in English" : "Đọc trang này bằng tiếng Việt"}
      onClick={() => setLocale(target)}
      className="inline-flex min-h-11 items-center rounded-md border border-white/25 px-3 font-semibold text-white transition-colors hover:bg-white/10 sm:min-h-8"
    >
      {target === "en" ? "EN" : "VI"}
    </button>
  );
}
