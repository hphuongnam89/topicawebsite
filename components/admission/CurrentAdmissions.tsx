import { LocalizedText } from "@/components/i18n/LocalizedText";
import { LocalizedElement } from "@/components/i18n/LocalizedElement";
import Link from "@/components/i18n/LocalizedLink";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { getPublicAdmissionRounds } from "@/lib/services/cms-models";
import { formatDateTimeGMT7 } from "@/lib/date";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function CurrentAdmissions() {
  const rounds = getPublicAdmissionRounds()
    .filter((row) => row.status === "open")
    .sort((a, b) => a.deadlineAt.localeCompare(b.deadlineAt));

  // Keep the homepage focused when there is no verified, published intake round.
  if (rounds.length === 0) return null;

  return (
    <LocalizedElement as="section"
      className="border-b border-line-200 bg-surface-subtle/60 py-5 sm:py-6"
      aria-label="Thông tin kỳ tuyển sinh"
    >
      <Container>
        <ScrollReveal>
          <div className="grid gap-4 md:grid-cols-2">
            {rounds.map((round) => (
              <div
                key={round.id}
                className="flex flex-col justify-between rounded-xl border border-line-200 bg-canvas p-4 shadow-2xs sm:p-5"
              >
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="navy"><LocalizedText>Kỳ tuyển sinh 2026</LocalizedText></Badge>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                      <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      <LocalizedText>Đang nhận hồ sơ
                    </LocalizedText></span>
                  </div>
                  <h2 className="font-serif text-lg font-bold text-navy-950 sm:text-xl">
                    <LocalizedText>{round.name}</LocalizedText>
                  </h2>
                  <p className="mt-1 text-body-sm text-ink-600">
                    <LocalizedText>Hạn nộp hồ sơ xét tuyển:</LocalizedText><LocalizedText>{" "}</LocalizedText>
                    <strong className="text-ink-900"><LocalizedText>{formatDateTimeGMT7(round.deadlineAt)}</LocalizedText></strong> <LocalizedText>(giờ Việt Nam)
                  </LocalizedText></p>
                </div>
                <div className="mt-4 pt-3 border-t border-line-100 flex items-center justify-between">
                  <Link
                    className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-navy-800 hover:text-navy-950 hover:underline"
                    href="/tuyen-sinh/"
                  >
                    <LocalizedText>Xem điều kiện và hướng dẫn
                    </LocalizedText><ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </Container>
    </LocalizedElement>
  );
}
