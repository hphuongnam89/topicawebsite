import { Mail, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { HeroSlider } from "@/components/sections/HeroSlider";
import { contactInfo } from "@/data/campuses";
import { homepageContent } from "@/data/homepage-content";
import { DecisionStrip } from "@/components/sections/DecisionStrip";
import { FitCheckSection } from "@/components/sections/FitCheckSection";
import { LegalValueSection } from "@/components/sections/LegalValueSection";
import { HomepageFAQ } from "@/components/sections/HomepageFAQ";
import { ProgramsSection } from "@/components/sections/ProgramsSection";
import { WhyTopicaSection } from "@/components/sections/WhyTopicaSection";

function Hero() {
  return <HeroSlider />;
}

function Contact() {
  return (
    <section className="bg-canvas py-16 sm:py-20 lg:py-24" aria-labelledby="contact-title">
      <Container>
        <div className="grid gap-8 border-t-2 border-ink-950 pt-8 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <div>
            <p className="text-body-sm font-semibold tracking-[0.14em] text-brand-700 uppercase">
              Cần một câu trả lời cụ thể?
            </p>
            <h2
              id="contact-title"
              className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] leading-tight font-semibold text-ink-950"
            >
              Nói với chúng tôi điều bạn đang cần biết.
            </h2>
          </div>
          <a
            href={`tel:${contactInfo.phone}`}
            data-track="phone_click"
            className="flex min-h-11 items-center gap-3 text-body font-semibold text-ink-950 underline decoration-brand-500 underline-offset-4 focus-visible:outline-info"
          >
            <Phone className="h-5 w-5 text-brand-700" aria-hidden="true" />
            {contactInfo.phone}
          </a>
          <a
            href={`mailto:${contactInfo.email}`}
            className="flex min-h-11 items-center gap-3 text-body font-semibold text-ink-950 underline decoration-brand-500 underline-offset-4 focus-visible:outline-info"
          >
            <Mail className="h-5 w-5 text-brand-700" aria-hidden="true" />
            {contactInfo.email}
          </a>
        </div>
      </Container>
    </section>
  );
}

export function Homepage() {
  return (
    <>
      <Hero />
      <DecisionStrip facts={homepageContent.facts} />
      <FitCheckSection />
      <ProgramsSection />
      <WhyTopicaSection />
      <LegalValueSection />
      <HomepageFAQ />
      <Contact />
    </>
  );
}
