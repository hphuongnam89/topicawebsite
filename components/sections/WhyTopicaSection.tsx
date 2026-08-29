/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V5
 * genre: editorial · macrostructure: Bento Grid · theme: custom Topica academic
 * section: S2 Hanging · features: F1 Bento · proof: T4 Stat strip · cta: C1 + C3
 */

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Globe2,
  GraduationCap,
  MonitorSmartphone,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { TrustMetrics, type TrustMetric } from "@/components/sections/why-topica/TrustMetrics";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

type BenefitVisual = "learning-flow" | "transparent-value" | "learning-progress";

type BenefitItem = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  visual: BenefitVisual;
  className: string;
};

export type WhyTopicaMetrics = {
  /** CMS/API placeholder: {{years_experience}} */
  yearsExperience?: number;
  /** CMS/API placeholder: {{student_count}} */
  studentCount?: number;
  /** CMS/API placeholder: {{partner_count}} */
  partnerCount?: number;
  /** CMS/API placeholder: {{support_hours}} */
  supportHours?: number | string;
};

export type WhyTopicaSectionProps = {
  metrics?: WhyTopicaMetrics;
};

const benefitItems: BenefitItem[] = [
  {
    eyebrow: "Linh hoạt theo nhịp sống",
    title: "Học online 100%",
    description:
      "Học mọi lúc, mọi nơi trên nền tảng E-Learning hiện đại. Chủ động thời gian nhưng vẫn theo sát lộ trình học tập.",
    icon: Globe2,
    visual: "learning-flow",
    className: "order-1 lg:col-span-8 lg:row-start-1",
  },
  {
    eyebrow: "Giá trị dài hạn",
    title: "Bằng cấp có giá trị",
    description:
      "Chương trình đào tạo bài bản, hỗ trợ người học xây dựng nền tảng để phát triển học vấn và sự nghiệp.",
    icon: GraduationCap,
    visual: "transparent-value",
    className: "order-3 lg:col-span-4 lg:row-start-2",
  },
  {
    eyebrow: "Trải nghiệm học tập",
    title: "Công nghệ hỗ trợ bạn tiến bộ",
    description:
      "Học liệu số, lớp học trực tuyến, theo dõi tiến độ và hỗ trợ kỹ thuật giúp việc học rõ ràng, liền mạch hơn.",
    icon: MonitorSmartphone,
    visual: "learning-progress",
    className: "order-4 lg:col-span-4 lg:row-start-2",
  },
];

const learningSteps = ["Học liệu", "Lớp trực tuyến", "Bài tập", "Hỗ trợ"];

const trustStatements = [
  "Lộ trình rõ ràng cho người đi làm",
  "Học tập linh hoạt, có định hướng",
  "Đội ngũ đồng hành xuyên suốt",
  "Nền tảng học tập tập trung, dễ sử dụng",
];

function SectionHeader() {
  return (
    <header className="max-w-4xl pb-12 lg:pb-16">
      <ScrollReveal>
        <p className="text-body-sm font-semibold tracking-[0.12em] text-brand-700 uppercase">
          Lý do để bạn tự tin bắt đầu
        </p>
      </ScrollReveal>
      <ScrollReveal delay={0.06}>
        <h2
          id="why-topica-title"
          className="mt-5 font-display text-[clamp(2.125rem,5vw,4rem)] leading-[1.12] font-semibold tracking-[-0.025em] text-ink-950"
        >
          <span className="block">Học linh hoạt hôm nay.</span>
          <span className="block text-brand-800">Vững vàng sự nghiệp ngày mai.</span>
        </h2>
      </ScrollReveal>
      <ScrollReveal delay={0.18}>
        <p className="mt-6 max-w-[65ch] text-body-lg text-ink-600">
          Topica mang đến lộ trình đại học từ xa được thiết kế cho người bận rộn, với trải nghiệm
          học tập hiện đại và sự đồng hành xuyên suốt.
        </p>
      </ScrollReveal>
    </header>
  );
}

