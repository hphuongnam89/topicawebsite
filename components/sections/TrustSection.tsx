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
      className="border-y border-line-100 bg-paper py-6 sm:py-8"
      aria-label="Dấu ấn Topica"
    >
      <Container>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((item, index) => {
            const Icon = item.icon || defaultIcons[index % defaultIcons.length];
            const delay = index * 0.1;

            return (
              <ScrollReveal
                key={index}
                variant="fadeUp"
                delay={delay}
                className="flex min-w-0 items-center gap-3 rounded-lg border border-line-100 bg-canvas px-3 py-3 text-left transition-colors hover:border-brand-200 sm:px-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                </div>
                <p className="text-body-sm leading-snug font-semibold text-ink-800">{item.label}</p>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
