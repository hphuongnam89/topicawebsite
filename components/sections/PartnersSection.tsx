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
    <section className="overflow-hidden bg-canvas py-16 sm:py-24" aria-labelledby="partners-title">
      <Container>
        {/* Header Area */}
        <div className="mb-14 text-center">
          <h2
            id="partners-title"
            className="font-display text-h2 font-bold text-brand-700 uppercase"
          >
            NHÀ TUYỂN DỤNG
          </h2>
          <div className="mx-auto mt-4 mb-6 h-[3px] w-12 bg-brand-500" />
          <p className="mx-auto max-w-[47.5rem] text-body-lg text-ink-600">
            Viện đào tạo Quốc tế Topica tự hào là đối tác của các đại học, viện nghiên cứu, doanh
            nghiệp, tập đoàn hàng đầu thế giới.
          </p>
        </div>

        {/* Marquee Area */}
        <div
          className="group relative mx-auto flex w-full max-w-[1200px] overflow-hidden motion-reduce:overflow-x-auto"
          role="region"
          aria-label="Danh sách đối tác của Topica"
          tabIndex={0}
        >
          {/* Fading Edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-canvas to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-canvas to-transparent" />

          <div className="animate-marquee flex w-max gap-6 py-4 group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
            {duplicatedPartners.map((src, idx) => (
              <div
                key={idx}
                aria-hidden={idx >= partners.length}
                className="flex aspect-[4/3] w-[160px] shrink-0 items-center justify-center rounded-lg border border-line-200 bg-white p-5 shadow-xs transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-sm motion-reduce:transform-none sm:w-[200px]"
              >
                <div className="relative h-full w-full">
                  <Image
                    src={src}
                    alt={idx < partners.length ? `Biểu trưng đối tác Topica ${idx + 1}` : ""}
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
