import { ArrowRight, BriefcaseBusiness, GraduationCap, RefreshCw } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { homepageContent } from "@/data/homepage-content";

const icons = [BriefcaseBusiness, GraduationCap, RefreshCw];

export function FitCheckSection() {
  return (
    <section className="bg-paper py-12 sm:py-14 lg:py-16" aria-labelledby="fit-check-title">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <ScrollReveal variant="slideInLeft">
            <div>
              <p className="text-body-sm font-semibold tracking-[0.14em] text-brand-700 uppercase">
                Bắt đầu từ hoàn cảnh của bạn
              </p>
              <h2
                id="fit-check-title"
                className="mt-3 max-w-[14ch] font-display text-[clamp(2rem,3.5vw,3rem)] leading-[1.08] font-semibold text-ink-950"
              >
                Bạn có phù hợp không?
              </h2>
              <p className="mt-5 max-w-[42ch] text-body-lg text-ink-600">
                Bạn chưa cần quyết định ngay. Hãy kiểm tra điều kiện và nhận lộ trình trước khi để
                lại hồ sơ.
              </p>
              <ButtonLink
                href="#consultation-form"
                data-track="eligibility_check_click"
                aria-label={homepageContent.hero.primaryCta}
                className="mt-7"
                rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              >
                <span className="sm:hidden">Kiểm tra hồ sơ</span>
                <span className="hidden sm:inline">{homepageContent.hero.primaryCta}</span>
              </ButtonLink>
            </div>
          </ScrollReveal>
          <div className="grid gap-3 sm:grid-cols-3">
            {homepageContent.fitProfiles.map((profile, index) => {
              const Icon = icons[index];
              return (
                <ScrollReveal key={profile.title} delay={index * 0.06}>
                  <article className="min-w-0 border-t-2 border-brand-500 bg-canvas p-5 sm:p-6">
                    <Icon className="h-6 w-6 text-brand-700" aria-hidden="true" />
                    <h3 className="mt-10 font-display text-h3 font-semibold text-ink-950">
                      {profile.title}
                    </h3>
                    <p className="mt-3 text-body-sm leading-relaxed text-ink-600">
                      {profile.description}
                    </p>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
