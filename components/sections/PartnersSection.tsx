"use client";

import { LocalizedText } from "@/components/i18n/LocalizedText";
import { LocalizedElement } from "@/components/i18n/LocalizedElement";
import Image from "@/components/i18n/LocalizedImage";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

// Chỉ render các đối tác đã xác thực danh tính và quan hệ hợp tác chính thức.
// Logo 6–9 đang chờ xác minh từ bộ phận đối ngoại/Topica theo R03/R06/HUI-07.
export const partners = [
  { name: "Deakin University", src: "https://topicauni.edu.vn/wp-content/uploads/2026/01/1.png" },
  { name: "OBC", src: "https://topicauni.edu.vn/wp-content/uploads/2026/01/2.png" },
  { name: "Thaco Agri", src: "https://topicauni.edu.vn/wp-content/uploads/2026/01/3.png" },
  {
    name: "Deha Digital Solutions",
    src: "https://topicauni.edu.vn/wp-content/uploads/2026/01/4.png",
  },
  { name: "Deha Software", src: "https://topicauni.edu.vn/wp-content/uploads/2026/01/5.png" },
];

// Duplicate the array for seamless infinite marquee scrolling
const duplicatedPartners = [...partners, ...partners];

export function PartnersSection() {
  return (
    <section className="overflow-hidden bg-canvas py-16 sm:py-24" aria-labelledby="partners-title">
      <Container>
        {/* Header Area */}
        <ScrollReveal>
          <div className="mb-14 text-center">
            <h2
              id="partners-title"
              className="font-display text-h2 font-bold text-navy-900 uppercase"
            >
              <LocalizedText>NHÀ TUYỂN DỤNG & ĐỐI TÁC
            </LocalizedText></h2>
            <div className="mx-auto mt-4 mb-6 h-[3px] w-12 bg-gold-500" />
            <p className="mx-auto max-w-[47.5rem] text-body-lg text-ink-600">
              <LocalizedText>Viện đào tạo Quốc tế Topica tự hào là đối tác của các đại học, viện nghiên cứu, doanh
              nghiệp và tập đoàn hàng đầu trong nước và quốc tế.
            </LocalizedText></p>
          </div>
        </ScrollReveal>
      </Container>

      {/* Marquee Area - Full width with gradient fading edges */}
      <ScrollReveal variant="slideInRight">
        <LocalizedElement as="div"
          className="partners-marquee group relative mx-auto flex w-full max-w-[1400px] [scrollbar-width:none] overflow-hidden [&::-webkit-scrollbar]:hidden"
          role="region"
          aria-label="Danh sách đối tác của Topica"
        >
          {/* Fading Edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-canvas via-canvas/80 to-transparent sm:w-40" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-canvas via-canvas/80 to-transparent sm:w-40" />

          {/* Continuous Auto-sliding Track */}
          <div className="partners-marquee-track flex w-max gap-6 py-4 sm:gap-8">
            {duplicatedPartners.map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                aria-hidden={idx >= partners.length}
                className="flex h-[124px] w-[220px] shrink-0 items-center justify-center rounded-xl border border-line-200 bg-white p-4 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-gold-400 hover:shadow-md sm:h-[150px] sm:w-[280px] sm:p-5"
              >
                <div className="relative h-full w-full">
                  <Image
                    src={item.src}
                    alt={idx < partners.length ? item.name : ""}
                    fill
                    className="scale-[1.8] object-contain p-1 filter transition-transform duration-300 hover:scale-[1.95]"
                    sizes="(max-width: 640px) 220px, 280px"
                  />
                </div>
              </div>
            ))}
          </div>
        </LocalizedElement>
      </ScrollReveal>
    </section>
  );
}
