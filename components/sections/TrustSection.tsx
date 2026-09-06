import React from "react";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import {
  GraduationCap,
  Globe,
  Laptop,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";

/** Claims mapped to the official source audit on 2026-09-03. */
const trustItems = [
  {
    icon: GraduationCap,
    label: "Đào tạo từ xa",
    sourceUrl: "https://topicauni.edu.vn/",
  },
  {
    icon: Laptop,
    label: "E-learning qua LMS",
    sourceUrl:
      "https://topicauni.edu.vn/thong-bao-tuyen-sinh-dai-hoc-chinh-quy-hinh-thuc-tu-xa-pxuni-elearning-nam-2026-dot-2/",
  },
  {
    icon: Globe,
    label: "5 ngành đào tạo",
    sourceUrl: "https://topicauni.edu.vn/",
  },
  {
    icon: Users,
    label: "Tư vấn theo hồ sơ",
    sourceUrl: "https://topicauni.edu.vn/thong-tin-tuyen-sinh-nam-2026/",
  },
  {
    icon: Shield,
    label: "Bằng do ĐH Phú Xuân cấp",
    sourceUrl: "https://topicauni.edu.vn/",
  },
];

interface TrustItem {
  label: string;
  icon?: LucideIcon;
  sourceUrl?: string;
}

interface TrustSectionProps {
  data?: TrustItem[];
}

const defaultIcons = [GraduationCap, Laptop, Globe, Users, Shield];

export function TrustSection({ data }: TrustSectionProps) {
  const items = data && data.length > 0 ? data : trustItems;

  return (
    <section
      className="border-y border-line-200 bg-canvas py-6 sm:py-8"
      aria-label="Dấu ấn Topica"
    >
      <Container>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line-200 bg-line-200 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item, index) => {
            const Icon = item.icon || defaultIcons[index % defaultIcons.length];
            const delay = index * 0.1;
            const itemBody = (
              <>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-100">
                  <Icon
                    className="h-[1.125rem] w-[1.125rem]"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </div>
                <p className="min-w-0 text-body-sm leading-snug font-semibold text-ink-800">
                  {item.label}
                </p>
              </>
            );

            return (
              <ScrollReveal
                key={index}
                variant="fadeUp"
                delay={delay}
                className="min-w-0 bg-paper"
              >
                {item.sourceUrl ? (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${item.label} — xem nguồn chính thức`}
                    className="group flex min-h-[5.75rem] min-w-0 items-center gap-3 bg-paper px-3 py-3 text-left transition-colors hover:bg-brand-50 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-700 sm:px-4"
                  >
                    {itemBody}
                  </a>
                ) : (
                  <div className="group flex min-h-[5.75rem] min-w-0 items-center gap-3 bg-paper px-3 py-3 text-left sm:px-4">
                    {itemBody}
                  </div>
                )}
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
