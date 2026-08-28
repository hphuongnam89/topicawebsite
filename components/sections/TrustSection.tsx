import React from "react";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { GraduationCap, Award, Globe, Users, MapPin, Shield } from "lucide-react";

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
  icon?: any;
  sourceUrl?: string;
}

interface TrustSectionProps {
  data?: TrustItem[];
}

const defaultIcons = [GraduationCap, Award, Globe, Users, MapPin, Shield];

export function TrustSection({ data }: TrustSectionProps) {
  const items = data && data.length > 0 ? data : trustItems;

  return (
    <section className="bg-canvas py-16 lg:py-20">
      <Container>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((item, index) => {
            const Icon = item.icon || defaultIcons[index % defaultIcons.length];
            const delay = index * 0.1;

            return (
              <ScrollReveal
                key={index}
                variant="fadeUp"
                delay={delay}
                className="flex flex-col items-center justify-start text-center"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-500">
                  <Icon className="h-8 w-8" />
                </div>
                <p className="text-body font-medium text-ink-600">{item.label}</p>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
