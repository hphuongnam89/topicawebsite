import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cms } from "@/lib/cms";
import { env } from "@/lib/env";
import { PageHeader } from "@/components/layout/PageHeader";
import { TuitionHub } from "@/components/tuition/TuitionHub";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await cms.getPageByPath("tuyen-sinh/hoc-phi-hoc-bong").catch(() => null);
  return {
    title: page?.seo?.title || page?.title || "Học phí & Học bổng",
    description: page?.seo?.description || page?.excerpt || "Thông tin chi tiết về học phí và các chương trình học bổng tại Topica.",
    alternates: { canonical: page?.seo?.canonicalUrl || `${env.NEXT_PUBLIC_SITE_URL}/tuyen-sinh/hoc-phi-hoc-bong` },
  };
}

export default async function TuitionPage() {
  const page = await cms.getPageByPath("tuyen-sinh/hoc-phi-hoc-bong").catch(() => null);
  
  return (
    <main className="min-h-screen bg-canvas">
      <PageHeader
        title={page?.title || "Học phí & Học bổng"}
        subtitle={page?.excerpt || "Cập nhật chính sách học phí và các chương trình học bổng mới nhất."}
        breadcrumbs={[
          { label: "Trang chủ", href: "/" },
          { label: "Tuyển sinh", href: "/tuyen-sinh/" },
          { label: "Học phí & Học bổng" }
        ]}
      />
      <TuitionHub />
    </main>
  );
}
