import { LocalizedText } from "@/components/i18n/LocalizedText";
import { LocalizedElement } from "@/components/i18n/LocalizedElement";
import Link from "@/components/i18n/LocalizedLink";
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
    <LocalizedElement
      as="nav"
      aria-label="Mục lục trang ngành"
      className="sticky top-16 z-20 border-b border-[var(--color-academic-rule)] bg-[var(--color-academic-elevated)]/95 backdrop-blur-md transition-shadow"
    >
      <Container className="px-0 sm:px-4">
        <div className="no-scrollbar flex items-center gap-1 overflow-x-auto px-4 py-2.5 text-xs font-semibold sm:px-0 sm:text-sm">
          <span className="hidden shrink-0 items-center gap-2 pr-3 text-[var(--color-academic-muted)] lg:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-academic-accent)]" />
            <LocalizedText>Nội dung:</LocalizedText>
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 whitespace-nowrap text-[var(--color-academic-muted)] transition-colors hover:bg-[var(--color-academic-paper)] hover:text-[var(--color-academic-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-academic-focus)]"
              >
                <LocalizedText>{item.label}</LocalizedText>
              </a>
            ))}
          </div>
          <div className="ml-auto hidden shrink-0 items-center pl-4 md:flex">
            <Link
              href="/tuyen-sinh/hoc-phi-hoc-bong/"
              className="text-xs font-semibold whitespace-nowrap text-[var(--color-academic-accent-strong)] hover:underline"
            >
              <LocalizedText>Xem biểu phí & học bổng →</LocalizedText>
            </Link>
          </div>
        </div>
      </Container>
    </LocalizedElement>
  );
}
