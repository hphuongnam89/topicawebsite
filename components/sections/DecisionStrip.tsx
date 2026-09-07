import { CheckCircle2, ExternalLink } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import type { HomepageFact } from "@/data/homepage-content";

export function DecisionStrip({ facts }: { facts: readonly HomepageFact[] }) {
  return (
    <section
      className="border-b border-line-200 bg-canvas py-4 sm:py-5"
      aria-label="Thông tin cần biết trước khi đăng ký"
    >
      <Container>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-line-200 bg-line-200 sm:grid-cols-2 lg:grid-cols-5">
          {facts.map((fact, index) => (
            <ScrollReveal key={fact.label} delay={index * 0.04}>
              <article className="flex min-h-[7.5rem] min-w-0 flex-col justify-between bg-paper px-4 py-4 sm:px-5 sm:py-5">
                <span className="text-body-sm font-semibold text-ink-600">{fact.label}</span>
                <span className="mt-3 flex items-start gap-2 text-body-sm leading-snug font-semibold text-ink-950">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-brand-700"
                    aria-hidden="true"
                  />
                  {fact.value}
                </span>
                {fact.sourceUrl && (
                  <a
                    href={fact.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    data-track="official_source_click"
                    data-track-label={fact.label}
                    className="mt-3 inline-flex min-h-11 items-center self-start text-xs font-semibold whitespace-nowrap text-brand-800 underline decoration-brand-300 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info"
                  >
                    Xem nguồn <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
              </article>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
