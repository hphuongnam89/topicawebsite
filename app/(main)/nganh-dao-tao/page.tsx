import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Card, CardMedia, CardBody, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ButtonLink } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { programGroups } from "@/data/programs";
import { getLivePrograms, getLiveTuitionPrograms } from "@/lib/services/public-site";
import { OFFICIAL_TUITION_PROGRAMS } from "@/data/tuition";
import { env } from "@/lib/env";
import {
  GraduationCap,
  Clock,
  BookOpen,
  ArrowRight,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "5 Ngành Đào tạo Cử nhân Trực tuyến | Topica Uni & ĐH Phú Xuân",
  description:
    "Danh mục 5 ngành đào tạo cử nhân đại học từ xa chính thức: Quản trị kinh doanh, Quản trị du lịch và lữ hành, Công nghệ thông tin - Đồ hoạ kỹ thuật số, Ngôn ngữ Anh, Ngôn ngữ Trung Quốc. Bằng do Trường Đại học Phú Xuân cấp.",
  alternates: {
    canonical: `${env.NEXT_PUBLIC_SITE_URL}/nganh-dao-tao/`,
  },
  openGraph: {
    title: "5 Ngành Đào tạo Cử nhân Trực tuyến | Topica Uni & ĐH Phú Xuân",
    description:
      "Chương trình cử nhân trực tuyến chuẩn quốc gia do Trường Đại học Phú Xuân cấp bằng. Thời gian linh hoạt, học trực tuyến 100%.",
    url: `${env.NEXT_PUBLIC_SITE_URL}/nganh-dao-tao/`,
    type: "website",
  },
};

