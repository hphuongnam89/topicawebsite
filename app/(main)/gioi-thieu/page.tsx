import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPageView } from "@/components/cms/CmsPageView";
import { cms } from "@/lib/cms";
import { env } from "@/lib/env";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await cms.getPageByPath("gioi-thieu").catch(() => null);
  return {
    title: page?.seo?.title || page?.title || "Giới thiệu",
    description: page?.seo?.description || page?.excerpt || undefined,
    alternates: { canonical: page?.seo?.canonicalUrl || `${env.NEXT_PUBLIC_SITE_URL}/gioi-thieu` },
  };
}

export default async function AboutPage() {
  const page = await cms.getPageByPath("gioi-thieu").catch(() => null);
  if (!page) notFound();
  return <CmsPageView page={page} />;
}
