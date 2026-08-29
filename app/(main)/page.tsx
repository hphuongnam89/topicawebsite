import { HeroSection } from "@/components/sections/HeroSection";
import { TrustSection } from "@/components/sections/TrustSection";
import { ProgramsSection } from "@/components/sections/ProgramsSection";
import { WhyTopicaSection } from "@/components/sections/WhyTopicaSection";
import { NewsPreview } from "@/components/sections/NewsPreview";
import { TestimonialSection } from "@/components/sections/TestimonialSection";
import { AdmissionTimeline } from "@/components/sections/AdmissionTimeline";
import { PartnersSection } from "@/components/sections/PartnersSection";
import { CampusSection } from "@/components/sections/CampusSection";

import { env } from "@/lib/env";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSetting } from "@/lib/db";
import type { HeroSectionData } from "@/components/sections/HeroSection";
import { testimonials as staticTestimonials, type Testimonial } from "@/data/testimonials";

// Keep the homepage fast after the first render while preserving on-demand
// refreshes from the admin settings endpoint via revalidatePath("/").
export const revalidate = 300;

export default function Home() {
  const heroData = getSetting<HeroSectionData | undefined>("homepage_hero", undefined);
  const trustData = getSetting<any[] | undefined>("homepage_trust", undefined);
  const testimonialsData = getSetting<Testimonial[] | undefined>("homepage_testimonials", undefined);
  const finalTestimonials = testimonialsData && testimonialsData.length > 0 ? testimonialsData : staticTestimonials;

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
      <TrustSection data={trustData} />
      <ProgramsSection />
      <WhyTopicaSection />
      <NewsPreview />
      {/* TestimonialSection uses CMS data if available, otherwise falls back to static verified data */}
      {finalTestimonials && finalTestimonials.length > 0 && (
        <TestimonialSection data={finalTestimonials} />
      )}
      <AdmissionTimeline />
      <PartnersSection />
      <CampusSection />
    </>
  );
}
