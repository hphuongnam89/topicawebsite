import React from "react";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { GraduationCap, Award, Globe, Users, MapPin, Shield, type LucideIcon } from "lucide-react";

/**
 * Trust items verified from https://topicauni.edu.vn/ on 2026-08-28.
 * Each item has a sourceUrl for provenance tracking.
 */
const trustItems = [
  {
    icon: GraduationCap,
    label: "Trực thuộc ĐH Phú Xuân",
    sourceUrl: "https://topicauni.edu.vn/gioi-thieu/",
  },
  {
    icon: Award,
    label: "Bằng cấp được Bộ GD&ĐT công nhận",
    sourceUrl: "https://topicauni.edu.vn/",
  },
  {
    icon: Globe,
    label: "Đào tạo từ xa",
    sourceUrl: "https://topicauni.edu.vn/",
  },
  {
    icon: Users,
    label: "Đại học 3 năm",
    sourceUrl: "https://topicauni.edu.vn/",
  },
  {
    icon: MapPin,
    label: "6 trung tâm toàn quốc",
    sourceUrl: "https://topicauni.edu.vn/",
  },
  {
    icon: Shield,
    label: "Thành viên EQuest",
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

const defaultIcons = [GraduationCap, Award, Globe, Users, MapPin, Shield];

export function TrustSection({ data }: TrustSectionProps) {
  const items = data && data.length > 0 ? data : trustItems;

  return (
    <section
      className="border-y border-navy-800 bg-navy-950 py-4 sm:py-6"
      aria-label="Dấu ấn Topica"
    >
      <Container>
        <div className="grid grid-cols-2 gap-x-5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-0">
          {items.map((item, index) => {
            const Icon = item.icon || defaultIcons[index % defaultIcons.length];
            const delay = index * 0.1;

            return (
              <ScrollReveal
                key={index}
                variant="fadeUp"
                delay={delay}
                className="group flex min-w-0 items-start gap-3 border-b border-white/15 py-4 text-left last:border-b-0 sm:gap-3 sm:py-5 lg:border-b-0 lg:border-l lg:border-white/15 lg:px-4 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
              >
                <Icon
                  className="mt-0.5 h-5 w-5 shrink-0 text-gold-300 transition-transform duration-200 group-hover:-translate-y-0.5"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
                <p className="text-body-sm leading-snug font-semibold text-white/90">{item.label}</p>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
