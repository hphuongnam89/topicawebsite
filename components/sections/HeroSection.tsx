"use client";

import { LocalizedText } from "@/components/i18n/LocalizedText";
import { LocalizedElement } from "@/components/i18n/LocalizedElement";
import React, { useEffect, useState } from "react";
import Image from "@/components/i18n/LocalizedImage";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export interface HeroSectionData {
  badge?: string;
  title?: string;
  description?: string;
  bgImage?: string;
  videoUrl?: string;
  ctaPrimaryText?: string;
  ctaPrimaryLink?: string;
  ctaSecondaryText?: string;
  ctaSecondaryLink?: string;
  showLeadForm?: boolean;
}

interface HeroSectionProps {
  data?: HeroSectionData;
}

interface HeroSlide {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  videoUrl?: string;
  primaryText: string;
  primaryLink: string;
  secondaryText: string;
  secondaryLink: string;
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

const SLIDE_INTERVAL = 3000;
const HERO_SLIDE_COUNT = 3;

export function HeroSection({ data }: HeroSectionProps) {
  const content = { ...DEFAULT_HERO_DATA, ...data };
  const prefersReducedMotion = useReducedMotion();
  const [activeSlide, setActiveSlide] = useState(0);
  const title = content.title?.replace(/\s*\r?\n\s*/g, " ") || DEFAULT_HERO_DATA.title!;

  const slides: HeroSlide[] = [
      {
        title,
        description: content.description || DEFAULT_HERO_DATA.description!,
        image: content.bgImage || DEFAULT_HERO_DATA.bgImage!,
        imageAlt: "Môi trường học tập trực tuyến của Topica",
        videoUrl: content.videoUrl,
        primaryText: content.ctaSecondaryText || "Xem ngành học",
        primaryLink: content.ctaSecondaryLink || "/nganh-dao-tao/",
        secondaryText: content.ctaPrimaryText || "Đăng ký xét tuyển",
        secondaryLink: content.ctaPrimaryLink || "https://www.tuyensinh.topicauni.edu.vn/",
      },
      {
        title: "5 ngành học — Chọn đúng hướng đi",
        description:
          "Khám phá các chương trình Kinh doanh, Du lịch, Công nghệ thông tin, Ngôn ngữ Anh và Ngôn ngữ Trung Quốc.",
        image: "/images/programs/program-business.webp",
        imageAlt: "Ảnh minh họa hoạt động cộng tác trong lĩnh vực kinh doanh",
        primaryText: "Khám phá ngành học",
        primaryLink: "/nganh-dao-tao/",
        secondaryText: "Đăng ký xét tuyển",
        secondaryLink: "https://www.tuyensinh.topicauni.edu.vn/",
      },
      {
        title: "Sáng tạo — Thế giới số trong tay bạn",
        description:
          "Tìm hiểu ngành Công nghệ thông tin, chuyên ngành Đồ họa kỹ thuật số và khung chương trình đào tạo.",
        image: "/images/programs/program-digital-design.webp",
        imageAlt: "Ảnh minh họa người học sáng tạo đồ họa kỹ thuật số",
        primaryText: "Xem chương trình CNTT",
        primaryLink: "/cong-nghe-thong-tin/",
        secondaryText: "Khám phá 5 ngành",
        secondaryLink: "/nganh-dao-tao/",
      },
    ];
  const activeSlideHasVideo = activeSlide === 0 && Boolean(content.videoUrl);

  useEffect(() => {
    if (prefersReducedMotion || activeSlideHasVideo) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % HERO_SLIDE_COUNT);
    }, SLIDE_INTERVAL);

