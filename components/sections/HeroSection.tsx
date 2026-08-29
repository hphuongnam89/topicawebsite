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
  badge: "Trực thuộc Trường Đại học Phú Xuân — Thành viên EQuest",
  title: "HỌC CHỦ ĐỘNG —\nKIẾN TẠO TƯƠNG LAI",
  description:
    "Chương trình đào tạo từ xa chất lượng cao, linh hoạt thời gian, được Bộ GD&ĐT công nhận.",
  bgImage:
    "https://topicauni.edu.vn/wp-content/uploads/2026/06/gen-h-z7974881374708_9928c332948e9dc73c1de5527deb67d3.jpg",
  ctaPrimaryText: "Đăng ký xét tuyển",
  ctaPrimaryLink: "https://www.tuyensinh.topicauni.edu.vn/",
  ctaSecondaryText: "Xem ngành học",
  ctaSecondaryLink: "/nganh-dao-tao/",
  showLeadForm: true,
};

export function HeroSection({ data }: HeroSectionProps) {
  const content = { ...DEFAULT_HERO_DATA, ...data };

  return (
    <section
      className="relative flex min-h-[calc(100svh-var(--height-header-compact))] w-full items-center overflow-hidden bg-ink-950"
      aria-labelledby="homepage-title"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={content.bgImage || DEFAULT_HERO_DATA.bgImage!}
          alt="Lớp học trực tuyến của Topica"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center] lg:object-center"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-ink-950/80 lg:bg-gradient-to-r lg:from-ink-950/95 lg:via-ink-950/85 lg:to-ink-950/35" />
      </div>

      <Container className="relative z-10 py-10 sm:py-12 lg:py-12">
        <div
          className={`grid min-w-0 grid-cols-1 items-center gap-10 ${content.showLeadForm ? "lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:gap-12" : "max-w-3xl"}`}
        >
          {/* Left Content */}
          <div className="flex max-w-2xl min-w-0 flex-col">
            {content.badge && (
              <div
                className="homepage-enter mb-5"
                style={{ "--enter-delay": "40ms" } as React.CSSProperties}
              >
                <span className="inline-block rounded-full border border-brand-300/35 bg-ink-950/45 px-4 py-2 text-body-sm font-semibold text-brand-300 backdrop-blur-sm">
                  {content.badge}
                </span>
              </div>
            )}

            <h1
              id="homepage-title"
              className="homepage-enter mb-5 max-w-[13ch] font-display text-[clamp(2.35rem,7.8vw,4rem)] leading-[1.08] font-bold tracking-[-0.025em] whitespace-pre-line text-white uppercase"
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
              className="homepage-enter flex flex-col gap-3 min-[390px]:flex-row"
              style={{ "--enter-delay": "220ms" } as React.CSSProperties}
            >
              {content.ctaPrimaryText && (
                <ButtonLink
                  href={content.ctaPrimaryLink || "https://www.tuyensinh.topicauni.edu.vn/"}
                  size="lg"
                  variant="primary"
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
              <div className="rounded-[1.25rem] border border-white/25 bg-ink-950/45 p-2 shadow-xl shadow-ink-950/20 backdrop-blur-md sm:p-2.5">
                <LeadForm />
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
