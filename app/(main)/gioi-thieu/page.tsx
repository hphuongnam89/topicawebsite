import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPageView } from "@/components/cms/CmsPageView";
import { cms } from "@/lib/cms";
import { env } from "@/lib/env";

import { buildLocalizedMetadata, resolveRequestLocale } from "@/lib/i18n/metadata";

export const revalidate = 300;

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
} = {}): Promise<Metadata> {
  const [page, locale] = await Promise.all([
    cms.getPageByPath("gioi-thieu").catch(() => null),
    resolveRequestLocale(searchParams),
  ]);
  return buildLocalizedMetadata({
    locale,
    title: page?.seo?.title || page?.title || "Giới thiệu",
    description:
      page?.seo?.description ||
      page?.excerpt ||
      "Giới thiệu Viện Đào tạo Quốc tế Topica, Trường Đại học Phú Xuân (PXU) - Thành viên EQuest, tiên phong đại học trực tuyến chất lượng cao.",
    viPath: "/gioi-thieu",
    enPath: "/en/about",
  });
}

export default async function AboutPage() {
  const page = await cms.getPageByPath("gioi-thieu").catch(() => null);
  if (!page) notFound();
  return <CmsPageView page={page} />;
}
