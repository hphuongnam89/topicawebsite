"use client";

import Image from "next/image";
import { Container } from "@/components/ui/Container";

const partners = [
  { name: "Deakin University", src: "https://topicauni.edu.vn/wp-content/uploads/2026/01/1.png" },
  { name: "OBC", src: "https://topicauni.edu.vn/wp-content/uploads/2026/01/2.png" },
  { name: "Thaco Agri", src: "https://topicauni.edu.vn/wp-content/uploads/2026/01/3.png" },
  { name: "Deha Digital Solutions", src: "https://topicauni.edu.vn/wp-content/uploads/2026/01/4.png" },
  { name: "Deha Software", src: "https://topicauni.edu.vn/wp-content/uploads/2026/01/5.png" },
  { name: "Đối tác 6", src: "https://topicauni.edu.vn/wp-content/uploads/2026/01/6.png" },
  { name: "Đối tác 7", src: "https://topicauni.edu.vn/wp-content/uploads/2026/01/7.png" },
  { name: "Đối tác 8", src: "https://topicauni.edu.vn/wp-content/uploads/2026/01/8.png" },
  { name: "Đối tác 9", src: "https://topicauni.edu.vn/wp-content/uploads/2026/01/9.png" },
];

// Duplicate the array for seamless infinite marquee scrolling
const duplicatedPartners = [...partners, ...partners];

export function PartnersSection() {
  return (
    <section className="overflow-hidden bg-canvas py-16 sm:py-24" aria-labelledby="partners-title">
      <Container>
        {/* Header Area */}
        <div className="mb-14 text-center">
          <h2
            id="partners-title"
            className="font-display text-h2 font-bold text-navy-900 uppercase"
          >
            NHÀ TUYỂN DỤNG & ĐỐI TÁC
          </h2>
          <div className="mx-auto mt-4 mb-6 h-[3px] w-12 bg-gold-500" />
          <p className="mx-auto max-w-[47.5rem] text-body-lg text-ink-600">
            Viện đào tạo Quốc tế Topica tự hào là đối tác của các đại học, viện nghiên cứu, doanh
            nghiệp và tập đoàn hàng đầu trong nước và quốc tế.
          </p>
        </div>
      </Container>

      {/* Marquee Area - Full width with gradient fading edges */}
      <div
        className="group relative mx-auto flex w-full max-w-[1400px] overflow-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="region"
        aria-label="Danh sách đối tác của Topica"
      >
        {/* Fading Edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 sm:w-40 bg-gradient-to-r from-canvas via-canvas/80 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 sm:w-40 bg-gradient-to-l from-canvas via-canvas/80 to-transparent" />

        {/* Continuous Auto-sliding Track */}
        <div className="animate-marquee flex w-max gap-6 sm:gap-8 py-4">
          {duplicatedPartners.map((item, idx) => (
            <div
              key={`${item.name}-${idx}`}
              aria-hidden={idx >= partners.length}
              className="flex h-[110px] w-[220px] sm:h-[130px] sm:w-[270px] shrink-0 items-center justify-center rounded-xl border border-line-200 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-gold-400 hover:shadow-md"
            >
              <div className="relative h-full w-full">
                <Image
                  src={item.src}
                  alt={idx < partners.length ? item.name : ""}
                  fill
                  className="object-contain p-1 filter transition-all duration-300 hover:brightness-105"
                  sizes="(max-width: 640px) 220px, 270px"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
