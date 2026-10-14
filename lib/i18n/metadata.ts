import { headers } from "next/headers";
import type { Metadata } from "next";
import { env } from "@/lib/env";
import { translateText, type Locale } from "@/lib/i18n/translate";
import { localizedPath } from "@/lib/i18n/routes";

export async function resolveRequestLocale(
  searchParams?: Promise<Record<string, any>> | Record<string, any> | any,
): Promise<Locale> {
  if (searchParams) {
    try {
      const sp = typeof searchParams.then === "function" ? await searchParams : searchParams;
      const lang = typeof sp.get === "function" ? sp.get("lang") : sp?.lang;
      if (lang === "en") return "en";
      if (lang === "vi") return "vi";
    } catch {}
  }

  try {
    const h = await headers();
    const topicaLocale = h.get("x-topica-locale");
    if (topicaLocale === "en") return "en";
    const pathname = h.get("x-pathname") || "";
    if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  } catch {}
  return "vi";
}

export interface LocalizedMetadataOptions {
  locale: Locale;
  title: string;
  description?: string;
  viPath: string;
  enPath?: string;
  openGraph?: Partial<Metadata["openGraph"]>;
  twitter?: Partial<Metadata["twitter"]>;
}

export function buildLocalizedMetadata({
  locale,
  title,
  description,
  viPath,
  enPath,
  openGraph,
  twitter,
}: LocalizedMetadataOptions): Metadata {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const resolvedEnPath = enPath || localizedPath(viPath, "en");
  const resolvedViPath = viPath.startsWith("/") ? viPath : `/${viPath}`;

  const canonicalPath = locale === "en" ? resolvedEnPath : resolvedViPath;
  const canonicalUrl = `${siteUrl}${canonicalPath === "/" ? "" : canonicalPath}`;

  const viUrl = `${siteUrl}${resolvedViPath === "/" ? "" : resolvedViPath}`;
  const enUrl = `${siteUrl}${resolvedEnPath}`;

  const localizedTitle = locale === "en" ? translateText(title, "en") : title;
  const localizedDescription = description
    ? locale === "en"
      ? translateText(description, "en")
      : description
    : undefined;

  return {
    title: localizedTitle,
    description: localizedDescription,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        vi: viUrl,
        en: enUrl,
        "x-default": viUrl,
      },
    },
    openGraph: {
      title: localizedTitle,
      description: localizedDescription,
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: canonicalUrl,
      type: "website",
      siteName: locale === "en" ? "Topica International Institute" : "Viện Đào tạo Quốc tế Topica",
      ...openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: localizedTitle,
      description: localizedDescription,
      ...twitter,
    },
  };
}
