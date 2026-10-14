"use client";
import { createElement, type ComponentPropsWithRef, type ElementType } from "react";
import { useLanguage } from "./LanguageProvider";

export function LocalizedElement<T extends ElementType>({ as, ...props }: { as: T } & ComponentPropsWithRef<T>) {
  const { t } = useLanguage();
  const localized = { ...props } as Record<string, unknown>;
  for (const attribute of ["aria-label", "aria-description", "title", "placeholder", "alt"]) {
    if (typeof localized[attribute] === "string") localized[attribute] = t(localized[attribute]);
  }
  return createElement(as, localized);
}
