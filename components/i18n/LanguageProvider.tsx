"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { translateText, type Locale } from "@/lib/i18n/translate";

const LanguageContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void }>({ locale: "vi", setLocale: () => {} });

export function LanguageProvider({ children, initialLocale }: { children: ReactNode; initialLocale: Locale }) {
  const [locale, setLocale] = useState(initialLocale);
  const scrollPosition = useRef<number | null>(null);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.cookie = `topica_locale=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, [locale]);
  useLayoutEffect(() => {
    if (scrollPosition.current === null) return;
    const top = scrollPosition.current;
    scrollPosition.current = null;
    const frame = requestAnimationFrame(() => window.scrollTo({ top, behavior: "instant" }));
    return () => cancelAnimationFrame(frame);
  }, [locale]);

  function changeLocale(next: Locale) {
    scrollPosition.current = window.scrollY;
    setLocale(next);
    document.documentElement.lang = next;
    document.cookie = `topica_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.history.replaceState(window.history.state, "", url);
  }

  return <LanguageContext.Provider value={{ locale, setLocale: changeLocale }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const language = useContext(LanguageContext);
  return { ...language, t: (text: string) => translateText(text, language.locale) };
}
