import { LocalizedText } from "@/components/i18n/LocalizedText";
import { LocalizedElement } from "@/components/i18n/LocalizedElement";
import { HeroSection } from "@/components/sections/HeroSection";
import { TrustSection } from "@/components/sections/TrustSection";
import { ProgramsSection } from "@/components/sections/ProgramsSection";
import { WhyTopicaSection } from "@/components/sections/WhyTopicaSection";
import { NewsPreview } from "@/components/sections/NewsPreview";
import { TestimonialSection } from "@/components/sections/TestimonialSection";
import { AdmissionTimeline } from "@/components/sections/AdmissionTimeline";
import { PartnersSection } from "@/components/sections/PartnersSection";
import { CampusSection } from "@/components/sections/CampusSection";
import { CurrentAdmissions } from "@/components/admission/CurrentAdmissions";
import { LeadForm } from "@/components/forms/LeadForm";
import { Container } from "@/components/ui/Container";

import { env } from "@/lib/env";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSetting } from "@/lib/db";
import { getLivePrograms, getLiveContact } from "@/lib/services/public-site";
import type { HeroSectionData } from "@/components/sections/HeroSection";
import { testimonials as staticTestimonials, type Testimonial } from "@/data/testimonials";

// Keep the homepage fast after the first render while preserving on-demand
// refreshes from the admin settings endpoint via revalidatePath("/").
export const revalidate = 300;
export const metadata: Metadata = {
  alternates: { canonical: "/", languages: { vi: "/", en: "/en" } },
};

export default function Home() {
  const contact = getLiveContact();
  const heroData = getSetting<HeroSectionData | undefined>("homepage_hero", undefined);
  const trustData = getSetting<any[] | undefined>("homepage_trust", undefined);
  const testimonialsData = getSetting<Testimonial[] | undefined>(
    "homepage_testimonials",
    undefined,
  );
  const finalTestimonials =
    testimonialsData && testimonialsData.length > 0 ? testimonialsData : staticTestimonials;

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Viện Đào tạo Quốc tế Topica",
    url: env.NEXT_PUBLIC_SITE_URL,
    logo: `${env.NEXT_PUBLIC_SITE_URL}/topica-logo.png`,
    sameAs: [
      "https://www.facebook.com/topica.edu.vn",
      "https://www.youtube.com/user/TopicaVietnam",
    ],
    description:
      "Viện Đào tạo Quốc tế Topica tiên phong trong lĩnh vực đào tạo trực tuyến chất lượng cao tại Đông Nam Á.",
  };

  return (
    <>
      <JsonLd data={orgJsonLd} />
      <HeroSection data={heroData} />
      <CurrentAdmissions />
      <ProgramsSection programs={getLivePrograms()} />
      <TrustSection data={trustData} />
      <WhyTopicaSection />
      <AdmissionTimeline />
      {heroData?.showLeadForm && (
        <LocalizedElement as="section"
          id="tu-van"
          aria-label="Nhận tư vấn tuyển sinh"
          className="scroll-mt-20 border-t border-line-100 bg-navy-50/70 py-16 sm:py-20"
        >
          <Container className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="max-w-lg lg:col-span-5">
              <span className="inline-block rounded-full border border-gold-300 bg-gold-50/80 px-3.5 py-1 text-xs font-semibold text-gold-800">
                <LocalizedText>Tư vấn tuyển sinh 2026
              </LocalizedText></span>
              <h2 className="mt-3 font-display text-h2 font-bold text-navy-950">
                <LocalizedText>Cùng tìm lộ trình phù hợp
              </LocalizedText></h2>
              <p className="mt-4 text-body-lg leading-relaxed text-ink-700">
                <LocalizedText>Bạn có thể nhận tư vấn khi chưa quyết định ngành học. Để lại thông tin liên hệ và
                những điều bạn muốn tìm hiểu.
              </LocalizedText></p>
              <div className="mt-6 space-y-2.5 text-body-sm text-ink-600">
                <div className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-navy-700" />
                  <span><LocalizedText>Tư vấn hoàn toàn miễn phí từ chuyên viên đào tạo Topica</LocalizedText></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-navy-700" />
                  <span><LocalizedText>Hướng dẫn chi tiết thủ tục xét miễn giảm tín chỉ</LocalizedText></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-navy-700" />
                  <span><LocalizedText>Bảo mật dữ liệu cá nhân theo quy định</LocalizedText></span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-line-200 bg-canvas p-6 shadow-sm sm:p-8">
                <LeadForm />
              </div>
            </div>
          </Container>
        </LocalizedElement>
      )}
      {/* TestimonialSection uses CMS data if available, otherwise falls back to static verified data */}
      {finalTestimonials && finalTestimonials.length > 0 && (
        <TestimonialSection data={finalTestimonials} />
      )}
      <NewsPreview />
      <PartnersSection />
      <CampusSection channels={contact.channels} locations={contact.locations} />
    </>
  );
}
import type { Metadata } from "next";
