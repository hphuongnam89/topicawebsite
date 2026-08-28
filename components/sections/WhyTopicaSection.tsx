import { Globe, Users, Award, Monitor } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const features = [
  {
    title: "Online 100%",
    description:
      "Học mọi lúc, mọi nơi trên nền tảng E-Learning hiện đại. Linh hoạt thời gian, không cần đến trường.",
    icon: Globe,
    className: "col-span-1 lg:col-span-2 row-span-1 bg-brand-50",
    iconClass: "text-brand-500",
    titleClass: "text-ink-950",
    descClass: "text-ink-600",
  },
  {
    title: "Giảng viên chất lượng",
    description: "Đội ngũ giảng viên từ các trường đại học uy tín, giàu kinh nghiệm thực tiễn.",
    icon: Users,
    className: "col-span-1 lg:col-span-1 lg:row-span-2 bg-ink-950 text-white",
    iconClass: "text-brand-300",
    titleClass: "text-white",
    descClass: "text-white/70",
  },
  {
    title: "Bằng cấp giá trị",
    description: "Bằng Cử nhân/Kỹ sư được Bộ GD&ĐT công nhận, có giá trị học lên bậc cao hơn.",
    icon: Award,
    className: "col-span-1 row-span-1 bg-paper",
    iconClass: "text-brand-500",
    titleClass: "text-ink-950",
    descClass: "text-ink-600",
  },
  {
    title: "Công nghệ hiện đại",
    description: "Hệ thống học tập trực tuyến LMS tiên tiến, hỗ trợ 24/7.",
    icon: Monitor,
    className: "col-span-1 row-span-1 bg-paper",
    iconClass: "text-brand-500",
    titleClass: "text-ink-950",
    descClass: "text-ink-600",
  },
];

export function WhyTopicaSection() {
  return (
    <section className="bg-canvas py-16 lg:py-24">
      <Container>
        <SectionHeading
          title="Vì sao chọn Topica?"
          subtitle="Giải pháp đào tạo từ xa toàn diện cho người đi làm và thí sinh trên toàn quốc"
          align="center"
        />
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal
                key={feature.title}
                delay={index * 0.1}
                className={`flex flex-col rounded-lg border border-line-200 p-6 lg:p-8 ${feature.className}`}
              >
                <Icon className={`h-8 w-8 ${feature.iconClass}`} />
                <h3 className={`mt-4 font-sans text-h3 font-bold ${feature.titleClass}`}>
                  {feature.title}
                </h3>
                <p className={`mt-2 text-body ${feature.descClass}`}>{feature.description}</p>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
