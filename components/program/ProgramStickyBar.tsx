import { ArrowRight, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import type { ProgramDetail } from "@/data/program-details";

export function ProgramStickyBar({
  program,
}: {
  program: Pick<ProgramDetail, "officialName" | "code">;
}) {
  return (
    <aside
      aria-label="Hành động tuyển sinh"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-[var(--color-academic-rule)] bg-[color:var(--color-academic-elevated)] shadow-[0_-10px_30px_var(--color-academic-shadow)]"
    >
      <Container className="flex min-h-[var(--academic-sticky-height)] items-center justify-between gap-3 py-2 [padding-bottom:max(0.5rem,env(safe-area-inset-bottom))]">
        <p className="hidden text-sm text-[var(--color-academic-muted)] md:block">
          <strong className="text-[var(--color-academic-ink)]">{program.officialName}</strong>
          {program.code ? ` · Mã ngành ${program.code}` : " · Hồ sơ học thuật đang chờ bổ sung"}
        </p>
        <div className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto">
          <ButtonLink
            href="/lien-he/"
            variant="secondary"
            size="sm"
            leftIcon={<MessageCircle className="h-4 w-4" aria-hidden="true" />}
            className="border-[var(--color-academic-rule-strong)] text-[var(--color-academic-ink)] hover:bg-[var(--color-academic-paper)]"
          >
            Nhận tư vấn
          </ButtonLink>
          <ButtonLink
            href="https://www.tuyensinh.topicauni.edu.vn/"
            size="sm"
            rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            className="bg-[var(--color-academic-accent-strong)] text-[var(--color-academic-on-accent)] hover:bg-[var(--color-academic-ink)]"
          >
            Đăng ký ngay
          </ButtonLink>
        </div>
      </Container>
    </aside>
  );
}
