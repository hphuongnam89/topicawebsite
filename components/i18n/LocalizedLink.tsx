"use client";
import NextLink from "next/link";
import type { ComponentPropsWithRef } from "react";
import { useLanguage } from "./LanguageProvider";

export default function LocalizedLink(props: ComponentPropsWithRef<typeof NextLink>) {
  const { t } = useLanguage();
  return <NextLink {...props} aria-label={props["aria-label"] && t(props["aria-label"])} title={props.title && t(props.title)} />;
}
