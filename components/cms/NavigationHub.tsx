import { LocalizedText } from "@/components/i18n/LocalizedText";
import Link from "@/components/i18n/LocalizedLink";
import type { NavGroup } from "@/data/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import {
  ArrowRight,
  ChevronRight,
  GraduationCap,
  HelpCircle,
  PhoneCall,
  Sparkles,
} from "lucide-react";

export function NavigationHub({ group }: { group: NavGroup }) {
  return (
    <div className="min-h-screen bg-canvas">
      <PageHeader
        title={group.label}
        subtitle={`Trung tâm điều hướng thông tin và tài nguyên chuyên đề: ${group.label}.`}
        breadcrumbs={[{ label: "Trang chủ", href: "/" }, { label: group.label }]}
      />

      <section className="py-12 sm:py-16 lg:py-20">
        <Container>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {group.columns.map((column, idx) => (
              <div
                key={column.heading}
                className="flex flex-col rounded-2xl border border-line-200 bg-paper p-6 shadow-sm transition-all hover:border-brand-300 hover:shadow-md lg:p-8"
              >
                <div className="mb-6 flex items-center gap-3 border-b border-line-200 pb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <h2
                    id={`hub-${group.id}-${idx}`}
                    className="font-display text-h3 font-bold text-ink-950"
                  >
                    <LocalizedText>{column.heading}</LocalizedText>
                  </h2>
                </div>

                <ul className="flex-1 space-y-2">
                  {column.items.map((item) =>
                    item.href ? (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-ink-800 transition-colors hover:bg-brand-50/60 hover:text-brand-800"
                        >
                          <span className="text-body-sm font-medium transition-transform group-hover:translate-x-0.5">
                            <LocalizedText>{item.label}</LocalizedText>
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-ink-400 opacity-70 transition-all group-hover:text-brand-600 group-hover:opacity-100" />
                        </Link>
                      </li>
                    ) : null,
                  )}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Next Step Callout */}
          <div className="relative mt-16 overflow-hidden rounded-2xl bg-navy-900 p-8 text-white shadow-lg lg:p-10">
            <div className="pointer-events-none absolute top-0 right-0 -mt-20 -mr-20 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl" />

            <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider text-gold-300 uppercase">
                  <Sparkles className="h-3.5 w-3.5" />
                  <LocalizedText>Hỗ trợ thông tin trực tiếp</LocalizedText>
                </div>
                <h3 className="mb-2 font-display text-h3 font-bold text-white">
                  <LocalizedText>Bạn cần giải đáp thêm về </LocalizedText>
                  <LocalizedText>{group.label}</LocalizedText>
                  <LocalizedText>?</LocalizedText>
                </h3>
                <p className="text-body-sm leading-relaxed text-white/80">
                  <LocalizedText>
                    Đội ngũ chuyên viên tuyển sinh và quản lý đào tạo luôn sẵn sàng hỗ trợ bạn lựa
                    chọn ngành học, thủ tục xét tuyển và chính sách học phí phù hợp nhất.
                  </LocalizedText>
                </p>
              </div>

              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[30rem] lg:shrink-0">
                <ButtonLink
                  href="https://www.tuyensinh.topicauni.edu.vn/"
                  variant="accent"
                  size="default"
                  external
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="w-full justify-center"
                >
                  <LocalizedText>Đăng ký xét tuyển</LocalizedText>
                </ButtonLink>
                <ButtonLink
                  href="/tuyen-sinh/hoc-phi-hoc-bong/"
                  variant="secondary"
                  size="default"
                  className="w-full justify-center border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <LocalizedText>Học phí 2026</LocalizedText>
                </ButtonLink>
                <ButtonLink
                  href="/lien-he/"
                  variant="secondary"
                  size="default"
                  leftIcon={<PhoneCall className="h-4 w-4" />}
                  className="w-full justify-center border-white/20 bg-white/10 text-white hover:bg-white/20 sm:col-span-2 sm:mx-auto sm:w-[calc((100%-0.75rem)/2)]"
                >
                  <LocalizedText>Nhận tư vấn</LocalizedText>
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
