import React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { LeadForm } from "@/components/forms/LeadForm";
import { ArrowRight } from "lucide-react";

export interface HeroSectionData {
  badge?: string;
  title?: string;
  description?: string;
  bgImage?: string;
  ctaPrimaryText?: string;
  ctaPrimaryLink?: string;
  ctaSecondaryText?: string;
  ctaSecondaryLink?: string;
  showLeadForm?: boolean;
}

interface HeroSectionProps {
  data?: HeroSectionData;
}

const DEFAULT_HERO_DATA: HeroSectionData = {
  badge: "Trường Đại học Phú Xuân — Viện Đào tạo Quốc tế Topica",
  title: "Học chủ động — Kiến tạo tương lai",
  description:
    "Chương trình đào tạo đại học trực tuyến chất lượng cao, linh hoạt thời gian, văn bằng cử nhân được Bộ GD&ĐT công nhận.",
  bgImage:
    "https://topicauni.edu.vn/wp-content/uploads/2026/06/gen-h-z7974881374708_9928c332948e9dc73c1de5527deb67d3.jpg",
  ctaPrimaryText: "Đăng ký xét tuyển",
  ctaPrimaryLink: "https://www.tuyensinh.topicauni.edu.vn/",
  ctaSecondaryText: "Xem ngành học",
  ctaSecondaryLink: "/nganh-dao-tao/",
  showLeadForm: false,
};

export function HeroSection({ data }: HeroSectionProps) {
  const content = { ...DEFAULT_HERO_DATA, ...data };

  return (
    <section
      className="relative flex w-full flex-col-reverse bg-navy-950 lg:block"
      aria-labelledby="homepage-title"
    >
      {/* Background Image */}
      <div className="relative h-64 w-full sm:h-80 lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-1/2">
        <Image
          src={content.bgImage || DEFAULT_HERO_DATA.bgImage!}
          alt="Môi trường học tập trực tuyến Topica"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-[62%_center]"
        />
        {/* Navy-tinted Gradient Overlay: ensures text readability on left while human warmth is visible on right */}
        <div className="absolute inset-0 hidden bg-gradient-to-r from-navy-950 via-transparent to-transparent lg:block" />
      </div>

      <Container className="relative z-10 py-10 sm:py-12 lg:min-h-[34rem] lg:py-20">
        <div
          className={`grid min-w-0 grid-cols-1 items-center gap-10 ${content.showLeadForm ? "lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:gap-12" : "lg:max-w-[48%]"}`}
        >
          {/* Left Content */}
          <div className="flex max-w-2xl min-w-0 flex-col">
            {content.badge && (
              <div
                className="homepage-enter mb-5"
                style={{ "--enter-delay": "40ms" } as React.CSSProperties}
              >
                <span className="inline-block rounded-full border border-gold-400/40 bg-navy-950/70 px-4 py-2 text-body-sm font-semibold text-gold-300 backdrop-blur-sm">
                  {content.badge}
                </span>
              </div>
            )}

            <h1
              id="homepage-title"
              className="homepage-enter mb-5 max-w-[18ch] font-display text-[clamp(2.25rem,6.5vw,3.75rem)] leading-[1.15] font-bold tracking-[-0.02em] text-white"
              style={{ "--enter-delay": "100ms" } as React.CSSProperties}
            >
              {content.title}
            </h1>

            <p
              className="homepage-enter mb-7 max-w-[58ch] text-body-lg text-white/80"
              style={{ "--enter-delay": "160ms" } as React.CSSProperties}
            >
              {content.description}
            </p>

            <div
              className="homepage-enter flex flex-col gap-3 sm:flex-row sm:flex-wrap"
              style={{ "--enter-delay": "220ms" } as React.CSSProperties}
            >
              {content.ctaPrimaryText && (
                <ButtonLink
                  href={content.ctaPrimaryLink || "https://www.tuyensinh.topicauni.edu.vn/"}
                  size="lg"
                  variant="accent"
                  rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
                >
                  {content.ctaPrimaryText}
                </ButtonLink>
              )}
              {content.ctaSecondaryText && (
                <ButtonLink
                  href={content.ctaSecondaryLink || "/nganh-dao-tao/"}
                  size="lg"
                  variant="secondary"
                  className="border-white/70 text-white hover:border-white hover:bg-white/10 hover:text-white"
                >
                  {content.ctaSecondaryText}
                </ButtonLink>
              )}
            </div>
          </div>

          {/* Right Content - Lead Form */}
          {content.showLeadForm && (
            <div
              className="homepage-enter mx-auto w-full max-w-md lg:mr-0 lg:ml-auto"
              style={{ "--enter-delay": "260ms" } as React.CSSProperties}
            >
              <div className="rounded-2xl border border-white/20 bg-white/10 p-1.5 shadow-2xl backdrop-blur-md sm:p-2">
                <LeadForm />
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
