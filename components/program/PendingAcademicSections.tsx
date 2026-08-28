import { BookOpenCheck, FileWarning, ListChecks } from "lucide-react";
import { Container } from "@/components/ui/Container";
import type { ProgramDetail } from "@/data/program-details";

const pendingSections = [
  {
    title: "Khung chương trình",
    description: "Chưa có danh mục học phần, số tín chỉ và điều kiện tiên quyết.",
    icon: BookOpenCheck,
  },
  {
    title: "Lộ trình học tập",
    description: "Chưa có phân bổ học phần và tổng tín chỉ theo từng học kỳ.",
    icon: ListChecks,
  },
  {
    title: "Chuẩn đầu ra",
    description: "Chưa có bảng chuẩn đầu ra của chương trình để đối chiếu và công bố.",
    icon: FileWarning,
  },
];

export function PendingAcademicSections({ program }: { program: ProgramDetail }) {
  return (
    <section
      id="chuong-trinh"
      aria-labelledby="pending-academic-title"
      className="scroll-mt-24 bg-[var(--color-academic-canvas)] py-[var(--academic-section-space)]"
    >
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-[var(--color-academic-accent-strong)] uppercase">
              Chương trình đào tạo
            </p>
            <h2
              id="pending-academic-title"
              className="mt-3 max-w-[14ch] text-4xl font-semibold tracking-[-0.03em] text-[var(--color-academic-ink)] sm:text-5xl"
            >
              Hồ sơ học thuật đang chờ bổ sung
            </h2>
            <p className="mt-5 max-w-lg leading-7 text-[var(--color-academic-muted)]">
              Trang hiện có mới xác minh phần giới thiệu ngành và cơ hội nghề nghiệp. Các dữ liệu
              học thuật chỉ được công bố sau khi có hồ sơ chương trình chính thức.
            </p>
          </div>

          <div className="border-t border-[var(--color-academic-rule-strong)]">
            {pendingSections.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-b border-[var(--color-academic-rule)] py-6 sm:grid-cols-[4rem_minmax(0,1fr)]"
              >
                <Icon className="h-6 w-6 text-[var(--color-academic-warning)]" aria-hidden="true" />
                <div>
                  <h3 className="text-xl font-semibold text-[var(--color-academic-ink)]">
                    {title}
                  </h3>
                  <p className="mt-2 leading-7 text-[var(--color-academic-muted)]">{description}</p>
                </div>
              </div>
            ))}
            {program.source.url && (
              <p className="mt-6 text-sm leading-6 text-[var(--color-academic-muted)]">
                Nội dung đang hiển thị được đối chiếu từ{" "}
                <a
                  href={program.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold whitespace-nowrap underline underline-offset-4"
                >
                  trang ngành Topica
                </a>
                , ngày {program.source.reviewedAt}.
              </p>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
