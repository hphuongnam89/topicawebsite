import { LocalizedText } from "@/components/i18n/LocalizedText";
import React from "react";
import Link from "@/components/i18n/LocalizedLink";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export function AdmissionCTA() {
  return (
    <section className="bg-ink-950 py-16 lg:py-24">
      <Container size="narrow">
        <ScrollReveal
          variant="fadeUp"
          className="flex flex-col items-center justify-center text-center"
        >
          {/* Decorative Accent */}
          <div className="mb-8 h-1 w-16 rounded-full bg-brand-500" />

          <h2 className="mb-6 font-display text-h1 text-white">
            <LocalizedText>Bạn đã sẵn sàng cho bước tiếp theo?
          </LocalizedText></h2>

          <p className="mb-10 text-body-lg text-white/70">
            <LocalizedText>Đăng ký xét tuyển trực tuyến hoặc nhận tư vấn từ chuyên viên tuyển sinh Topica.
          </LocalizedText></p>

          <div className="grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
            <ButtonLink href="https://www.tuyensinh.topicauni.edu.vn/" size="lg" variant="accent" external className="w-full justify-center">
              <LocalizedText>Đăng ký xét tuyển
            </LocalizedText></ButtonLink>
            <ButtonLink
              href="/lien-he/"
              size="lg"
              variant="secondary"
              className="w-full justify-center border-white/30 text-white hover:bg-white/10 hover:text-white"
            >
              <LocalizedText>Nhận tư vấn
            </LocalizedText></ButtonLink>
          </div>

          <div className="mt-6 text-xs text-white/60">
            <LocalizedText>Tìm hiểu thêm về</LocalizedText><LocalizedText>{" "}</LocalizedText>
            <Link
              href="/tuyen-sinh/hoc-phi-hoc-bong/"
              className="text-gold-400 underline underline-offset-4 hover:text-gold-300 transition-colors"
            >
              <LocalizedText>Biểu phí & Học bổng năm 2026
            </LocalizedText></Link>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
