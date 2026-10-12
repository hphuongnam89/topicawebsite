import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AdmissionBanner } from "@/components/cta/AdmissionBanner";
import { DocumentCard } from "@/components/ui/DocumentCard";
import { Check, ShieldCheck, CreditCard, Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { PublicDocumentDto } from "@/lib/services/cms-models";
import {
  OFFICIAL_TUITION_PROGRAMS,
  ADMISSION_FEES,
  SCHOLARSHIPS,
  TUITION_COMMITMENTS,
  type ProgramTuition,
  type ScholarshipPolicy,
} from "@/data/tuition";

function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export function TuitionHub({
  tuitionPrograms = OFFICIAL_TUITION_PROGRAMS,
  scholarships = SCHOLARSHIPS,
  documents = [],
}: {
  tuitionPrograms?: readonly ProgramTuition[];
  scholarships?: readonly ScholarshipPolicy[];
  documents?: readonly PublicDocumentDto[];
} = {}) {
  return (
    <div className="space-y-0">
      {/* 1. Tổng quan & Biểu phí 5 ngành đào tạo */}
      <Section variant="paper">
        <Container>
          <div className="mb-12 max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-navy-200 bg-navy-50 px-3 py-1 text-xs font-semibold tracking-wider text-navy-900 uppercase">
              Khóa tuyển sinh năm 2026
            </div>
            <SectionHeading>Học phí theo chương trình và đối tượng</SectionHeading>
            <p className="mt-4 text-body-lg text-ink-700">
              Chương trình đào tạo đại học do <strong>Trường Đại học Phú Xuân</strong> cấp bằng, hợp
              tác triển khai cùng <strong>Viện Đào tạo Quốc tế Topica</strong>. Học phí thu theo số
              tín chỉ thực tế sinh viên đăng ký. Lộ trình và số tín chỉ còn lại phụ thuộc ngành, đối
              tượng và kết quả xét công nhận học phần.
            </p>
          </div>

          {/* Mobile view: Thẻ học phí từng ngành (dễ đọc, không phải cuộn ngang) */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:hidden">
            {tuitionPrograms.map((prog) => (
              <div
                key={`mobile-${prog.slug}`}
                className="space-y-3 rounded-xl border border-line-200 bg-canvas p-5 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2 border-b border-line-100 pb-3">
                  <div>
                    <Link
                      href={`/${prog.slug}/`}
                      className="inline-flex items-center gap-1 font-bold text-ink-950 transition-colors hover:text-navy-900"
                    >
                      {prog.programName}
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-navy-700" />
                    </Link>
                    {prog.note && <div className="mt-0.5 text-xs text-ink-500">{prog.note}</div>}
                  </div>
                  <span className="shrink-0 rounded bg-line-100 px-2 py-0.5 font-mono text-xs font-semibold text-ink-700">
                    {prog.majorCode}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-body-sm">
                  <div>
                    <span className="block text-xs text-ink-500">Đơn giá / tín chỉ</span>
                    <span className="font-semibold text-navy-900">
                      {formatVND(prog.pricePerCredit)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-ink-500">Ước tính / học kỳ</span>
                    <span className="font-medium text-ink-800">
                      ~{formatVND(prog.tuitionPerSemester)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-ink-500">Tín chỉ tích lũy</span>
                    <span className="font-medium text-ink-700">{prog.credits} TC</span>
                  </div>
                  <div>
                    <span className="block text-xs text-ink-500">Học phí toàn khóa</span>
                    <span className="font-bold text-ink-950">{formatVND(prog.totalTuition)}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="space-y-1 rounded-lg border border-line-200 bg-paper p-4 text-xs text-ink-600">
              <div>
                * Ước tính theo tín chỉ trong từng chính sách. Chi phí thực tế được xác nhận theo hồ
                sơ và đăng ký học phần.
              </div>
              <div className="font-semibold text-ink-800">
                Văn bằng: Bằng Cử nhân do Trường Đại học Phú Xuân cấp
              </div>
            </div>
          </div>

          {/* Desktop view: Bảng học phí chi tiết 5 ngành */}
          <div className="mb-12 hidden overflow-hidden rounded-2xl border border-line-200 bg-canvas shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-ink-900 text-sm tracking-wider text-white uppercase">
                    <th className="px-6 py-4 font-semibold">Ngành đào tạo</th>
                    <th className="px-4 py-4 text-center font-semibold">Mã ngành</th>
                    <th className="px-4 py-4 text-center font-semibold">Tín chỉ</th>
                    <th className="px-4 py-4 text-right font-semibold">Đơn giá / tín chỉ</th>
                    <th className="px-4 py-4 text-right font-semibold">Ước tính / học kỳ</th>
                    <th className="px-6 py-4 text-right font-semibold">Học phí toàn khóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-200 text-body-sm text-ink-900">
                  {tuitionPrograms.map((prog) => (
                    <tr key={prog.slug} className="transition-colors hover:bg-navy-50/40">
                      <td className="px-6 py-4 font-semibold">
                        <Link
                          href={`/${prog.slug}/`}
                          className="inline-flex items-center gap-1.5 transition-colors hover:text-navy-900"
                        >
                          {prog.programName}
                          <ArrowRight className="h-3.5 w-3.5 text-navy-700 opacity-60" />
                        </Link>
                        {prog.note && (
                          <div className="mt-0.5 text-xs font-normal text-ink-500">{prog.note}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center font-mono text-xs text-ink-600">
                        {prog.majorCode}
                      </td>
                      <td className="px-4 py-4 text-center font-medium">{prog.credits} TC</td>
                      <td className="px-4 py-4 text-right font-semibold text-navy-900">
                        {formatVND(prog.pricePerCredit)}
                      </td>
                      <td className="px-4 py-4 text-right text-ink-700">
                        ~{formatVND(prog.tuitionPerSemester)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-ink-950">
                        {formatVND(prog.totalTuition)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col justify-between gap-3 border-t border-line-200 bg-paper p-4 text-xs text-ink-600 md:flex-row md:items-center lg:p-6">
              <div>
                * Tổng và ước tính mỗi kỳ dựa trên tín chỉ trong chính sách đang hiển thị. Các khoản
                ngoài học phí và tín chỉ được công nhận cần xác nhận theo hồ sơ.
              </div>
              <div className="shrink-0 font-semibold text-ink-800">
                Văn bằng: Bằng Cử nhân do Trường Đại học Phú Xuân cấp
              </div>
            </div>
          </div>

          {/* Lệ phí nhập học và các cam kết */}
          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
            <div className="rounded-xl border border-line-200 bg-canvas p-6 shadow-sm lg:p-8">
              <h3 className="text-h4 mb-4 flex items-center gap-2 font-display font-bold text-ink-950">
                <CreditCard className="h-5 w-5 text-navy-800" />
                Các khoản phí khi nhập học
              </h3>
              <ul className="space-y-3 text-body-sm text-ink-800">
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <span>
                    <strong>Lệ phí xét tuyển:</strong> {formatVND(ADMISSION_FEES.admissionFee)}/hồ
                    sơ, lệ phí hồ sơ miễn phí theo thông báo tuyển sinh 2026 đợt 2. Xác nhận mức áp
                    dụng cho đợt hiện tại trước khi nộp.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <span>
                    <strong>Bảo hiểm y tế & khám sức khỏe:</strong> {ADMISSION_FEES.healthInsurance}
                    .
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <span>
                    <strong>Tài liệu & học liệu số:</strong> {ADMISSION_FEES.materialsFee}.
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-line-200 bg-canvas p-6 shadow-sm lg:p-8">
              <h3 className="text-h4 mb-4 flex items-center gap-2 font-display font-bold text-ink-950">
                <ShieldCheck className="h-5 w-5 text-navy-800" />
                Cam kết minh bạch tài chính
              </h3>
              <div className="space-y-3 text-body-sm text-ink-700">
                {TUITION_COMMITMENTS.map((rule, idx) => (
                  <div key={idx} className="border-b border-line-100 pb-3 last:border-0 last:pb-0">
                    <div className="font-semibold text-ink-900">{rule.title}</div>
                    <div className="mt-0.5 text-xs leading-relaxed text-ink-600">
                      {rule.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 2. Chính sách Học bổng */}
      <Section variant="default">
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-navy-200 bg-navy-50 px-3 py-1 text-xs font-semibold tracking-wider text-navy-900 uppercase">
              Đồng hành cùng học viên
            </div>
            <SectionHeading align="center">Chính sách Học bổng năm 2026</SectionHeading>
            <p className="mt-3 text-body-lg text-ink-600">
              Quỹ học bổng khuyến học Topica và Trường Đại học Phú Xuân đồng hành tiếp bước tri
              thức, tạo điều kiện thuận lợi nhất cho học viên phát triển toàn diện.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
            {scholarships.map((scholarship) => (
              <div
                key={scholarship.id}
                className={`relative flex h-full flex-col overflow-hidden rounded-xl border bg-paper p-6 lg:p-8 ${
                  scholarship.highlight
                    ? "border-gold-500 shadow-md ring-1 ring-gold-500/20"
                    : "border-line-200"
                }`}
              >
                {scholarship.tag && (
                  <div
                    className={`absolute top-0 right-0 rounded-bl-lg px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${
                      scholarship.highlight
                        ? "bg-gold-500 text-navy-950"
                        : "bg-ink-100 text-ink-700"
                    }`}
                  >
                    {scholarship.tag}
                  </div>
                )}
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-navy-50">
                  <span className="text-lg font-bold text-navy-900">{scholarship.percentage}</span>
                </div>
                <h3 className="text-h4 mb-2 font-bold text-ink-950">{scholarship.title}</h3>
                <p className="mb-4 text-body-sm leading-relaxed text-ink-700">
                  {scholarship.description}
                </p>
                <div className="mt-auto border-t border-line-200 pt-4 text-xs text-ink-600">
                  <strong className="text-ink-800">Điều kiện:</strong> {scholarship.criteria}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 3. Tài liệu tham khảo và Biểu mẫu */}
      <Section variant="paper">
        <Container>
          <div className="mx-auto max-w-3xl">
            <SectionHeading align="center">Tài liệu và Biểu mẫu chính thức</SectionHeading>
            <p className="mt-2 mb-8 text-center text-body-sm text-ink-600">
              Đối chiếu nguồn công bố và tài liệu áp dụng cho hồ sơ của bạn.
            </p>
            <div className="space-y-4">
              {documents.map((document) => (
                <DocumentCard
                  key={document.id}
                  title={document.title}
                  type={document.type}
                  date={document.publishedDate}
                  viewUrl={document.viewUrl}
                  downloadUrl={document.fileUrl}
                  fileSize={`${new Intl.NumberFormat("vi-VN").format(document.byteSize)} byte`}
                />
              ))}
              {!documents.length && (
                <p className="text-ink-700">
                  Tài liệu biểu phí chi tiết đang được cập nhật.{" "}
                  <Link href="/lien-he/" className="font-semibold text-navy-800 underline">
                    Liên hệ ban tuyển sinh để nhận tài liệu theo hồ sơ.
                  </Link>
                </p>
              )}
              <a
                className="inline-block font-semibold text-navy-800 underline"
                href="https://topicauni.edu.vn/hoc-phi/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Xem nguồn học phí và ưu đãi trên website Topica (mở tab mới)
              </a>
            </div>
          </div>
        </Container>
      </Section>

      {/* 4. Banner kêu gọi hành động */}
      <AdmissionBanner
        heading="Bạn cần bảng dự toán chi phí chi tiết theo ngành?"
        description="Đội ngũ chuyên viên tư vấn tuyển sinh sẵn sàng hỗ trợ bạn tính toán học phí theo từng học kỳ và chính sách học bổng áp dụng."
        primaryHref="https://www.tuyensinh.topicauni.edu.vn/"
        primaryLabel="Đăng ký xét tuyển"
        secondaryHref="/lien-he/"
        secondaryLabel="Nhận tư vấn học phí"
      />
    </div>
  );
}
