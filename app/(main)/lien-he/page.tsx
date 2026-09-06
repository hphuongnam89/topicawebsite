import type { Metadata } from "next";
import { Building2, Mail, MapPin, Phone } from "lucide-react";
import { LeadForm } from "@/components/forms/LeadForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { campuses, contactInfo } from "@/data/campuses";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Thông tin liên hệ và địa điểm hỗ trợ tuyển sinh của Viện Đào tạo Quốc tế Topica.",
  alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/lien-he` },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Liên hệ"
        subtitle="Chọn kênh phù hợp để hỏi về điều kiện tuyển sinh, hồ sơ, học phí hoặc lộ trình học."
        breadcrumbs={[{ label: "Trang chủ", href: "/" }, { label: "Liên hệ" }]}
      />

      <section className="bg-canvas py-14 md:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-body-sm font-semibold tracking-[0.12em] text-brand-700 uppercase">
                Liên hệ trực tiếp
              </p>
              <h2 className="mt-3 font-display text-h2 font-semibold text-ink-950">
                Nhận thông tin đúng theo hồ sơ của bạn
              </h2>
              <p className="mt-4 text-body leading-7 text-ink-600">
                Khi liên hệ, bạn nên chuẩn bị văn bằng cao nhất, ngành quan tâm và thời gian có thể
                học để đội ngũ tư vấn đối chiếu chính xác.
              </p>

              <div className="mt-8 space-y-4">
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="hover:border-brand-400 flex items-center gap-4 rounded-xl border border-line-200 bg-paper p-5 transition-colors"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <Phone aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="text-ink-500 block text-body-sm">Hotline tuyển sinh</span>
                    <span className="mt-1 block font-semibold text-ink-950">
                      {contactInfo.phone}
                    </span>
                  </span>
                </a>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="hover:border-brand-400 flex items-center gap-4 rounded-xl border border-line-200 bg-paper p-5 transition-colors"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <Mail aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="text-ink-500 block text-body-sm">Email</span>
                    <span className="mt-1 block font-semibold text-ink-950">
                      {contactInfo.email}
                    </span>
                  </span>
                </a>
              </div>

              <p className="text-ink-500 mt-5 text-body-sm">
                Thông tin liên hệ được đối chiếu từ website chính thức của Topica.
              </p>
            </div>

            <LeadForm
              id="contact-consultation-form"
              heading="Đăng ký nhận tư vấn"
              description="Điền họ tên và số điện thoại. Đội ngũ tuyển sinh sẽ liên hệ để trao đổi thông tin phù hợp với hồ sơ của bạn."
            />
          </div>
        </Container>
      </section>

      <section className="border-t border-line-200 bg-paper py-14 md:py-20">
        <Container>
          <div className="max-w-3xl">
            <p className="text-body-sm font-semibold tracking-[0.12em] text-brand-700 uppercase">
              Địa điểm hỗ trợ
            </p>
            <h2 className="mt-3 font-display text-h2 font-semibold text-ink-950">
              Văn phòng tại 6 thành phố
            </h2>
            <p className="mt-4 text-body text-ink-600">
              Hãy liên hệ trước khi đến để xác nhận thời gian và địa điểm tiếp nhận hồ sơ.
            </p>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campuses.map((campus) => (
              <article
                key={campus.city}
                className="rounded-xl border border-line-200 bg-canvas p-6"
              >
                <div className="flex items-center gap-3 text-brand-700">
                  <Building2 aria-hidden="true" className="h-5 w-5" />
                  <h3 className="font-semibold text-ink-950">{campus.city}</h3>
                </div>
                <p className="mt-4 flex items-start gap-3 text-body-sm leading-6 text-ink-600">
                  <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  <span>{campus.address}</span>
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
