import { LocalizedText } from "@/components/i18n/LocalizedText";
import { LocalizedElement } from "@/components/i18n/LocalizedElement";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AdmissionBanner } from "@/components/cta/AdmissionBanner";
import Image from "@/components/i18n/LocalizedImage";
import {
  Check,
  ShieldCheck,
  CreditCard,
  Award,
  ArrowRight,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Link from "@/components/i18n/LocalizedLink";
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

function formatDocumentDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
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
              <LocalizedText>Khóa tuyển sinh năm 2026
            </LocalizedText></div>
            <SectionHeading><LocalizedText>Học phí theo chương trình và đối tượng</LocalizedText></SectionHeading>
            <p className="mt-4 text-body-lg text-ink-700">
              <LocalizedText>Chương trình đào tạo đại học do </LocalizedText><strong><LocalizedText>Trường Đại học Phú Xuân</LocalizedText></strong> <LocalizedText>cấp bằng, hợp
              tác triển khai cùng </LocalizedText><strong><LocalizedText>Viện Đào tạo Quốc tế Topica</LocalizedText></strong><LocalizedText>. Học phí thu theo số
              tín chỉ thực tế sinh viên đăng ký. Lộ trình và số tín chỉ còn lại phụ thuộc ngành, đối
              tượng và kết quả xét công nhận học phần.
            </LocalizedText></p>
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
                      <LocalizedText>{prog.programName}</LocalizedText>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-navy-700" />
                    </Link>
                    <LocalizedText>{prog.note && <div className="mt-0.5 text-xs text-ink-500"><LocalizedText>{prog.note}</LocalizedText></div>}</LocalizedText>
                  </div>
                  <span className="shrink-0 rounded bg-line-100 px-2 py-0.5 font-mono text-xs font-semibold text-ink-700">
                    <LocalizedText>{prog.majorCode}</LocalizedText>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-body-sm">
                  <div>
                    <span className="block text-xs text-ink-500"><LocalizedText>Đơn giá / tín chỉ</LocalizedText></span>
                    <span className="font-semibold text-navy-900">
                      <LocalizedText>{formatVND(prog.pricePerCredit)}</LocalizedText>
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-ink-500"><LocalizedText>Ước tính / học kỳ</LocalizedText></span>
                    <span className="font-medium text-ink-800">
                      <LocalizedText>~</LocalizedText><LocalizedText>{formatVND(prog.tuitionPerSemester)}</LocalizedText>
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-ink-500"><LocalizedText>Tín chỉ tích lũy</LocalizedText></span>
                    <span className="font-medium text-ink-700">{prog.credits} <LocalizedText>TC</LocalizedText></span>
                  </div>
                  <div>
                    <span className="block text-xs text-ink-500"><LocalizedText>Học phí toàn khóa</LocalizedText></span>
                    <span className="font-bold text-ink-950"><LocalizedText>{formatVND(prog.totalTuition)}</LocalizedText></span>
                  </div>
                </div>
              </div>
            ))}
            <div className="space-y-1 rounded-lg border border-line-200 bg-paper p-4 text-xs text-ink-600">
              <div>
                <LocalizedText>* Ước tính theo tín chỉ trong từng chính sách. Chi phí thực tế được xác nhận theo hồ
                sơ và đăng ký học phần.
              </LocalizedText></div>
              <div className="font-semibold text-ink-800">
                <LocalizedText>Văn bằng: Bằng Cử nhân do Trường Đại học Phú Xuân cấp
              </LocalizedText></div>
            </div>
          </div>

          {/* Desktop view: Bảng học phí chi tiết 5 ngành */}
          <div className="mb-12 hidden overflow-hidden rounded-2xl border border-line-200 bg-canvas shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-ink-900 text-sm tracking-wider text-white uppercase">
                    <th className="px-6 py-4 font-semibold"><LocalizedText>Ngành đào tạo</LocalizedText></th>
                    <th className="px-4 py-4 text-center font-semibold"><LocalizedText>Mã ngành</LocalizedText></th>
                    <th className="px-4 py-4 text-center font-semibold"><LocalizedText>Tín chỉ</LocalizedText></th>
                    <th className="px-4 py-4 text-right font-semibold"><LocalizedText>Đơn giá / tín chỉ</LocalizedText></th>
                    <th className="px-4 py-4 text-right font-semibold"><LocalizedText>Ước tính / học kỳ</LocalizedText></th>
                    <th className="px-6 py-4 text-right font-semibold"><LocalizedText>Học phí toàn khóa</LocalizedText></th>
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
                          <LocalizedText>{prog.programName}</LocalizedText>
                          <ArrowRight className="h-3.5 w-3.5 text-navy-700 opacity-60" />
                        </Link>
                        <LocalizedText>{prog.note && (
                          <div className="mt-0.5 text-xs font-normal text-ink-500"><LocalizedText>{prog.note}</LocalizedText></div>
                        )}</LocalizedText>
                      </td>
                      <td className="px-4 py-4 text-center font-mono text-xs text-ink-600">
                        <LocalizedText>{prog.majorCode}</LocalizedText>
                      </td>
                      <td className="px-4 py-4 text-center font-medium">{prog.credits} <LocalizedText>TC</LocalizedText></td>
                      <td className="px-4 py-4 text-right font-semibold text-navy-900">
                        <LocalizedText>{formatVND(prog.pricePerCredit)}</LocalizedText>
                      </td>
                      <td className="px-4 py-4 text-right text-ink-700">
                        <LocalizedText>~</LocalizedText><LocalizedText>{formatVND(prog.tuitionPerSemester)}</LocalizedText>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-ink-950">
                        <LocalizedText>{formatVND(prog.totalTuition)}</LocalizedText>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col justify-between gap-3 border-t border-line-200 bg-paper p-4 text-xs text-ink-600 md:flex-row md:items-center lg:p-6">
              <div>
                <LocalizedText>* Tổng và ước tính mỗi kỳ dựa trên tín chỉ trong chính sách đang hiển thị. Các khoản
                ngoài học phí và tín chỉ được công nhận cần xác nhận theo hồ sơ.
              </LocalizedText></div>
              <div className="shrink-0 font-semibold text-ink-800">
                <LocalizedText>Văn bằng: Bằng Cử nhân do Trường Đại học Phú Xuân cấp
              </LocalizedText></div>
            </div>
          </div>

          {/* Lệ phí nhập học và các cam kết */}
          <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2">
            <div className="flex h-full flex-col rounded-xl border border-line-200 bg-canvas p-6 shadow-sm lg:p-8">
              <h3 className="text-h4 mb-4 flex items-center gap-2 font-display font-bold text-ink-950">
                <CreditCard className="h-5 w-5 text-navy-800" />
                <LocalizedText>Các khoản phí khi nhập học
              </LocalizedText></h3>
              <ul className="space-y-3 text-body-sm text-ink-800">
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <span>
                    <strong><LocalizedText>Lệ phí xét tuyển:</LocalizedText></strong> <LocalizedText>{formatVND(ADMISSION_FEES.admissionFee)}</LocalizedText><LocalizedText>/hồ
                    sơ, lệ phí hồ sơ miễn phí theo thông báo tuyển sinh 2026 đợt 2. Xác nhận mức áp
                    dụng cho đợt hiện tại trước khi nộp.
                  </LocalizedText></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <span>
                    <strong><LocalizedText>Bảo hiểm y tế & khám sức khỏe:</LocalizedText></strong> <LocalizedText>{ADMISSION_FEES.healthInsurance}</LocalizedText>
                    <LocalizedText>.
                  </LocalizedText></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <span>
                    <strong><LocalizedText>Tài liệu & học liệu số:</LocalizedText></strong> <LocalizedText>{ADMISSION_FEES.materialsFee}</LocalizedText><LocalizedText>.
                  </LocalizedText></span>
                </li>
              </ul>
            </div>

            <div className="flex h-full flex-col rounded-xl border border-line-200 bg-canvas p-6 shadow-sm lg:p-8">
              <h3 className="text-h4 mb-4 flex items-center gap-2 font-display font-bold text-ink-950">
                <ShieldCheck className="h-5 w-5 text-navy-800" />
                <LocalizedText>Cam kết minh bạch tài chính
              </LocalizedText></h3>
              <div className="space-y-3 text-body-sm text-ink-700">
                {TUITION_COMMITMENTS.map((rule, idx) => (
                  <div key={idx} className="border-b border-line-100 pb-3 last:border-0 last:pb-0">
                    <div className="font-semibold text-ink-900"><LocalizedText>{rule.title}</LocalizedText></div>
                    <div className="mt-0.5 text-xs leading-relaxed text-ink-600">
                      <LocalizedText>{rule.description}</LocalizedText>
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
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#f3f6fa] px-5 py-12 sm:px-8 sm:py-16 lg:px-14 lg:py-20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-32 right-[-5rem] -z-10 h-96 w-96 rounded-full bg-[#dce8f3] blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-40 left-[-6rem] -z-10 h-96 w-96 rounded-full bg-[#f4e8d3] blur-3xl"
            />
            <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white/80 px-4 py-2 text-xs font-bold tracking-[0.14em] text-navy-900 uppercase shadow-sm">
                <Sparkles aria-hidden="true" className="h-4 w-4 text-[#b78744]" />
                <LocalizedText>Cơ hội học tập 2026
              </LocalizedText></div>
              <SectionHeading align="center"><LocalizedText>Chính sách học bổng</LocalizedText></SectionHeading>
              <p className="mx-auto mt-4 max-w-2xl text-body-lg leading-relaxed text-ink-600">
                <LocalizedText>Chọn ưu đãi phù hợp với thời điểm nộp hồ sơ và kế hoạch học tập của bạn.
              </LocalizedText></p>
              <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-sm font-semibold text-navy-900 shadow-sm">
                <UsersRound aria-hidden="true" className="h-4 w-4" /><LocalizedText>4 chương trình đồng hành
              </LocalizedText></div>
            </div>

            <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-5 sm:grid-cols-2 sm:gap-6 lg:gap-7">
              {scholarships.map((scholarship) => {
                const isSpecial = scholarship.id === "religious";
                const isFuture = scholarship.id === "future";
                const isTalent = scholarship.id === "talent";
                return (
                  <article
                    key={scholarship.id}
                    className={`group relative flex min-h-[310px] flex-col overflow-hidden rounded-2xl border p-6 shadow-[0_12px_36px_-24px_rgba(0,38,77,0.38)] transition duration-300 ease-out focus-within:ring-2 focus-within:ring-[#b78744] hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(0,38,77,0.42)] sm:p-8 ${
                      isSpecial
                        ? "border-[#365679] bg-[#00264d] text-white"
                        : "border-white/90 bg-white/90 text-ink-950 backdrop-blur-sm"
                    }`}
                  >
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute -top-12 -right-10 h-40 w-40 rounded-full blur-2xl transition duration-500 group-hover:scale-125 ${isSpecial ? "bg-[#b78744]/25" : "bg-[#dce8f3]/70"}`}
                    />
                    <div className="relative flex items-start justify-between gap-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${isSpecial ? "bg-white/10 text-[#f4d99e] ring-1 ring-white/15" : "bg-[#f3f6fa] text-navy-900"}`}
                      >
                        {isSpecial ? (
                          <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                        ) : (
                          <Award aria-hidden="true" className="h-3.5 w-3.5 text-[#b78744]" />
                        )}
                        <LocalizedText>{scholarship.tag || "Học bổng Topica"}</LocalizedText>
                      </span>
                      <span
                        className={`font-display text-5xl leading-none font-bold tracking-tight sm:text-6xl ${isSpecial ? "text-[#f4d99e]" : "text-navy-900"}`}
                      >
                        <LocalizedText>{scholarship.percentage}</LocalizedText>
                      </span>
                    </div>
                    <div className="relative mt-7">
                      <h3
                        className={`font-display text-2xl font-bold tracking-tight sm:text-[1.7rem] ${isSpecial ? "text-white" : "text-navy-950"}`}
                      >
                        <LocalizedText>{scholarship.title}</LocalizedText>
                      </h3>
                      <p
                        className={`mt-3 max-w-xl text-base leading-relaxed ${isSpecial ? "text-white/80" : "text-ink-700"}`}
                      >
                        <LocalizedText>{scholarship.description}</LocalizedText>
                      </p>
                    </div>
                    <div
                      className={`relative mt-auto pt-6 ${isSpecial ? "text-white/75" : "text-ink-600"}`}
                    >
                      <div
                        className={`mb-4 h-px w-full ${isSpecial ? "bg-white/15" : "bg-[#e8e2d8]"}`}
                      />
                      <div className="flex items-start gap-3 text-sm leading-relaxed">
                        <Check
                          aria-hidden="true"
                          className={`mt-0.5 h-4 w-4 shrink-0 ${isSpecial ? "text-[#f4d99e]" : "text-emerald-700"}`}
                        />
                        <p>
                          <span
                            className={`font-bold ${isSpecial ? "text-white" : "text-ink-900"}`}
                          >
                            <LocalizedText>{isFuture
                              ? "Điều kiện nhận ưu đãi"
                              : isSpecial
                                ? "Thông tin chi tiết"
                                : isTalent
                                  ? "Số lượng & thứ tự"
                                  : "Thứ tự xét"}</LocalizedText>
                            <LocalizedText>:
                          </LocalizedText></span><LocalizedText>{" "}</LocalizedText>
                          <LocalizedText>{scholarship.criteria}</LocalizedText>
                        </p>
                      </div>
                      {isSpecial && (
                        <Link
                          href="/lien-he/"
                          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f4d99e] px-5 py-2.5 text-sm font-bold text-[#00264d] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                          <LocalizedText>Liên hệ tư vấn</LocalizedText><LocalizedText>{" "}</LocalizedText>
                          <ArrowRight
                            aria-hidden="true"
                            className="h-4 w-4 transition-transform group-hover:translate-x-1"
                          />
                        </Link>
                      )}
                    </div>
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-[#b78744] transition-transform duration-300 group-hover:scale-x-100"
                    />
                  </article>
                );
              })}
            </div>
            <p className="mx-auto mt-7 max-w-6xl text-center text-xs leading-relaxed text-ink-600 sm:text-sm">
              <LocalizedText>Chi tiết áp dụng và số suất còn lại được xác nhận khi tư vấn hồ sơ.
            </LocalizedText></p>
          </div>
        </Container>
      </Section>

      {/* 3. Tài liệu tham khảo và Biểu mẫu */}
      <Section variant="paper">
        <Container>
          <div className="mx-auto max-w-6xl">
            <SectionHeading align="center"><LocalizedText>Tài liệu và Biểu mẫu chính thức</LocalizedText></SectionHeading>
            <p className="mt-2 mb-8 text-center text-body-sm text-ink-600">
              <LocalizedText>Đối chiếu nguồn công bố và tài liệu áp dụng cho hồ sơ của bạn.
            </LocalizedText></p>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {documents.map((document) => (
                <figure
                  key={document.id}
                  className="overflow-hidden rounded-xl border border-line-200 bg-white shadow-sm"
                >
                  <figcaption className="border-b border-line-200 px-4 py-3 sm:px-5">
                    <h3 className="font-display text-base font-bold text-ink-950 sm:text-lg">
                      <LocalizedText>{document.title}</LocalizedText>
                    </h3>
                    <p className="mt-1 text-xs text-ink-600 sm:text-sm">
                      <LocalizedText>{document.type === "license" ? "Biểu mẫu chính thức" : document.type}</LocalizedText> <LocalizedText>· Ban hành ngày </LocalizedText><LocalizedText>{formatDocumentDate(document.publishedDate)}</LocalizedText>
                    </p>
                  </figcaption>
                  <div className="bg-paper p-2 sm:p-4">
                    {document.mimeType.startsWith("image/") ? (
                      <Image
                        src={document.fileUrl}
                        alt={document.title}
                        width={1254}
                        height={1254}
                        sizes="(max-width: 768px) 100vw, 384px"
                        className="mx-auto h-[18rem] w-full max-w-96 object-contain sm:h-[22rem]"
                      />
                    ) : document.mimeType === "application/pdf" ? (
                      <LocalizedElement as="iframe"
                        src={`${document.fileUrl}#toolbar=0&navpanes=0`}
                        title={document.title}
                        className="h-[75vh] min-h-[36rem] w-full rounded-lg border-0 bg-white"
                      />
                    ) : (
                      <p className="p-4 text-sm text-ink-600">
                        <LocalizedText>Không thể hiển thị trực tiếp định dạng tài liệu này trên trình duyệt.
                      </LocalizedText></p>
                    )}
                  </div>
                </figure>
              ))}
              {!documents.length && (
                <p className="text-ink-700">
                  <LocalizedText>Tài liệu biểu phí chi tiết đang được cập nhật.</LocalizedText><LocalizedText>{" "}</LocalizedText>
                  <Link href="/lien-he/" className="font-semibold text-navy-800 underline">
                    <LocalizedText>Liên hệ ban tuyển sinh để nhận tài liệu theo hồ sơ.
                  </LocalizedText></Link>
                </p>
              )}
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
