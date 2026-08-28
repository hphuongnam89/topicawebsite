import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import type { ProgramDetail } from "@/data/program-details";

export function LearningOutcomes({ program }: { program: ProgramDetail }) {
  return (
    <section
      aria-labelledby="outcomes-title"
      className="bg-[var(--color-academic-canvas)] py-[var(--academic-section-space)]"
    >
      <Container>
        <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-[var(--color-academic-accent-strong)] uppercase">
              Chuẩn đầu ra
            </p>
            <h2
              id="outcomes-title"
              className="mt-3 max-w-[13ch] text-4xl font-semibold tracking-[-0.03em] text-[var(--color-academic-ink)] sm:text-5xl"
            >
              {program.outcomes.length} năng lực sau tốt nghiệp
            </h2>
          </div>
          <div className="border-t border-[var(--color-academic-rule-strong)]">
            {program.outcomes.map((outcome) => (
              <details
                key={outcome.code}
                className="group border-b border-[var(--color-academic-rule)]"
              >
                <summary className="grid cursor-pointer list-none grid-cols-[4rem_minmax(0,1fr)_1.25rem] items-center gap-3 py-5 marker:content-none sm:grid-cols-[5rem_minmax(0,1fr)_1.25rem]">
                  <span className="text-xs font-bold text-[var(--color-academic-accent-strong)]">
                    {outcome.code}
                  </span>
                  <span className="min-w-0 font-semibold text-[var(--color-academic-ink)]">
                    {outcome.title}
                  </span>
                  <ChevronDown
                    className="h-5 w-5 text-[var(--color-academic-accent-strong)] transition-transform duration-[var(--academic-duration)] group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="pr-8 pb-6 pl-[5rem] leading-7 text-[var(--color-academic-muted)] sm:pl-[6rem]">
                  {outcome.description}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
