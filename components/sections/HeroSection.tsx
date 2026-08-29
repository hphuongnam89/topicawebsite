"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { LeadForm } from "@/components/forms/LeadForm";
import { fadeUp, staggerContainer } from "@/lib/motion";

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
    <section className="relative flex min-h-[600px] w-full items-center overflow-hidden lg:min-h-[720px]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={content.bgImage || DEFAULT_HERO_DATA.bgImage!}
          alt="Topica University Campus"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-ink-950/70 lg:bg-gradient-to-r lg:from-ink-950/95 lg:via-ink-950/80 lg:to-transparent" />
      </div>

      <Container className="relative z-10 py-12 lg:py-20">
        <div
          className={`grid grid-cols-1 items-center gap-12 ${content.showLeadForm ? "lg:grid-cols-2 lg:gap-8" : "max-w-3xl"}`}
        >
          {/* Left Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex max-w-xl flex-col"
          >
            {content.badge && (
              <motion.div variants={fadeUp} className="mb-6">
                <span className="bg-ink-900/50 inline-block rounded-full border border-brand-300/20 px-4 py-1.5 text-body-sm font-medium text-brand-300 backdrop-blur-sm">
                  {content.badge}
                </span>
              </motion.div>
            )}

            <motion.h1
              variants={fadeUp}
              className="mb-6 font-display text-4xl leading-tight font-bold whitespace-pre-line text-white uppercase sm:text-5xl lg:text-display"
            >
              {content.title}
            </motion.h1>

            <motion.p variants={fadeUp} className="mb-8 text-body-lg text-white/80">
              {content.description}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row">
              {content.ctaPrimaryText && (
                <ButtonLink
                  href={content.ctaPrimaryLink || "https://www.tuyensinh.topicauni.edu.vn/"}
                  size="lg"
                  variant="primary"
                >
                  {content.ctaPrimaryText}
                </ButtonLink>
              )}
              {content.ctaSecondaryText && (
                <ButtonLink
                  href={content.ctaSecondaryLink || "/nganh-dao-tao/"}
                  size="lg"
                  variant="secondary"
                  className="border-white text-white hover:bg-white/10 hover:text-white"
                >
                  {content.ctaSecondaryText}
                </ButtonLink>
              )}
            </motion.div>
          </motion.div>

          {/* Right Content - Lead Form */}
          {content.showLeadForm && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mx-auto w-full max-w-md lg:mr-0 lg:ml-auto"
            >
              <div className="bg-ink-900/40 rounded-xl p-2 backdrop-blur-md">
                <LeadForm />
              </div>
            </motion.div>
          )}
        </div>
      </Container>
    </section>
  );
}
