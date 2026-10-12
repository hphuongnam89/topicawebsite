import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { ProgramDetail } from "@/data/program-details";

export function ProgramInPageNav({ program }: { program: ProgramDetail }) {
  const hasOutcomes = program.outcomes.length > 0;
  const hasCurriculum = program.curriculum.length > 0;
  const hasAdmissions = Boolean(
    program.admissions || program.graduation || program.confirmations.length,
  );

  const navItems = [
    { label: "Thông tin nhanh", href: "#thong-tin-nhanh" },
    { label: hasCurriculum ? "Khung chương trình" : "Chương trình đào tạo", href: "#chuong-trinh" },
    { label: "Lộ trình học tập", href: "#lo-trinh-hoc-tap" },
    ...(hasOutcomes ? [{ label: "Chuẩn đầu ra", href: "#chuan-dau-ra" }] : []),
    { label: "Cơ hội nghề nghiệp", href: "#co-hoi-nghe-nghiep" },
    ...(hasAdmissions ? [{ label: "Điều kiện tuyển sinh", href: "#dieu-kien-tuyen-sinh" }] : []),
    { label: "Hỏi & đáp", href: "#cau-hoi-thuong-gap" },
  ];

  return (
    <nav
      aria-label="Mục lục trang ngành"
      className="sticky top-16 z-20 border-b border-[var(--color-academic-rule)] bg-[var(--color-academic-elevated)]/95 backdrop-blur-md transition-shadow"
    >
      <Container className="px-0 sm:px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2.5 px-4 sm:px-0 text-xs font-semibold sm:text-sm no-scrollbar">
          <span className="hidden items-center gap-2 pr-3 text-[var(--color-academic-muted)] lg:flex shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-academic-accent)]" />
            Nội dung:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 text-[var(--color-academic-muted)] transition-colors hover:bg-[var(--color-academic-paper)] hover:text-[var(--color-academic-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-academic-focus)] whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="ml-auto pl-4 hidden md:flex items-center shrink-0">
            <Link
              href="/tuyen-sinh/hoc-phi-hoc-bong/"
              className="text-xs font-semibold text-[var(--color-academic-accent-strong)] hover:underline whitespace-nowrap"
            >
              Xem biểu phí & học bổng →
            </Link>
          </div>
        </div>
      </Container>
    </nav>
  );
}
