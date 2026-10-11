import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { SearchForm } from "@/components/search/SearchForm";
import { programs } from "@/data/programs";
import { GraduationCap, ArrowRight, Home, PhoneCall, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-canvas py-16 lg:py-24 font-sans text-ink-800">
      <Container size="narrow">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-navy-50 text-navy-900 border border-navy-200">
            <span className="font-serif text-3xl font-bold">404</span>
          </div>

          <h1 className="mt-6 font-serif text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
            Không tìm thấy trang yêu cầu
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-body text-ink-600 leading-relaxed">
            Địa chỉ bạn vừa truy cập có thể đã được cập nhật, chuyển hướng hoặc tạm thời không khả dụng.
            Bạn có thể tìm kiếm thông tin bên dưới hoặc quay lại các chuyên mục chính.
          </p>

          {/* Integrated Search */}
          <div className="mx-auto mt-8 max-w-md">
            <SearchForm />
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/" variant="primary" size="default" leftIcon={<Home className="h-4 w-4" />}>
              Về trang chủ
            </ButtonLink>
            <ButtonLink href="/nganh-dao-tao/" variant="secondary" size="default" leftIcon={<GraduationCap className="h-4 w-4" />}>
              Xem 5 ngành đào tạo
            </ButtonLink>
            <ButtonLink href="/tuyen-sinh/hoc-phi-hoc-bong/" variant="outline" size="default">
              Học phí 2026
            </ButtonLink>
          </div>
        </div>

        {/* 5 Recommended Programs */}
        <div className="mt-16 rounded-2xl border border-line-200 bg-surface-subtle p-6 sm:p-8">
          <h2 className="font-serif text-xl font-bold text-ink-950 sm:text-2xl mb-4">
            Hoặc khám phá 5 chương trình Cử nhân trực tuyến:
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {programs.map((program) => (
              <Link
                key={program.slug}
                href={program.href}
                className="group flex items-center justify-between rounded-lg border border-line-200 bg-canvas p-3.5 transition-all hover:border-navy-500 hover:shadow-xs"
              >
                <div className="min-w-0 pr-3">
                  <span className="font-semibold text-body-sm text-ink-900 group-hover:text-navy-900 transition-colors">
                    {program.name}
                  </span>
                  <p className="text-xs text-ink-600 mt-0.5">Bằng Cử nhân Trường ĐH Phú Xuân</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-400 group-hover:text-navy-900 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line-200 pt-4 text-xs text-ink-600">
            <div className="flex items-center gap-1.5">
              <PhoneCall className="h-4 w-4 text-navy-800" />
              <span>Hotline tư vấn tuyển sinh miễn phí:</span>
              <a href="tel:1800646857" className="font-bold text-navy-900 hover:underline">
                1800 646 857
              </a>
            </div>
            <Link href="/nhung-cau-hoi-thuong-gap/" className="flex items-center gap-1 text-navy-900 hover:underline font-medium">
              <HelpCircle className="h-3.5 w-3.5" />
              Câu hỏi thường gặp (FAQ)
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
