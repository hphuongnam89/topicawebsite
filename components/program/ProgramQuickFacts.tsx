import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import type { ProgramDetail } from "@/data/program-details";

export function ProgramQuickFacts({ program }: { program: ProgramDetail }) {
  const publicFacts = program.facts.filter(
    (fact) =>
      !fact.needsVerification &&
      fact.status === "verified" &&
      ["Mã ngành", "Trình độ", "Hình thức", "Văn bằng", "Ngôn ngữ"].includes(fact.label),
  );

  return (
    <section
      aria-labelledby="facts-title"
      className="bg-[var(--color-academic-elevated)] py-10 sm:py-14"
    >
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-[var(--color-academic-accent-strong)] uppercase">
              Thông tin nhanh
            </p>
            <h2
              id="facts-title"
              className="mt-3 text-2xl font-semibold text-[var(--color-academic-ink)]"
            >
              Tổng quan chương trình
            </h2>
          </div>
          <dl className="grid min-w-0 gap-px border border-[var(--color-academic-rule)] bg-[var(--color-academic-rule)] sm:grid-cols-2 xl:grid-cols-4">
            {publicFacts.map((fact) => (
              <div
                key={fact.label}
                className="min-w-0 bg-[var(--color-academic-canvas)] p-5 sm:p-6"
              >
                <dt className="flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-[var(--color-academic-muted)] uppercase">
                  <CheckCircle2
                    className="h-4 w-4 text-[var(--color-academic-accent-strong)]"
                    aria-hidden="true"
                  />
                  {fact.label}
                </dt>
                <dd className="mt-3 text-xl font-semibold text-[var(--color-academic-ink)]">
                  {fact.label === "Hình thức" ? "Đào tạo từ xa · E-learning qua LMS" : fact.value}
                </dd>
                {fact.note && (
                  <p className="mt-2 text-xs leading-5 text-[var(--color-academic-muted)]">
                    {fact.note}
                  </p>
                )}
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
