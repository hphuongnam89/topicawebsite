import type { Metadata } from "next";
import { AdmissionHub } from "@/components/admission/AdmissionHub";
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
    cms.getPageByPath("tuyen-sinh").catch(() => null),
    resolveRequestLocale(searchParams),
  ]);
  return buildLocalizedMetadata({
    locale,
    title: page?.seo?.title || page?.title || "Tuyển sinh",
    description: page?.seo?.description || page?.excerpt || undefined,
    viPath: "/tuyen-sinh",
    enPath: "/en/admissions",
  });
}

export default async function AdmissionsPage() {
  const page = await cms.getPageByPath("tuyen-sinh").catch(() => null);
  return (
    <AdmissionHub
      page={
        page || {
          excerpt: "Tìm ngành học, xem điều kiện và xác nhận lịch nhận hồ sơ phù hợp.",
        }
      }
    />
  );
}
