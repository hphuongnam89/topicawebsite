import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdmissionHub } from "@/components/admission/AdmissionHub";
import { cms } from "@/lib/cms";
import { env } from "@/lib/env";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await cms.getPageByPath("tuyen-sinh").catch(() => null);
  return {
    title: page?.seo?.title || page?.title || "Tuyển sinh",
    description: page?.seo?.description || page?.excerpt || undefined,
    alternates: { canonical: page?.seo?.canonicalUrl || `${env.NEXT_PUBLIC_SITE_URL}/tuyen-sinh` },
  };
}

export default async function AdmissionsPage() {
  const page = await cms.getPageByPath("tuyen-sinh").catch(() => null);
  if (!page) notFound();

  return <AdmissionHub page={page} />;
}
