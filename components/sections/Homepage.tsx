import { ArrowRight, CheckCircle2, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { LeadForm } from "@/components/forms/LeadForm";
import { contactInfo } from "@/data/campuses";
import { homepageContent } from "@/data/homepage-content";
import { DecisionStrip } from "@/components/sections/DecisionStrip";
import { FitCheckSection } from "@/components/sections/FitCheckSection";
import { LegalValueSection } from "@/components/sections/LegalValueSection";
import { HomepageFAQ } from "@/components/sections/HomepageFAQ";
import { ProgramsSection } from "@/components/sections/ProgramsSection";
import { WhyTopicaSection } from "@/components/sections/WhyTopicaSection";

function Hero() {
  return (
    <section
      className="relative overflow-hidden bg-ink-950 text-white"
      aria-labelledby="homepage-title"
      aria-describedby="homepage-description"
    >
      <div className="absolute inset-0 opacity-35" aria-hidden="true">
        <div className="absolute -top-40 right-[-10%] h-[34rem] w-[34rem] rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute bottom-[-30%] left-[-10%] h-[30rem] w-[30rem] rounded-full border border-brand-300/20" />
      </div>
      <Container className="relative grid gap-10 py-14 min-[820px]:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.75fr)] min-[820px]:items-center min-[820px]:gap-8 sm:py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.65fr)] lg:gap-16 lg:pt-14 lg:pb-20">
        <div className="max-w-3xl min-w-0">
          <p className="homepage-enter homepage-enter-delay-40 text-body-sm font-semibold tracking-[0.14em] text-brand-300">
            {homepageContent.hero.eyebrow}
          </p>
          <h1
            id="homepage-title"
            className="homepage-enter homepage-enter-delay-100 mt-6 max-w-[14ch] font-display text-[clamp(2.45rem,6vw,5rem)] leading-[1.04] font-semibold text-white"
          >
            {homepageContent.hero.title}
          </h1>
          <p
            id="homepage-description"
            className="homepage-enter homepage-enter-delay-160 mt-6 max-w-[58ch] text-body-lg leading-relaxed text-white/75"
          >
            {homepageContent.hero.description}
          </p>
          <div className="homepage-enter homepage-enter-delay-220 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink
              href="#consultation-form"
              data-track="hero_primary_cta_click"
              size="lg"
              rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            >
              {homepageContent.hero.primaryCta}
            </ButtonLink>
            <ButtonLink
              href="#programs"
              data-track="hero_secondary_cta_click"
              variant="secondary"
              size="lg"
              className="border-white/50 text-white hover:border-white hover:bg-white/10 hover:text-white"
            >
              {homepageContent.hero.secondaryCta}
            </ButtonLink>
          </div>
          <ul
            className="homepage-enter homepage-enter-delay-260 mt-8 flex flex-wrap gap-2"
            aria-label="Điểm nổi bật"
          >
            <li className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-body-sm text-white/75 backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4 text-brand-300" aria-hidden="true" />
              Học linh hoạt
            </li>
            <li className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-body-sm text-white/75 backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4 text-brand-300" aria-hidden="true" />
              Tư vấn theo hồ sơ
            </li>
            <li className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-body-sm text-white/75 backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4 text-brand-300" aria-hidden="true" />
              Nguồn chính thức rõ ràng
            </li>
          </ul>
        </div>
        <div
          id="consultation-form"
          className="homepage-enter homepage-enter-delay-260 min-w-0 scroll-mt-24"
        >
          <LeadForm
            heading={homepageContent.hero.formTitle}
            description={homepageContent.hero.formDescription}
            responseTime={homepageContent.hero.responseTime}
          />
        </div>
      </Container>
    </section>
  );
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
            <MapPin className="h-5 w-5 text-brand-700" aria-hidden="true" />
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
