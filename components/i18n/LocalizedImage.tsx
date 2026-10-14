"use client";
import NextImage from "next/image";
export type { ImageProps } from "next/image";
import type { ComponentPropsWithRef } from "react";
import { useLanguage } from "./LanguageProvider";

export default function LocalizedImage(props: ComponentPropsWithRef<typeof NextImage>) {
  const { t } = useLanguage();
  return <NextImage {...props} alt={t(props.alt)} title={props.title && t(props.title)} />;
}
