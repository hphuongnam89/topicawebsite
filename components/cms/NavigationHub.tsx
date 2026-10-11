import Link from "next/link";
import type { NavGroup } from "@/data/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight, ChevronRight, GraduationCap, HelpCircle, PhoneCall, Sparkles } from "lucide-react";

export function NavigationHub({ group }: { group: NavGroup }) {
  return (
    <main className="min-h-screen bg-canvas">
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
                className="bg-paper rounded-2xl border border-line-200 p-6 lg:p-8 shadow-sm flex flex-col transition-all hover:shadow-md hover:border-brand-300"
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line-200">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h2
                    id={`hub-${group.id}-${idx}`}
                    className="font-display text-h3 text-ink-950 font-bold"
                  >
                    {column.heading}
                  </h2>
                </div>

                <ul className="space-y-2 flex-1">
                  {column.items.map((item) =>
                    item.href ? (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="group flex items-center justify-between py-2.5 px-3 rounded-lg text-ink-800 hover:text-brand-800 hover:bg-brand-50/60 transition-colors"
                        >
                          <span className="font-medium text-body-sm group-hover:translate-x-0.5 transition-transform">
                            {item.label}
                          </span>
                          <ChevronRight className="w-4 h-4 text-ink-400 group-hover:text-brand-600 shrink-0 opacity-70 group-hover:opacity-100 transition-all" />
                        </Link>
                      </li>
                    ) : null,
                  )}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Next Step Callout */}
          <div className="mt-16 bg-navy-900 text-white rounded-2xl p-8 lg:p-10 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-gold-300 text-xs font-semibold uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  Hỗ trợ thông tin trực tiếp
                </div>
                <h3 className="text-h3 font-display font-bold text-white mb-2">
                  Bạn cần giải đáp thêm về {group.label}?
                </h3>
                <p className="text-white/80 text-body-sm leading-relaxed">
                  Đội ngũ chuyên viên tuyển sinh và quản lý đào tạo luôn sẵn sàng hỗ trợ bạn lựa chọn ngành học, thủ tục xét tuyển và chính sách học phí phù hợp nhất.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <ButtonLink
                  href="https://www.tuyensinh.topicauni.edu.vn/"
                  variant="primary"
                  size="default"
                  external
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Đăng ký xét tuyển
                </ButtonLink>
                <ButtonLink
                  href="/tuyen-sinh/hoc-phi-hoc-bong/"
                  variant="secondary"
                  size="default"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  Học phí 2026
                </ButtonLink>
                <ButtonLink
                  href="/lien-he/"
                  variant="secondary"
                  size="default"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  leftIcon={<PhoneCall className="w-4 h-4" />}
                >
                  Nhận tư vấn
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
