import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AdmissionBanner } from "@/components/cta/AdmissionBanner";
import { DocumentCard } from "@/components/ui/DocumentCard";
import { Check, ShieldCheck, CreditCard, Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  OFFICIAL_TUITION_PROGRAMS,
  ADMISSION_FEES,
  SCHOLARSHIPS,
  TUITION_COMMITMENTS,
} from "@/data/tuition";

function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export function TuitionHub() {
  return (
    <div className="space-y-0">
      {/* 1. Tổng quan & Biểu phí 5 ngành đào tạo */}
      <Section variant="paper">
        <Container>
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold uppercase tracking-wider mb-3">
              Khóa tuyển sinh năm 2026
            </div>
            <SectionHeading>Học phí 5 ngành đào tạo chính thức</SectionHeading>
            <p className="text-body-lg text-ink-700 mt-4">
              Chương trình đào tạo đại học do <strong>Trường Đại học Phú Xuân</strong> cấp bằng, hợp tác triển khai cùng <strong>Viện Đào tạo Quốc tế Topica</strong>. Học phí thu theo số tín chỉ thực tế sinh viên đăng ký trong từng học kỳ (toàn khóa gồm 9 học kỳ, 126 tín chỉ tích lũy).
            </p>
          </div>

          {/* Bảng học phí chi tiết 5 ngành */}
          <div className="bg-canvas rounded-2xl border border-line-200 shadow-sm overflow-hidden mb-12">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-ink-900 text-white text-sm uppercase tracking-wider">
                    <th className="py-4 px-6 font-semibold">Ngành đào tạo</th>
                    <th className="py-4 px-4 font-semibold text-center">Mã ngành</th>
                    <th className="py-4 px-4 font-semibold text-center">Tín chỉ</th>
                    <th className="py-4 px-4 font-semibold text-right">Đơn giá / tín chỉ</th>
                    <th className="py-4 px-4 font-semibold text-right">Ước tính / học kỳ</th>
                    <th className="py-4 px-6 font-semibold text-right">Học phí toàn khóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-200 text-body-sm text-ink-900">
                  {OFFICIAL_TUITION_PROGRAMS.map((prog) => (
                    <tr key={prog.slug} className="hover:bg-brand-50/40 transition-colors">
                      <td className="py-4 px-6 font-semibold">
                        <Link
                          href={`/${prog.slug}/`}
                          className="hover:text-brand-700 transition-colors inline-flex items-center gap-1.5"
                        >
                          {prog.programName}
                          <ArrowRight className="w-3.5 h-3.5 text-brand-500 opacity-60" />
                        </Link>
                        {prog.note && (
                          <div className="text-xs text-ink-500 font-normal mt-0.5">{prog.note}</div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-xs text-ink-600">
                        {prog.majorCode}
                      </td>
                      <td className="py-4 px-4 text-center font-medium">
                        {prog.credits} TC
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-brand-800">
                        {formatVND(prog.pricePerCredit)}
                      </td>
                      <td className="py-4 px-4 text-right text-ink-700">
                        ~{formatVND(prog.tuitionPerSemester)}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-ink-950">
                        {formatVND(prog.totalTuition)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-paper p-4 lg:p-6 border-t border-line-200 text-xs text-ink-600 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                * Học phí trên tính theo chuẩn 126 tín chỉ tích lũy (không tính học phần không tích lũy GDTC và GDQP&AN). Học phí được đóng theo từng kỳ học (khoảng 14 tín chỉ/học kỳ).
              </div>
              <div className="font-semibold text-ink-800 shrink-0">
                Văn bằng: Cử nhân chính quy Phú Xuân
              </div>
            </div>
          </div>

          {/* Lệ phí nhập học và các cam kết */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="bg-canvas p-6 lg:p-8 rounded-xl border border-line-200 shadow-sm">
              <h3 className="text-h4 font-display font-bold text-ink-950 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-600" />
                Các khoản phí khi nhập học
              </h3>
              <ul className="space-y-3 text-body-sm text-ink-800">
                <li className="flex items-start gap-2.5">
                  <Check className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Lệ phí xét tuyển & nhập học:</strong> {formatVND(ADMISSION_FEES.admissionFee)} (đóng 1 lần duy nhất khi trúng tuyển hoàn thiện hồ sơ).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Bảo hiểm y tế & khám sức khỏe:</strong> {ADMISSION_FEES.healthInsurance}.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Tài liệu & học liệu số:</strong> {ADMISSION_FEES.materialsFee}.
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-canvas p-6 lg:p-8 rounded-xl border border-line-200 shadow-sm">
              <h3 className="text-h4 font-display font-bold text-ink-950 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-600" />
                Cam kết minh bạch tài chính
              </h3>
              <div className="space-y-3 text-body-sm text-ink-700">
                {TUITION_COMMITMENTS.map((rule, idx) => (
                  <div key={idx} className="border-b border-line-100 last:border-0 pb-3 last:pb-0">
                    <div className="font-semibold text-ink-900">{rule.title}</div>
                    <div className="text-xs text-ink-600 mt-0.5 leading-relaxed">{rule.description}</div>
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
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold uppercase tracking-wider mb-3">
              Đồng hành cùng học viên
            </div>
            <SectionHeading align="center">Chính sách Học bổng năm 2026</SectionHeading>
            <p className="text-body-lg text-ink-600 mt-3">
              Quỹ học bổng khuyến học Topica và Trường Đại học Phú Xuân đồng hành tiếp bước tri thức, tạo điều kiện thuận lợi nhất cho học viên phát triển toàn diện.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {SCHOLARSHIPS.map((scholarship) => (
              <div
                key={scholarship.id}
                className={`bg-paper p-6 lg:p-8 rounded-xl border flex flex-col h-full relative overflow-hidden ${
                  scholarship.highlight
                    ? "border-brand-500 shadow-md ring-1 ring-brand-500/20"
                    : "border-line-200"
                }`}
              >
                {scholarship.tag && (
                  <div
                    className={`absolute top-0 right-0 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg ${
                      scholarship.highlight
                        ? "bg-brand-600 text-white"
                        : "bg-ink-100 text-ink-700"
                    }`}
                  >
                    {scholarship.tag}
                  </div>
                )}
                <div className="h-12 w-12 bg-brand-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-brand-800 font-bold text-lg">{scholarship.percentage}</span>
                </div>
                <h3 className="text-h4 font-bold text-ink-950 mb-2">{scholarship.title}</h3>
                <p className="text-ink-700 text-body-sm mb-4 leading-relaxed">{scholarship.description}</p>
                <div className="mt-auto pt-4 border-t border-line-200 text-xs text-ink-600">
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
          <div className="max-w-3xl mx-auto">
            <SectionHeading align="center">Tài liệu và Biểu mẫu chính thức</SectionHeading>
            <p className="text-center text-body-sm text-ink-600 mt-2 mb-8">
              Tải về các văn bản quy định và biểu mẫu đăng ký chế độ miễn giảm học phí cho năm học 2026.
            </p>
            <div className="space-y-4">
              <DocumentCard
                title="Quy định Học phí và Thu phí sinh viên 2026 — ĐH Phú Xuân"
                type="Quy định"
                date="Ban hành: 15/01/2026"
                fileSize="1.2 MB"
                downloadUrl="/tuyen-sinh/de-an-tuyen-sinh/"
              />
              <DocumentCard
                title="Hướng dẫn thanh toán học phí trực tuyến qua cổng Elearning"
                type="Hướng dẫn"
                date="Ban hành: 10/02/2026"
                fileSize="850 KB"
                viewUrl="/he-thong/"
                downloadUrl="/he-thong/"
              />
              <DocumentCard
                title="Biểu mẫu xin cấp Học bổng và Hỗ trợ tài chính"
                type="Biểu mẫu"
                date="Ban hành: 15/01/2026"
                fileSize="420 KB"
                downloadUrl="/bo-bieu-mau/"
              />
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
