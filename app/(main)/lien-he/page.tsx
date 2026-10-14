import type { Metadata } from "next";
import { BookOpen, ExternalLink, FileText, GraduationCap } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { LeadForm } from "@/components/forms/LeadForm";
import { CampusSection } from "@/components/sections/CampusSection";
import { getLiveContact } from "@/lib/services/public-site";
import { servicePortals } from "@/data/campuses";
import { cms } from "@/lib/cms";
import { env } from "@/lib/env";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await cms.getPageByPath("lien-he").catch(() => null);
  return {
    title: page?.seo?.title || page?.title || "Liên hệ",
    description: page?.seo?.description || page?.excerpt || undefined,
    alternates: { canonical: page?.seo?.canonicalUrl || `${env.NEXT_PUBLIC_SITE_URL}/lien-he` },
  };
}

export default async function ContactPage() {
  const page = await cms.getPageByPath("lien-he").catch(() => null);
  const contact = getLiveContact();
  return (
    <>
      <PageHeader
        title={page?.title || "Liên hệ & nhận tư vấn"}
        subtitle="Trao đổi về ngành học, hồ sơ và lộ trình phù hợp."
        breadcrumbs={[{ label: "Trang chủ", href: "/" }, { label: "Liên hệ" }]}
      />
      <section className="bg-canvas py-12 sm:py-16" aria-labelledby="contact-form-title">
        <Container className="grid items-start gap-8 lg:grid-cols-2">
          <div>
            <h2 id="contact-form-title" className="text-h2 font-bold text-navy-950">
              Nhận tư vấn tuyển sinh
            </h2>
            <p className="mt-4 text-body-lg text-ink-700">
              Bạn chưa chọn ngành cũng có thể gửi yêu cầu. Biểu mẫu này ghi nhận nhu cầu tư vấn.
            </p>
            <dl className="mt-6 space-y-4">
              {[contact.channels.admissionsHotline, contact.channels.admissionsEmail].map(
                (channel) => (
                  <div key={channel.href}>
                    <dt className="font-semibold text-ink-950">{channel.label}</dt>
                    <dd>
                      <a className="break-all text-navy-700 underline hover:text-gold-700" href={channel.href}>
                        {channel.value}
                      </a>
                    </dd>
                  </div>
                ),
              )}
            </dl>
          </div>
          <LeadForm />
        </Container>
      </section>

      {/* Service Portals Directory for Students & Applicants */}
      <section className="bg-surface-subtle py-12 border-y border-line-200" aria-labelledby="services-title">
        <Container>
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.16em] text-navy-700 uppercase">
              Cổng dịch vụ số
            </p>
            <h2 id="services-title" className="mt-2 text-2xl font-bold text-navy-950 sm:text-3xl">
              Hệ thống học tập & Tra cứu trực tuyến
            </h2>
            <p className="mt-2 text-sm text-ink-600">
              Phân định các cổng thông tin chuyên trách dành cho thí sinh đăng ký và sinh viên đang theo học.
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {servicePortals.map((portal) => {
              const Icon =
                portal.id === "elearning"
                  ? GraduationCap
                  : portal.id === "elib"
                    ? BookOpen
                    : FileText;

              return (
                <article
                  key={portal.id}
                  className="flex flex-col justify-between rounded-xl border border-line-200 bg-white p-6 shadow-sm transition-all hover:border-gold-400 hover:shadow-md"
                >
                  <div>
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50 text-navy-900 border border-navy-100">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-sans text-lg font-bold text-navy-950">
                      {portal.name}
                    </h3>
                    <p className="mt-2 text-sm text-ink-600 leading-relaxed">
                      {portal.role}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-line-100">
                    <a
                      href={portal.url}
                      target={portal.isExternal ? "_blank" : undefined}
                      rel={portal.isExternal ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-700 hover:text-gold-700 transition-colors"
                    >
                      Truy cập cổng
                      {portal.isExternal ? (
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <span aria-hidden="true">→</span>
                      )}
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <CampusSection channels={contact.channels} locations={contact.locations} />
    </>
  );
}
