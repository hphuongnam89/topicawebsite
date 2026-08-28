import { Container } from "@/components/ui/Container";
import type { ProgramDetail } from "@/data/program-details";

export function StudyRoadmap({ program }: { program: ProgramDetail }) {
  const duration = program.facts.find((fact) => fact.label === "Thời gian")?.value;
  const title = duration?.includes("3 năm")
    ? `${program.semesters.length} học kỳ trong 3 năm`
    : `${program.semesters.length} học kỳ`;

  return (
    <section
      aria-labelledby="roadmap-title"
      className="bg-[var(--color-academic-paper)] py-[var(--academic-section-space)]"
    >
      <Container>
        <div className="grid gap-5 border-b border-[var(--color-academic-rule-strong)] pb-8 md:grid-cols-2 md:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-[var(--color-academic-accent-strong)] uppercase">
              Lộ trình học tập
            </p>
            <h2
              id="roadmap-title"
              className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[var(--color-academic-ink)] sm:text-5xl"
            >
              {title}
            </h2>
          </div>
          <p className="max-w-xl leading-7 text-[var(--color-academic-muted)] md:justify-self-end">
            Tổng tín chỉ và nội dung tiêu biểu của từng học kỳ được đối chiếu từ{" "}
            {program.source.label}.
          </p>
        </div>

        <ol className="mt-10 grid min-w-0 gap-px border border-[var(--color-academic-rule)] bg-[var(--color-academic-rule)] md:grid-cols-2 xl:grid-cols-3">
          {program.semesters.map((semester) => (
            <li
              key={semester.term}
              className="min-w-0 bg-[var(--color-academic-elevated)] p-6 sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.12em] text-[var(--color-academic-muted)] uppercase">
                    Học kỳ {semester.term}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-[var(--color-academic-ink)]">
                    {semester.phase}
                  </h3>
                </div>
                <div className="shrink-0 text-right">
                  <span className="block text-3xl font-semibold tracking-[-0.04em] text-[var(--color-academic-accent-strong)]">
                    {semester.credits}
                  </span>
                  <span className="text-xs text-[var(--color-academic-muted)]">tín chỉ</span>
                </div>
              </div>
              <ul className="mt-6 space-y-3 text-sm leading-6 text-[var(--color-academic-muted)]">
                {semester.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="border-l-2 border-[var(--color-academic-accent)] pl-3"
                  >
                    {highlight}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
