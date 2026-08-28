import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPageView } from "@/components/cms/CmsPageView";
import { cms } from "@/lib/cms";
import { env } from "@/lib/env";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await cms.getPageByPath("nhung-cau-hoi-thuong-gap").catch(() => null);
  return {
    title: page?.seo?.title || page?.title || "Những câu hỏi thường gặp",
    description: page?.seo?.description || page?.excerpt || undefined,
    alternates: {
      canonical: page?.seo?.canonicalUrl || `${env.NEXT_PUBLIC_SITE_URL}/nhung-cau-hoi-thuong-gap`,
    },
  };
}

export default async function FaqPage() {
  const page = await cms.getPageByPath("nhung-cau-hoi-thuong-gap").catch(() => null);
  if (!page) notFound();
  return <CmsPageView page={page} />;
}
