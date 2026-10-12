import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getPublicAdmissionRounds } from "@/lib/services/cms-models";
import { formatDateTimeGMT7 } from "@/lib/date";
import { CalendarDays, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function CurrentAdmissions() {
  const rounds = getPublicAdmissionRounds()
    .filter((row) => row.status === "open")
    .sort((a, b) => a.deadlineAt.localeCompare(b.deadlineAt));

  return (
    <section
      className="border-b border-line-200 bg-surface-subtle/60 py-5 sm:py-6"
      aria-label="Thông tin kỳ tuyển sinh"
    >
      <Container>
        {rounds.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {rounds.map((round) => (
              <div
                key={round.id}
                className="flex flex-col justify-between rounded-xl border border-line-200 bg-canvas p-4 shadow-2xs sm:p-5"
              >
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="navy">Kỳ tuyển sinh 2026</Badge>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                      <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      Đang nhận hồ sơ
                    </span>
                  </div>
                  <h2 className="font-serif text-lg font-bold text-navy-950 sm:text-xl">
                    {round.name}
                  </h2>
                  <p className="mt-1 text-body-sm text-ink-600">
                    Hạn nộp hồ sơ xét tuyển:{" "}
                    <strong className="text-ink-900">{formatDateTimeGMT7(round.deadlineAt)}</strong> (giờ Việt Nam)
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-line-100 flex items-center justify-between">
                  <Link
                    className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-navy-800 hover:text-navy-950 hover:underline"
                    href="/tuyen-sinh/"
                  >
                    Xem điều kiện và hướng dẫn
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-xl border border-navy-100/60 bg-canvas p-4 text-ink-700 shadow-2xs sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-900">
                <CalendarDays className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-body-sm font-semibold text-navy-950">
                  Thông tin kế hoạch tuyển sinh 2026
                </p>
                <p className="text-body-sm text-ink-600">
                  Các đợt xét tuyển mới đang được cập nhật kế hoạch tiếp nhận hồ sơ định kỳ.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2 sm:pt-0">
              <Link
                href="/tuyen-sinh/"
                className="inline-flex items-center gap-1 text-body-sm font-semibold text-navy-800 hover:text-navy-950 hover:underline"
              >
                Xem quy chế tuyển sinh
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <span className="hidden text-line-300 sm:inline">|</span>
              <Link
                href="/lien-he/"
                className="text-body-sm font-semibold text-gold-700 hover:text-gold-800 hover:underline"
              >
                Nhận tư vấn về lịch và hồ sơ.
              </Link>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
