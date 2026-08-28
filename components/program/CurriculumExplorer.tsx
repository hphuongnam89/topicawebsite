import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import type { ProgramDetail } from "@/data/program-details";

export function CurriculumExplorer({ program }: { program: ProgramDetail }) {
  const creditFact = program.facts.find((fact) => fact.label === "Khối lượng");

  return (
    <section
      id="chuong-trinh"
      aria-labelledby="curriculum-title"
      className="scroll-mt-24 bg-[var(--color-academic-canvas)] py-[var(--academic-section-space)]"
    >
      <Container>
        <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-bold tracking-[0.16em] text-[var(--color-academic-accent-strong)] uppercase">
              Khung chương trình
            </p>
            <h2
              id="curriculum-title"
              className="mt-3 max-w-[14ch] text-4xl font-semibold tracking-[-0.03em] text-[var(--color-academic-ink)] sm:text-5xl"
            >
              {creditFact
                ? `${creditFact.value}, đọc theo từng học kỳ`
                : "Khung học phần đã xác minh"}
            </h2>
            <p className="mt-5 max-w-md leading-7 text-[var(--color-academic-muted)]">
              Danh sách dưới đây giữ nguyên mã, tên, số tín chỉ và điều kiện lựa chọn trong bảng
              chương trình nguồn.
            </p>
          </div>

          <div className="min-w-0 border-t border-[var(--color-academic-rule-strong)]">
            {program.curriculum.map((group, index) => (
              <details
                key={group.id}
                className="group border-b border-[var(--color-academic-rule)]"
                open={index === 0}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 marker:content-none">
                  <span className="min-w-0">
                    <span className="block text-lg font-semibold text-[var(--color-academic-ink)]">
                      {group.name}
                    </span>
                    <span className="mt-1 block text-sm text-[var(--color-academic-muted)]">
                      {group.credits === null
                        ? "Không tính vào khối lượng tích lũy"
                        : `${group.credits} tín chỉ`}
                      {group.selection ? ` · ${group.selection}` : ""}
                    </span>
                  </span>
                  <ChevronDown
                    className="h-5 w-5 shrink-0 text-[var(--color-academic-accent-strong)] transition-transform duration-[var(--academic-duration)] group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>

                <div className="pb-7">
                  <div className="hidden grid-cols-[7.5rem_minmax(0,1fr)_5rem] gap-4 border-b border-[var(--color-academic-rule)] pb-2 text-xs font-bold tracking-[0.1em] text-[var(--color-academic-muted)] uppercase sm:grid">
                    <span>Mã học phần</span>
                    <span>Tên học phần</span>
                    <span className="text-right">Tín chỉ</span>
                  </div>
                  <ul
                    className="divide-y divide-[var(--color-academic-rule)]"
                    aria-label={`Học phần ${group.name}`}
                  >
                    {group.courses.map((item) => (
                      <li
                        key={item.id}
                        className="grid min-w-0 gap-2 py-4 sm:grid-cols-[7.5rem_minmax(0,1fr)_5rem] sm:gap-4"
                      >
                        <code className="text-xs font-semibold text-[var(--color-academic-accent-strong)]">
                          {item.code}
                        </code>
                        <div className="min-w-0">
                          <p className="leading-6 font-medium text-[var(--color-academic-ink)]">
                            {item.name}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[var(--color-academic-muted)]">
                            {item.requirement}
                            {item.prerequisite ? ` · Học trước: ${item.prerequisite}` : ""}
                          </p>
                          {item.detail && (
                            <p className="mt-1 text-xs leading-5 text-[var(--color-academic-muted)]">
                              {item.detail}
                            </p>
                          )}
                          {item.note && (
                            <p className="mt-2 text-xs leading-5 text-[var(--color-academic-warning)]">
                              Cần xác nhận: {item.note}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-[var(--color-academic-ink)] sm:text-right">
                          <span className="sm:hidden">Tín chỉ: </span>
                          {item.credits ?? "—"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