export default function ProgramsDirectoryPage() {
  const programs = getLivePrograms();
  const tuitionPrograms = getLiveTuitionPrograms();
  return (
    <main className="min-h-screen bg-canvas pb-24 font-sans text-ink-800">
      <PageHeader
        title="Ngành Đào tạo Cử nhân Trực tuyến"
        subtitle="5 chương trình đào tạo đại học chính thức do Trường Đại học Phú Xuân cấp bằng, ứng dụng công nghệ E-Learning hiện đại từ Viện Đào tạo Quốc tế Topica."
        breadcrumbs={[{ label: "Trang chủ", href: "/" }, { label: "Ngành đào tạo" }]}
      />

      <Container className="mt-12 space-y-16">
        {/* Academic Legal Notice */}
        <Alert variant="info" title="Thông tin pháp lý & Giá trị văn bằng tốt nghiệp">
          Văn bằng tốt nghiệp do <strong>Trường Đại học Phú Xuân</strong> cấp thuộc hệ thống văn
          bằng quốc gia. Theo Thông tư 27/2019/TT-BGDĐT của Bộ GD&ĐT, văn bằng cử nhân đại học hiện
          nay <strong>không phân biệt hình thức đào tạo</strong>, có giá trị pháp lý tương đương văn
          bằng chính quy để thi tuyển công chức, nâng bậc lương và học tiếp lên Thạc sĩ, Tiến sĩ.
        </Alert>

        {/* Quick Highlights Strip */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-line-200 bg-surface-subtle/70 p-4 text-center sm:p-5">
            <span className="font-serif text-2xl font-bold text-navy-950 sm:text-3xl">5</span>
            <p className="mt-1 text-xs font-semibold text-ink-600 uppercase tracking-wider">Ngành cử nhân</p>
            <p className="mt-0.5 text-xs text-ink-500">Bằng ĐH Phú Xuân</p>
          </div>
          <div className="rounded-xl border border-line-200 bg-surface-subtle/70 p-4 text-center sm:p-5">
            <span className="font-serif text-2xl font-bold text-navy-950 sm:text-3xl">126</span>
            <p className="mt-1 text-xs font-semibold text-ink-600 uppercase tracking-wider">Tín chỉ chuẩn</p>
            <p className="mt-0.5 text-xs text-ink-500">Khung đào tạo chuẩn</p>
          </div>
          <div className="rounded-xl border border-line-200 bg-surface-subtle/70 p-4 text-center sm:p-5">
            <span className="font-serif text-2xl font-bold text-navy-950 sm:text-3xl">100%</span>
            <p className="mt-1 text-xs font-semibold text-ink-600 uppercase tracking-wider">Trực tuyến</p>
            <p className="mt-0.5 text-xs text-ink-500">Chủ động thời gian</p>
          </div>
          <div className="rounded-xl border border-line-200 bg-surface-subtle/70 p-4 text-center sm:p-5">
            <span className="font-serif text-2xl font-bold text-navy-950 sm:text-3xl">600k</span>
            <p className="mt-1 text-xs font-semibold text-ink-600 uppercase tracking-wider">Đ / Tín chỉ</p>
            <p className="mt-0.5 text-xs text-ink-500">Đóng theo kỳ đăng ký</p>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="space-y-8">
          <div className="flex flex-col justify-between gap-4 border-b border-line-200 pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-serif text-2xl font-bold text-ink-950 sm:text-3xl">
                Danh mục ngành đào tạo
              </h2>
              <p className="mt-1 text-body-sm text-ink-600">
                Toàn bộ chương trình được thiết kế chuẩn tín chỉ, phù hợp cho người đi làm và học
                viên văn bằng hai.
              </p>
            </div>
            <ButtonLink href="/tuyen-sinh/" variant="tertiary">
              Xem thông tin kỳ tuyển sinh
            </ButtonLink>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => {
              const tuition = tuitionPrograms.find((p) => p.slug === program.slug);
              const hasSpecialization = program.name.includes("- chuyên ngành");
              const mainName = hasSpecialization
                ? program.name.split("- chuyên ngành")[0].trim()
                : program.name;
              const specialization = hasSpecialization
                ? program.name.split("- chuyên ngành")[1].trim()
                : null;

              return (
                <Card
                  key={program.slug}
                  className="flex flex-col overflow-hidden border-line-200 bg-canvas transition-all duration-300 hover:border-navy-300 hover:shadow-card-hover"
                >
                  <CardMedia aspect="aspect-[16/10]">
                    <div className="relative h-full w-full bg-navy-50">
                      <Image
                        src={program.image}
                        alt={program.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </CardMedia>

                  <CardBody className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <Badge variant="navy">{programGroups[program.group]}</Badge>
                      <StatusBadge variant="active" showIcon={false} />
                    </div>

                    <h3 className="font-serif text-xl font-bold text-ink-950 transition-colors group-hover:text-navy-900">
                      <Link href={program.href} className="hover:underline">
                        {mainName}
                      </Link>
                    </h3>

                    {specialization && (
                      <p className="mt-1 text-xs font-semibold tracking-wider text-gold-700 uppercase">
                        Chuyên ngành: {specialization}
                      </p>
                    )}

                    <p className="mt-3 flex-1 text-body-sm leading-relaxed text-ink-600">
                      {program.shortDescription}
                    </p>

                    <div className="mt-5 space-y-2 border-t border-line-100 pt-4 text-xs text-ink-700">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-ink-600">
                          <GraduationCap className="h-3.5 w-3.5 text-navy-800" />
                          Đơn vị cấp bằng:
                        </span>
                        <strong className="text-ink-950">ĐH Phú Xuân (PXU)</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-ink-600">
                          <Clock className="h-3.5 w-3.5 text-navy-800" />
                          Thời gian đào tạo:
                        </span>
                        <span>Theo lộ trình được công nhận</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-ink-600">
                          <BookOpen className="h-3.5 w-3.5 text-navy-800" />
                          Khối lượng kiến thức:
                        </span>
                        <span>
                          {tuition ? `${tuition.credits} tín chỉ` : "Xem khung chương trình"}
                        </span>
                      </div>
                      {tuition && (
                        <div className="flex items-center justify-between font-medium">
                          <span className="text-ink-600">Học phí ước tính:</span>
                          <span className="font-bold text-navy-900">
                            {tuition.pricePerCredit.toLocaleString("vi-VN")} đ / tín chỉ
                          </span>
                        </div>
                      )}
                    </div>
                  </CardBody>

                  <CardFooter className="flex items-center justify-between gap-3 border-t border-line-100 bg-surface-subtle/50 p-4 sm:px-6">
                    <ButtonLink href={program.href} variant="outline" size="sm">
                      Chi tiết & Khung học
                    </ButtonLink>
                    <ButtonLink
                      href="https://www.tuyensinh.topicauni.edu.vn/"
                      variant="accent"
                      size="sm"
                      external
                    >
                      Đăng ký xét tuyển
                    </ButtonLink>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 5-Program Quick Comparison Matrix */}
        <div className="space-y-6">
          <div className="border-b border-line-200 pb-3">
            <span className="text-xs font-semibold tracking-wider text-navy-800 uppercase">
              Đối chiếu chương trình
            </span>
            <h3 className="mt-1 font-serif text-2xl font-bold text-ink-950">
              Bảng so sánh nhanh 5 ngành cử nhân
            </h3>
            <p className="mt-1 text-body-sm text-ink-600">
              Tổng hợp nhanh thời lượng, tín chỉ và mức học phí để bạn dễ dàng cân nhắc lựa chọn.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-line-200 bg-canvas shadow-2xs">
            <table className="w-full min-w-[640px] text-left text-body-sm">
              <thead className="border-b border-line-200 bg-surface-subtle text-xs font-semibold uppercase text-ink-700">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Ngành đào tạo</th>
                  <th scope="col" className="px-5 py-3.5">Chuyên ngành</th>
                  <th scope="col" className="px-5 py-3.5">Đơn vị cấp bằng</th>
                  <th scope="col" className="px-5 py-3.5 text-center">Tín chỉ</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Đơn giá / Tín chỉ</th>
                  <th scope="col" className="px-5 py-3.5 text-center">Khung học</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-100 text-ink-800">
                {programs.map((program) => {
                  const tuition = tuitionPrograms.find((p) => p.slug === program.slug);
                  const hasSpecialization = program.name.includes("- chuyên ngành");
                  const mainName = hasSpecialization
                    ? program.name.split("- chuyên ngành")[0].trim()
                    : program.name;
                  const specialization = hasSpecialization
                    ? program.name.split("- chuyên ngành")[1].trim()
                    : "—";

                  return (
                    <tr key={program.slug} className="transition-colors hover:bg-surface-subtle/40">
                      <td className="px-5 py-4 font-semibold text-navy-950">
                        <Link href={program.href} className="hover:underline">
                          {mainName}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-gold-800">
                        {specialization}
                      </td>
                      <td className="px-5 py-4 text-ink-600">
                        ĐH Phú Xuân
                      </td>
                      <td className="px-5 py-4 text-center font-medium">
                        {tuition?.credits ?? 126}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-navy-900">
                        {tuition ? `${tuition.pricePerCredit.toLocaleString("vi-VN")} đ` : "600.000 đ"}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Link
                          href={program.href}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-navy-800 hover:text-navy-950 hover:underline"
                        >
                          Xem chi tiết
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparison & Academic Principles */}
        <div className="rounded-2xl border border-line-200 bg-surface-subtle p-8 lg:p-10">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold tracking-wider text-navy-800 uppercase">
              Quyền lợi người học
            </span>
            <h3 className="mt-2 font-serif text-2xl font-bold text-ink-950 sm:text-3xl">
              Vì sao nên chọn học Cử nhân trực tuyến Topica?
            </h3>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-success" />
                <div>
                  <h4 className="font-semibold text-ink-950">Tiết kiệm thời gian & Chi phí</h4>
                  <p className="mt-1 text-body-sm text-ink-600">
                    Học mọi lúc mọi nơi trên nền tảng Elearning, không tốn chi phí đi lại và thuê
                    nhà ở tập trung.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-success" />
                <div>
                  <h4 className="font-semibold text-ink-950">Văn bằng cử nhân chuẩn quốc gia</h4>
                  <p className="mt-1 text-body-sm text-ink-600">
                    Được Bộ Giáo dục và Đào tạo công nhận, đầy đủ quyền lợi học lên cao học hoặc thi
                    biên chế nhà nước.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-success" />
                <div>
                  <h4 className="font-semibold text-ink-950">Cơ chế miễn giảm tín chỉ</h4>
                  <p className="mt-1 text-body-sm text-ink-600">
                    Người đã có bằng Trung cấp, Cao đẳng hoặc Đại học khác được xét công nhận tín
                    chỉ để rút ngắn thời gian.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-success" />
                <div>
                  <h4 className="font-semibold text-ink-950">
                    Học phí minh bạch, chia kỳ linh hoạt
                  </h4>
                  <p className="mt-1 text-body-sm text-ink-600">
                    Đóng học phí theo số lượng tín chỉ thực tế đăng ký trong từng kỳ, cam kết không
                    phát sinh phụ phí ẩn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div className="relative overflow-hidden rounded-2xl bg-navy-900 p-8 text-white shadow-lg lg:p-10">
          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h3 className="font-serif text-2xl font-bold text-white sm:text-3xl">
                Bạn đang phân vân chưa biết ngành nào phù hợp?
              </h3>
              <p className="mt-2 text-body-sm leading-relaxed text-white/80">
                Hãy liên hệ trực tiếp với chuyên viên tư vấn tuyển sinh Topica để được hướng dẫn
                chọn ngành, đánh giá điều kiện hồ sơ và nhận kế hoạch học tập cá nhân hóa.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ButtonLink
                href="https://www.tuyensinh.topicauni.edu.vn/"
                variant="accent"
                size="lg"
                external
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Đăng ký xét tuyển ngay
              </ButtonLink>
              <ButtonLink
                href="/tuyen-sinh/hoc-phi-hoc-bong/"
                variant="secondary"
                size="lg"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                Tra cứu học phí 2026
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
