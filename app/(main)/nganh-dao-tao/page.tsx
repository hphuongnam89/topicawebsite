import { LocalizedText } from "@/components/i18n/LocalizedText";
import type { Metadata } from "next";
import Link from "@/components/i18n/LocalizedLink";
import Image from "@/components/i18n/LocalizedImage";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Card, CardMedia, CardBody, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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

import { buildLocalizedMetadata, resolveRequestLocale } from "@/lib/i18n/metadata";

export const revalidate = 300;

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
} = {}): Promise<Metadata> {
  const locale = await resolveRequestLocale(searchParams);
  return buildLocalizedMetadata({
    locale,
    title: "5 Ngành Đào tạo Cử nhân Trực tuyến | Topica Uni & ĐH Phú Xuân",
    description:
      "Danh mục 5 ngành đào tạo cử nhân đại học từ xa chính thức: Quản trị kinh doanh, Quản trị du lịch và lữ hành, Công nghệ thông tin - Đồ hoạ kỹ thuật số, Ngôn ngữ Anh, Ngôn ngữ Trung Quốc. Bằng do Trường Đại học Phú Xuân cấp.",
    viPath: "/nganh-dao-tao",
    enPath: "/en/programs",
  });
}

export default function ProgramsDirectoryPage() {
  const programs = getLivePrograms();
  const tuitionPrograms = getLiveTuitionPrograms();
  return (
    <div className="min-h-screen bg-canvas pb-24 font-sans text-ink-800">
      <PageHeader
        title="Ngành Đào tạo Cử nhân Trực tuyến"
        subtitle="5 chương trình đào tạo đại học chính thức do Trường Đại học Phú Xuân cấp bằng, ứng dụng công nghệ E-Learning hiện đại từ Viện Đào tạo Quốc tế Topica."
        breadcrumbs={[{ label: "Trang chủ", href: "/" }, { label: "Ngành đào tạo" }]}
      />

      <Container className="mt-8 space-y-12 sm:mt-10 sm:space-y-14">
        {/* Academic Legal Notice */}
        <Alert variant="info" title="Thông tin pháp lý & Giá trị văn bằng tốt nghiệp">
          <LocalizedText>Văn bằng tốt nghiệp do </LocalizedText><strong><LocalizedText>Trường Đại học Phú Xuân</LocalizedText></strong> <LocalizedText>cấp thuộc hệ thống văn
          bằng quốc gia. Theo Thông tư 27/2019/TT-BGDĐT của Bộ GD&ĐT, văn bằng cử nhân đại học hiện
          nay </LocalizedText><strong><LocalizedText>không phân biệt hình thức đào tạo</LocalizedText></strong><LocalizedText>, có giá trị pháp lý tương đương văn
          bằng chính quy để thi tuyển công chức, nâng bậc lương và học tiếp lên Thạc sĩ, Tiến sĩ.
        </LocalizedText></Alert>

        {/* Programs Grid */}
        <div className="space-y-8">
          <div className="flex flex-col justify-between gap-4 border-b border-line-200 pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-serif text-2xl font-bold text-ink-950 sm:text-3xl">
                <LocalizedText>Danh mục ngành đào tạo
              </LocalizedText></h2>
              <p className="mt-1 text-body-sm text-ink-600">
                <LocalizedText>Toàn bộ chương trình được thiết kế chuẩn tín chỉ, phù hợp cho người đi làm và học
                viên văn bằng hai.
              </LocalizedText></p>
            </div>
            <ButtonLink href="/tuyen-sinh/" variant="tertiary">
              <LocalizedText>Xem thông tin kỳ tuyển sinh
            </LocalizedText></ButtonLink>
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
                      <Badge variant="navy"><LocalizedText>{programGroups[program.group]}</LocalizedText></Badge>
                    </div>

                    <h3 className="min-h-[3.5rem] font-serif text-xl font-bold text-ink-950 transition-colors group-hover:text-navy-900">
                      <Link href={program.href} className="hover:underline">
                        <LocalizedText>{mainName}</LocalizedText>
                      </Link>
                    </h3>

                    <p className="mt-1 min-h-4 text-xs font-semibold tracking-wider text-gold-700 uppercase">
                      <LocalizedText>{specialization ? `Chuyên ngành: ${specialization}` : ""}</LocalizedText>
                    </p>

                    <p className="mt-3 flex-1 text-body-sm leading-relaxed text-ink-600">
                      <LocalizedText>{program.shortDescription}</LocalizedText>
                    </p>

                    <div className="mt-5 space-y-2 border-t border-line-100 pt-4 text-xs text-ink-700">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-ink-600">
                          <GraduationCap className="h-3.5 w-3.5 text-navy-800" />
                          <LocalizedText>Đơn vị cấp bằng:
                        </LocalizedText></span>
                        <strong className="text-ink-950"><LocalizedText>ĐH Phú Xuân (PXU)</LocalizedText></strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-ink-600">
                          <Clock className="h-3.5 w-3.5 text-navy-800" />
                          <LocalizedText>Thời gian đào tạo:
                        </LocalizedText></span>
                        <span><LocalizedText>Theo lộ trình được công nhận</LocalizedText></span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-ink-600">
                          <BookOpen className="h-3.5 w-3.5 text-navy-800" />
                          <LocalizedText>Khối lượng kiến thức:
                        </LocalizedText></span>
                        <span>
                          <LocalizedText>{tuition ? `${tuition.credits} tín chỉ` : "Xem khung chương trình"}</LocalizedText>
                        </span>
                      </div>
                      {tuition && (
                        <div className="flex items-center justify-between font-medium">
                          <span className="text-ink-600"><LocalizedText>Học phí ước tính:</LocalizedText></span>
                          <span className="font-bold text-navy-900">
                            <LocalizedText>{tuition.pricePerCredit.toLocaleString("vi-VN")}</LocalizedText> <LocalizedText>đ / tín chỉ
                          </LocalizedText></span>
                        </div>
                      )}
                    </div>
                  </CardBody>

                  <CardFooter className="grid w-full grid-cols-1 gap-2 border-t border-line-100 bg-surface-subtle/50 p-4 sm:px-6">
                    <ButtonLink href={program.href} variant="outline" size="sm" className="w-full justify-center">
                      <LocalizedText>Chi tiết & Khung học
                    </LocalizedText></ButtonLink>
                    <ButtonLink
                      href="https://www.tuyensinh.topicauni.edu.vn/"
                      variant="accent"
                      size="sm"
                      external
                      className="w-full justify-center"
                    >
                      <LocalizedText>Đăng ký xét tuyển
                    </LocalizedText></ButtonLink>
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
              <LocalizedText>Đối chiếu chương trình
            </LocalizedText></span>
            <h3 className="mt-1 font-serif text-2xl font-bold text-ink-950">
              <LocalizedText>Bảng so sánh nhanh 5 ngành cử nhân
            </LocalizedText></h3>
            <p className="mt-1 text-body-sm text-ink-600">
              <LocalizedText>Tổng hợp nhanh thời lượng, tín chỉ và mức học phí để bạn dễ dàng cân nhắc lựa chọn.
            </LocalizedText></p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-line-200 bg-canvas shadow-2xs">
            <table className="w-full min-w-[640px] text-left text-body-sm">
              <thead className="border-b border-line-200 bg-surface-subtle text-xs font-semibold uppercase text-ink-700">
                <tr>
                  <th scope="col" className="px-5 py-3.5"><LocalizedText>Ngành đào tạo</LocalizedText></th>
                  <th scope="col" className="px-5 py-3.5"><LocalizedText>Chuyên ngành</LocalizedText></th>
                  <th scope="col" className="px-5 py-3.5"><LocalizedText>Đơn vị cấp bằng</LocalizedText></th>
                  <th scope="col" className="px-5 py-3.5 text-center"><LocalizedText>Tín chỉ</LocalizedText></th>
                  <th scope="col" className="px-5 py-3.5 text-right"><LocalizedText>Đơn giá / Tín chỉ</LocalizedText></th>
                  <th scope="col" className="px-5 py-3.5 text-center"><LocalizedText>Khung học</LocalizedText></th>
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
                          <LocalizedText>{mainName}</LocalizedText>
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-gold-800">
                        <LocalizedText>{specialization}</LocalizedText>
                      </td>
                      <td className="px-5 py-4 text-ink-600">
                        <LocalizedText>ĐH Phú Xuân
                      </LocalizedText></td>
                      <td className="px-5 py-4 text-center font-medium">
                        {tuition?.credits ?? 126}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-navy-900">
                        <LocalizedText>{tuition ? `${tuition.pricePerCredit.toLocaleString("vi-VN")} đ` : "600.000 đ"}</LocalizedText>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Link
                          href={program.href}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-navy-800 hover:text-navy-950 hover:underline"
                        >
                          <LocalizedText>Xem chi tiết
                          </LocalizedText><ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
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
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <span className="text-xs font-semibold tracking-wider text-navy-800 uppercase">
                <LocalizedText>Quyền lợi người học
              </LocalizedText></span>
              <h3 className="mt-2 font-serif text-2xl font-bold text-ink-950 sm:text-3xl">
                <LocalizedText>Vì sao nên chọn học Cử nhân trực tuyến Topica?
              </LocalizedText></h3>
            </div>
            <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-success" />
                <div>
                  <h4 className="font-semibold text-ink-950"><LocalizedText>Tiết kiệm thời gian & Chi phí</LocalizedText></h4>
                  <p className="mt-1 text-body-sm text-ink-600">
                    <LocalizedText>Học mọi lúc mọi nơi trên nền tảng Elearning, không tốn chi phí đi lại và thuê
                    nhà ở tập trung.
                  </LocalizedText></p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-success" />
                <div>
                  <h4 className="font-semibold text-ink-950"><LocalizedText>Văn bằng cử nhân chuẩn quốc gia</LocalizedText></h4>
                  <p className="mt-1 text-body-sm text-ink-600">
                    <LocalizedText>Được Bộ Giáo dục và Đào tạo công nhận, đầy đủ quyền lợi học lên cao học hoặc thi
                    biên chế nhà nước.
                  </LocalizedText></p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-success" />
                <div>
                  <h4 className="font-semibold text-ink-950"><LocalizedText>Cơ chế miễn giảm tín chỉ</LocalizedText></h4>
                  <p className="mt-1 text-body-sm text-ink-600">
                    <LocalizedText>Người đã có bằng Trung cấp, Cao đẳng hoặc Đại học khác được xét công nhận tín
                    chỉ để rút ngắn thời gian.
                  </LocalizedText></p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-success" />
                <div>
                  <h4 className="font-semibold text-ink-950">
                    <LocalizedText>Học phí minh bạch, chia kỳ linh hoạt
                  </LocalizedText></h4>
                  <p className="mt-1 text-body-sm text-ink-600">
                    <LocalizedText>Đóng học phí theo số lượng tín chỉ thực tế đăng ký trong từng kỳ, cam kết không
                    phát sinh phụ phí ẩn.
                  </LocalizedText></p>
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
                <LocalizedText>Bạn đang phân vân chưa biết ngành nào phù hợp?
              </LocalizedText></h3>
              <p className="mt-2 text-body-sm leading-relaxed text-white/80">
                <LocalizedText>Hãy liên hệ trực tiếp với chuyên viên tư vấn tuyển sinh Topica để được hướng dẫn
                chọn ngành, đánh giá điều kiện hồ sơ và nhận kế hoạch học tập cá nhân hóa.
              </LocalizedText></p>
            </div>
            <div className="flex w-full max-w-md flex-col gap-3 lg:max-w-[18.25rem]">
              <ButtonLink
                href="https://www.tuyensinh.topicauni.edu.vn/"
                variant="accent"
                size="lg"
                external
                className="w-full justify-center"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                <LocalizedText>Đăng ký xét tuyển ngay
              </LocalizedText></ButtonLink>
              <ButtonLink
                href="/tuyen-sinh/hoc-phi-hoc-bong/"
                variant="secondary"
                size="lg"
                className="w-full justify-center border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                <LocalizedText>Tra cứu học phí 2026
              </LocalizedText></ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
