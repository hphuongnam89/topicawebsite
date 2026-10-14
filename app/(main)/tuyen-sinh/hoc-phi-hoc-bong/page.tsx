import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cms } from "@/lib/cms";
import { env } from "@/lib/env";
import { PageHeader } from "@/components/layout/PageHeader";
import { TuitionHub } from "@/components/tuition/TuitionHub";
import { getPublicDocuments } from "@/lib/services/cms-models";
import { getLiveTuitionPrograms, getLiveScholarships } from "@/lib/services/public-site";

import { buildLocalizedMetadata, resolveRequestLocale } from "@/lib/i18n/metadata";

export const revalidate = 300;

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
} = {}): Promise<Metadata> {
  const [page, locale] = await Promise.all([
    cms.getPageByPath("tuyen-sinh/hoc-phi-hoc-bong").catch(() => null),
    resolveRequestLocale(searchParams),
  ]);
  return buildLocalizedMetadata({
    locale,
    title: page?.seo?.title || page?.title || "Học phí & Học bổng",
    description:
      page?.seo?.description ||
      page?.excerpt ||
      "Thông tin chi tiết về học phí và các chương trình học bổng tại Topica.",
    viPath: "/tuyen-sinh/hoc-phi-hoc-bong",
    enPath: "/en/tuition",
  });
}

export default async function TuitionPage() {
  const page = await cms.getPageByPath("tuyen-sinh/hoc-phi-hoc-bong").catch(() => null);

  return (
    <div className="min-h-screen bg-canvas">
      <PageHeader
        title={page?.title || "Học phí & Học bổng"}
        subtitle={
          page?.excerpt || "Cập nhật chính sách học phí và các chương trình học bổng mới nhất."
        }
        breadcrumbs={[
          { label: "Trang chủ", href: "/" },
          { label: "Tuyển sinh", href: "/tuyen-sinh/" },
          { label: "Học phí & Học bổng" },
        ]}
      />
      <TuitionHub
        tuitionPrograms={getLiveTuitionPrograms()}
        scholarships={getLiveScholarships()}
        documents={getPublicDocuments()}
      />
    </div>
  );
}
