import { ArrowRight, Phone, WalletCards } from "lucide-react";
import { contactInfo } from "@/data/campuses";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import type { ProgramDetail } from "@/data/program-details";

export function ProgramStickyBar({
  program,
}: {
  program: Pick<ProgramDetail, "officialName" | "code" | "marketingLabel">;
}) {
  const applyUrl = new URL("https://www.tuyensinh.topicauni.edu.vn/");
  applyUrl.searchParams.set("program_code", program.code ?? "");
  applyUrl.searchParams.set("program_name", program.officialName);
  applyUrl.searchParams.set("program_direction", program.marketingLabel);
  applyUrl.searchParams.set("source", "program_page");

  return (
    <aside
      aria-label="Hành động tuyển sinh"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-[var(--color-academic-rule)] bg-[color:var(--color-academic-elevated)] shadow-[0_-10px_30px_var(--color-academic-shadow)]"
    >
      <Container className="flex min-h-[var(--academic-sticky-height)] items-center justify-between gap-3 py-2 [padding-bottom:max(0.5rem,env(safe-area-inset-bottom))]">
        <p className="hidden text-sm text-[var(--color-academic-muted)] md:block">
          <strong className="text-[var(--color-academic-ink)]">{program.officialName}</strong>
          {program.code ? ` · Mã ngành ${program.code}` : null}
        </p>
        <div className="grid w-full grid-cols-3 gap-2 md:flex md:w-auto">
          <ButtonLink
            href={`tel:${contactInfo.phone}`}
            variant="secondary"
            size="sm"
            leftIcon={<Phone className="h-4 w-4" aria-hidden="true" />}
            data-track="phone_click"
            className="border-[var(--color-academic-rule-strong)] text-[var(--color-academic-ink)] hover:bg-[var(--color-academic-paper)]"
          >
            <span className="sr-only">Gọi tư vấn </span>Gọi
          </ButtonLink>
          <ButtonLink
            href="#hoc-phi"
            variant="secondary"
            size="sm"
            leftIcon={<WalletCards className="h-4 w-4" aria-hidden="true" />}
            data-track="tuition_click"
            className="border-[var(--color-academic-rule-strong)] text-[var(--color-academic-ink)] hover:bg-[var(--color-academic-paper)]"
          >
            Học phí
          </ButtonLink>
          <ButtonLink
            href={applyUrl.toString()}
            size="sm"
            external
            data-track="program_cta_click"
            rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            className="bg-[var(--color-academic-accent-strong)] text-[var(--color-academic-on-accent)] hover:bg-[var(--color-academic-ink)]"
          >
            Đăng ký
          </ButtonLink>
        </div>
      </Container>
    </aside>
  );
}
