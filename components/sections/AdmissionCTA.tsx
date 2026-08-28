import React from "react";
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
            Bạn đã sẵn sàng cho bước tiếp theo?
          </h2>

          <p className="mb-10 text-body-lg text-white/70">
            Đăng ký xét tuyển trực tuyến hoặc nhận tư vấn từ chuyên viên tuyển sinh Topica.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
            <ButtonLink href="https://www.tuyensinh.topicauni.edu.vn/" size="lg" variant="primary">
              Đăng ký xét tuyển
            </ButtonLink>
            <ButtonLink
              href="/lien-he/"
              size="lg"
              variant="secondary"
              className="border-white text-white hover:bg-white/10 hover:text-white"
            >
              Nhận tư vấn
            </ButtonLink>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