function CardVisual({ visual }: { visual: BenefitVisual }) {
  if (visual === "learning-flow") {
    return (
      <ol
        aria-label="Lộ trình học tập trực tuyến"
        className="mt-8 grid grid-cols-1 gap-4 border-t border-line-200 pt-6 sm:grid-cols-4 sm:gap-x-5 sm:gap-y-6"
      >
        {learningSteps.map((step, index) => (
          <li key={step} className="relative min-w-0">
            <span className="block text-body-sm font-semibold text-brand-700">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="mt-1 block text-body-sm font-medium text-ink-800">{step}</span>
            {index < learningSteps.length - 1 && (
              <ArrowRight
                aria-hidden="true"
                className="absolute top-1 right-0 hidden h-4 w-4 text-line-200 sm:block"
              />
            )}
          </li>
        ))}
      </ol>
    );
  }

  if (visual === "transparent-value") {
    return (
      <div className="mt-8 flex items-start gap-3 border-t border-line-200 pt-5">
        <BadgeCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
        <p className="text-body-sm text-ink-600">
          Thông tin công nhận và điều kiện chương trình được công khai minh bạch.
        </p>
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="mt-8 space-y-4 border-t border-line-200 pt-5">
      {["Học liệu số", "Theo dõi tiến độ", "Hỗ trợ kỹ thuật"].map((label, index) => (
        <div key={label} className="flex items-center gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-800">
            <Check className="h-3.5 w-3.5" />
          </span>
          <span className="text-body-sm font-medium text-ink-800">{label}</span>
          <span className="h-px flex-1 bg-line-200" />
          <span className="text-body-sm font-semibold text-brand-700">0{index + 1}</span>
        </div>
      ))}
    </div>
  );
}

export function BenefitCard({ item, index }: { item: BenefitItem; index: number }) {
  const Icon = item.icon;

  return (
    <ScrollReveal
      delay={0.08 + index * 0.1}
      className={`${item.className} group min-w-0 rounded-[1.5rem] border border-line-200 bg-elevated p-6 shadow-xs transition-[transform,box-shadow,border-color] duration-[var(--duration-base)] motion-reduce:transform-none motion-reduce:transition-none sm:p-8 lg:p-10 [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:border-brand-300 [@media(hover:hover)]:hover:shadow-sm`}
    >
      <article className="flex h-full min-w-0 flex-col" aria-labelledby={`benefit-${index}`}>
        <div className="flex items-center gap-3">
          <Icon aria-hidden="true" className="h-6 w-6 text-brand-700" strokeWidth={1.7} />
          <p className="text-body-sm font-semibold tracking-[0.1em] text-ink-600 uppercase">
            {item.eyebrow}
          </p>
        </div>
        <h3
          id={`benefit-${index}`}
          className="mt-6 font-display text-[clamp(1.625rem,2.5vw,2.25rem)] leading-tight font-semibold text-ink-950"
        >
          {item.title}
        </h3>
        <p className="mt-3 max-w-[58ch] text-body text-ink-600">{item.description}</p>
        <div className="mt-auto">
          <CardVisual visual={item.visual} />
        </div>
      </article>
    </ScrollReveal>
  );
}

export function FeaturedSupportCard() {
  const proofPoints = [
    "Giảng viên giàu kinh nghiệm thực tiễn",
    "Cố vấn học tập xuyên suốt",
    "Hỗ trợ kỹ thuật khi cần",
  ];

  return (
    <ScrollReveal
      delay={0.2}
      className="order-2 min-w-0 rounded-[1.5rem] border border-white/10 bg-ink-950 p-6 text-white shadow-xs [background-image:radial-gradient(circle_at_85%_15%,rgba(196,145,61,0.16),transparent_34%)] sm:p-8 lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1 lg:p-10"
    >
      <article
        className="flex h-full min-h-[30rem] min-w-0 flex-col"
        aria-labelledby="support-title"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-brand-300">
          <UsersRound aria-hidden="true" className="h-6 w-6" strokeWidth={1.7} />
        </div>
        <p className="mt-10 text-body-sm font-semibold tracking-[0.1em] text-brand-300 uppercase">
          Không học một mình
        </p>
        <h3
          id="support-title"
          className="mt-4 font-display text-[clamp(1.875rem,3vw,2.75rem)] leading-[1.15] font-semibold text-white"
        >
          Đồng hành cùng bạn đến đích
        </h3>
        <p className="mt-5 text-body text-white/75">
          Giảng viên, cố vấn học tập và đội ngũ hỗ trợ luôn sẵn sàng giúp bạn duy trì tiến độ trong
          suốt hành trình học.
        </p>
        <ul className="mt-8 flex flex-wrap gap-2.5" aria-label="Các hình thức hỗ trợ">
          {proofPoints.map((proof) => (
            <li
              key={proof}
              className="rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-body-sm text-white/85"
            >
              {proof}
            </li>
          ))}
        </ul>
        <Link
          href="/gioi-thieu/"
          className="group/link mt-auto inline-flex min-h-11 items-center self-start rounded-sm border-b border-brand-300/70 pt-10 pb-1 text-body-sm font-semibold whitespace-nowrap text-white transition-colors duration-[var(--duration-base)] hover:border-white focus-visible:border-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-300"
        >
          Gặp đội ngũ giảng viên và cố vấn
          <ArrowRight
            aria-hidden="true"
            className="ml-2 h-4 w-4 transition-transform duration-[var(--duration-base)] group-hover/link:translate-x-1 group-focus-visible/link:translate-x-1 motion-reduce:transition-none"
          />
        </Link>
      </article>
    </ScrollReveal>
  );
}

function buildMetrics(metrics?: WhyTopicaMetrics): TrustMetric[] {
  if (!metrics) return [];

  const verifiedMetrics: TrustMetric[] = [];

  if (metrics.yearsExperience !== undefined) {
    verifiedMetrics.push({
      value: metrics.yearsExperience,
      suffix: "+",
      label: "Năm đồng hành cùng người học",
    });
  }
  if (metrics.studentCount !== undefined) {
    verifiedMetrics.push({
      value: metrics.studentCount,
      suffix: "+",
      label: "Học viên trên toàn quốc",
    });
  }
  if (metrics.partnerCount !== undefined) {
    verifiedMetrics.push({
      value: metrics.partnerCount,
      suffix: "+",
      label: "Đối tác giáo dục",
    });
  }
  if (metrics.supportHours !== undefined) {
    verifiedMetrics.push({
      value: metrics.supportHours,
      label: "Hỗ trợ học tập và kỹ thuật",
    });
  }

  return verifiedMetrics;
}

export function ConsultationCTA() {
  return (
    <ScrollReveal delay={0.1}>
      <div
        className="mt-6 grid min-w-0 gap-8 rounded-[1.5rem] bg-brand-100 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:items-end lg:p-10"
        aria-labelledby="consultation-cta-title"
      >
        <div className="min-w-0">
          <h3
            id="consultation-cta-title"
            className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.15] font-semibold text-ink-950"
          >
            Lộ trình phù hợp với bạn bắt đầu từ một cuộc tư vấn.
          </h3>
          <p className="mt-4 max-w-[62ch] text-body text-ink-600">
            Để lại thông tin, đội ngũ tư vấn sẽ hỗ trợ bạn chọn ngành, hiểu điều kiện xét tuyển và
            xây dựng kế hoạch học phù hợp.
          </p>
          <p className="mt-5 text-body-sm text-ink-600">
            Thông tin của bạn được bảo mật và chỉ dùng để hỗ trợ tư vấn tuyển sinh.
          </p>
        </div>
        <div className="flex min-w-0 flex-col items-start gap-4 lg:items-end">
          <ButtonLink
            href="/lien-he/"
            size="lg"
            rightIcon={<ArrowRight aria-hidden="true" className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            Nhận tư vấn miễn phí
          </ButtonLink>
          <ButtonLink
            href="/tuyen-sinh/"
            variant="tertiary"
            className="h-auto min-h-11 px-0 underline decoration-line-200 underline-offset-8 hover:decoration-brand-700"
          >
            Xem các chương trình đào tạo
          </ButtonLink>
        </div>
      </div>
    </ScrollReveal>
  );
}

export function WhyTopicaSection({ metrics }: WhyTopicaSectionProps) {
  return (
    <section aria-labelledby="why-topica-title" className="bg-brand-50 py-20 lg:py-28">
      <Container>
        <SectionHeader />
        <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-12 lg:grid-rows-[minmax(18rem,auto)_minmax(18rem,auto)] lg:gap-6">
          {benefitItems.map((item, index) => (
            <BenefitCard key={item.title} item={item} index={index} />
          ))}
          <FeaturedSupportCard />
        </div>
        <TrustMetrics metrics={buildMetrics(metrics)} fallbackStatements={trustStatements} />
        <ConsultationCTA />
      </Container>
    </section>
  );
}
