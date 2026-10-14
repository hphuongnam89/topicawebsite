"use client";
import type { ReactNode } from "react";
import { useLanguage } from "./LanguageProvider";

// Return text only: headings, links and layout keep their existing DOM.
export function LocalizedText({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  return typeof children === "string" ? t(children) : children;
}
