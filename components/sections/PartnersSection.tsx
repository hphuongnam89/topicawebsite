"use client";

import Image from "next/image";
import { Container } from "@/components/ui/Container";

const partners = [
  "https://topicauni.edu.vn/wp-content/uploads/2026/01/1.png",
  "https://topicauni.edu.vn/wp-content/uploads/2026/01/2.png",
  "https://topicauni.edu.vn/wp-content/uploads/2026/01/3.png",
  "https://topicauni.edu.vn/wp-content/uploads/2026/01/4.png",
  "https://topicauni.edu.vn/wp-content/uploads/2026/01/5.png",
  "https://topicauni.edu.vn/wp-content/uploads/2026/01/6.png",
  "https://topicauni.edu.vn/wp-content/uploads/2026/01/7.png",
  "https://topicauni.edu.vn/wp-content/uploads/2026/01/8.png",
  "https://topicauni.edu.vn/wp-content/uploads/2026/01/9.png",
];

// Duplicate the array for seamless marquee scrolling
const duplicatedPartners = [...partners, ...partners];

export function PartnersSection() {
  return (
    <section className="bg-canvas py-16 sm:py-24 overflow-hidden">
      <Container>
        {/* Header Area */}
        <div className="mb-14 text-center">
          <h2 className="font-display text-h2 font-bold text-brand-500 uppercase">
            NHÀ TUYỂN DỤNG
          </h2>
          <div className="mx-auto mt-4 mb-6 h-[3px] w-12 bg-brand-500" />
          <p className="mx-auto max-w-[47.5rem] text-body-lg text-ink-600">
            Viện đào tạo Quốc tế Topica tự hào là đối tác của các đại học, viện nghiên cứu, doanh nghiệp, tập đoàn hàng đầu thế giới.
          </p>
        </div>

        {/* Marquee Area */}
        <div className="relative mx-auto flex w-full max-w-[1200px] overflow-hidden">
          {/* Fading Edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-canvas to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-canvas to-transparent" />

          <div className="flex w-max animate-marquee gap-6 py-4">
            {duplicatedPartners.map((src, idx) => (
              <div
                key={idx}
                className="flex aspect-square w-[160px] shrink-0 items-center justify-center rounded-xl bg-white p-6 shadow-xs ring-1 ring-ink-100 transition-all hover:scale-105 hover:shadow-md sm:w-[200px]"
              >
                <div className="relative h-full w-full">
                  <Image
                    src={src}
                    alt={`Nhà tuyển dụng ${idx + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 160px, 200px"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