    return () => window.clearInterval(timer);
  }, [activeSlide, activeSlideHasVideo, prefersReducedMotion]);

  const active = slides[activeSlide];
  const titleParts = active.title.match(/^(.*?)\s+([—–])\s+(.+)$/);

  return (
    <section
      className="hero-stage relative w-full overflow-hidden bg-navy-950"
      aria-labelledby="homepage-title"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeSlide}
          initial={prefersReducedMotion ? false : { opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, x: -36 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <Container className="grid gap-9 py-9 sm:gap-12 sm:py-12 lg:min-h-[39rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-stretch lg:gap-12 lg:py-14">
            <div className="flex min-w-0 flex-col justify-center min-h-[24rem] max-[380px]:min-h-[28rem] lg:min-h-0 lg:py-8 lg:pr-2">
              <LocalizedElement as="h1"
                id="homepage-title"
                aria-label={active.title}
                className="hero-title-reveal mb-6 max-w-[17ch] font-display text-[clamp(2.5rem,4.5vw,4rem)] leading-[1.04] font-bold tracking-[-0.03em] text-balance text-white"
                style={{ "--hero-delay": "160ms" } as React.CSSProperties}
              >
                <LocalizedText>{titleParts ? (
                  <>
                    <span className="block"><LocalizedText>{titleParts[1]}</LocalizedText></span>
                    <span className="hero-title-accent block">
                      <LocalizedText>{titleParts[2]}</LocalizedText> <LocalizedText>{titleParts[3]}</LocalizedText>
                    </span>
                  </>
                ) : (
                  active.title
                )}</LocalizedText>
              </LocalizedElement>

              <p
                className="hero-copy-reveal mb-7 max-w-[58ch] text-body-lg text-white/80"
                style={{ "--hero-delay": "220ms" } as React.CSSProperties}
              >
                <LocalizedText>{active.description}</LocalizedText>
              </p>

              <div
                className="hero-copy-reveal grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2"
                style={{ "--hero-delay": "300ms" } as React.CSSProperties}
              >
                {[active.primaryText, active.secondaryText].map((label, index) => {
                  const href = index === 0 ? active.primaryLink : active.secondaryLink;
                  const isPrimary = index === 0;

                  return (
                    <ButtonLink
                      key={`${label}-${href}`}
                      href={href}
                      size="lg"
                      variant={isPrimary ? "accent" : "secondary"}
                      className={
                        isPrimary
                          ? "hero-primary-cta w-full justify-center"
                          : "w-full justify-center border-white/70 text-white hover:border-white hover:bg-white/10 hover:text-white"
                      }
                      rightIcon={
                        isPrimary ? (
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        ) : undefined
                      }
                    >
                      <LocalizedText>{label}</LocalizedText>
                    </ButtonLink>
                  );
                })}
              </div>
            </div>

            <div
              className="hero-image-reveal group relative isolate min-h-[16rem] overflow-hidden rounded-[1.5rem] border border-white/15 shadow-[0_24px_70px_-32px_rgba(0,0,0,0.72)] sm:min-h-[22rem] lg:min-h-[unset] lg:rounded-tl-[4rem] lg:rounded-br-[4rem]"
              style={{ "--hero-delay": "80ms" } as React.CSSProperties}
            >
              {active.videoUrl && !prefersReducedMotion ? (
                <video
                  src={active.videoUrl}
                  autoPlay
                  muted
                  playsInline
                  preload="metadata"
                  poster={active.image}
                  aria-hidden="true"
                  onEnded={() => setActiveSlide((current) => (current + 1) % HERO_SLIDE_COUNT)}
                  className="hero-image-reveal__image absolute inset-0 h-full w-full object-cover object-[62%_center]"
                />
              ) : (
                <Image
                  src={active.image}
                  alt={active.imageAlt}
                  fill
                  priority={activeSlide === 0}
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className="hero-image-reveal__image object-cover object-[62%_center]"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/45 via-transparent to-transparent lg:bg-gradient-to-r lg:from-navy-950/20 lg:via-transparent lg:to-transparent" />
              <span
                className="hero-image-rule absolute inset-x-0 bottom-0 z-10 h-[3px]"
                aria-hidden="true"
              />
            </div>

            <LocalizedElement as="div"
              className="col-span-full -mt-5 flex justify-center gap-2 lg:-mt-8"
              role="group"
              aria-label="Chọn banner giới thiệu"
            >
              {slides.map((slide, index) => (
                <LocalizedElement as="button"
                  key={slide.title}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Hiển thị banner ${index + 1}: ${slide.title}`}
                  aria-current={activeSlide === index ? "true" : undefined}
                  className="flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300"
                >
                  <span
                    className={`h-2.5 rounded-full transition-[width,background-color] duration-300 ${
                      activeSlide === index ? "w-9 bg-brand-400" : "w-2.5 bg-white/60"
                    }`}
                    aria-hidden="true"
                  />
                </LocalizedElement>
              ))}
            </LocalizedElement>
          </Container>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
