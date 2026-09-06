import { Check, Laptop, MessageCircle, PlayCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { homepageContent } from "@/data/homepage-content";

const icons = [Laptop, PlayCircle, Check, MessageCircle];

export function LearningExperienceSection() {
  return (
    <section
      className="bg-ink-950 py-16 text-white sm:py-20 lg:py-24"
      aria-labelledby="learning-experience-title"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-body-sm font-semibold tracking-[0.14em] text-brand-300 uppercase">
              Hành trình học tập
            </p>
            <h2
              id="learning-experience-title"
              className="mt-4 max-w-[11ch] font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.08] font-semibold text-white"
            >
              Học chủ động, nhưng không học một mình.
            </h2>
            <p className="mt-6 max-w-[48ch] text-body-lg text-white/70">
              Bạn học theo lộ trình rõ ràng với học liệu số, lớp trực tuyến, bài tập, đánh giá và sự
              hỗ trợ theo chính sách chương trình.
            </p>
          </div>
          <ol className="grid gap-0 border-t border-white/20 sm:grid-cols-2">
            {homepageContent.learning.map((item, index) => {
              const Icon = icons[index];
              return (
                <li key={item} className="border-b border-white/20 py-6 sm:px-6 sm:first:pl-0">
                  <div className="flex items-center gap-3">
                    <span className="text-body-sm font-semibold text-brand-300">0{index + 1}</span>
                    <Icon className="h-5 w-5 text-brand-300" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-display text-h3 font-semibold text-white">{item}</h3>
                  <p className="mt-2 text-body-sm text-white/60">
                    Chi tiết trải nghiệm và chính sách hỗ trợ cần được xác minh theo chương trình.
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}
