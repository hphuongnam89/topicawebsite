import { AdmissionBanner } from "@/components/cta/AdmissionBanner";
import { Container } from "@/components/ui/Container";
import { DocumentCard } from "@/components/ui/DocumentCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Check } from "lucide-react";

const admissions2026Url = "https://topicauni.edu.vn/thong-tin-tuyen-sinh-nam-2026/";
const admissionsNoticeUrl =
  "https://topicauni.edu.vn/thong-bao-tuyen-sinh-dai-hoc-chinh-quy-hinh-thuc-tu-xa-pxuni-elearning-nam-2026-dot-2/";

const scholarships = [
  {
    rate: "30%",
    title: "Topica Talent",
    description:
      "Giảm 30% học phí toàn bộ chương trình. Nguồn 2026 công bố 500 suất, áp dụng cho sinh viên nhập học trước 31/12/2026 hoặc đến khi có thông báo khác.",
  },
  {
    rate: "20%",
    title: "Topica Leadership",
    description:
      "Giảm 20% học phí toàn bộ chương trình sau khi hết suất Talent; nguồn 2026 công bố 200 suất và thời hạn trước 31/01/2027.",
  },
  {
    rate: "40%",
    title: "Topica Cooperation",
    description:
      "Giảm 40% học phí toàn bộ chương trình cho người làm trong lĩnh vực giáo dục hoặc quản lý doanh nghiệp từ cấp phó phòng, có hồ sơ xác nhận.",
  },
  {
    rate: "5%",
    title: "Topica Future",
    description: "Giảm 5% tổng học phí khi nộp học phí toàn khóa ngay từ khi nhập học.",
  },
  {
    rate: "50%",
    title: "Chính sách dành cho tu sĩ",
    description: "Giảm 50% học phí toàn khóa theo chính sách tuyển sinh năm 2026.",
  },
] as const;

export function TuitionHub() {
  return (
    <div>
      <Section variant="paper">
        <Container>
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading>Học phí tuyển sinh năm 2026</SectionHeading>
              <div className="prose-editorial text-ink-800">
                <p>
                  Học phí được tính theo số tín chỉ đăng ký. Mức áp dụng cần được đối chiếu với
                  thông báo tuyển sinh tại thời điểm hoàn tất hồ sơ.
                </p>

                <h4 className="mt-8 mb-4 font-semibold text-ink-950">
                  Các khoản phí được công bố:
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
                    <span>Học phí: 600.000 đồng/tín chỉ.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
                    <span>Lệ phí xét tuyển: 80.000 đồng/nguyện vọng.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
                    <span>Lệ phí hồ sơ: miễn phí.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-line-200 bg-canvas p-6 shadow-sm lg:p-8">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-brand-50 opacity-50 blur-3xl" />
              <p className="relative z-10 text-body-sm font-semibold tracking-[0.12em] text-brand-700 uppercase">
                Theo thông tin tuyển sinh 2026
              </p>
              <div className="relative z-10 mt-4 text-[clamp(2.75rem,7vw,5rem)] leading-none font-bold text-brand-700">
                600.000đ
              </div>
              <p className="relative z-10 mt-2 text-body-lg font-semibold text-ink-950">
                mỗi tín chỉ
              </p>
              <p className="relative z-10 mt-6 border-t border-line-200 pt-5 text-body-sm text-ink-600">
                Lộ trình tăng học phí dự kiến không quá 10%/năm và thực hiện vào đầu học kỳ của năm
                học mới nếu có. Hãy xác nhận lại mức áp dụng cho khóa nhập học của bạn.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section variant="default">
        <Container>
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <SectionHeading align="center">Chính sách học bổng năm 2026</SectionHeading>
            <p className="text-body-lg text-ink-600">
              Mỗi chính sách có điều kiện và thời hạn riêng. Tình trạng suất học bổng cần được xác
              nhận tại thời điểm đăng ký.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {scholarships.map((scholarship) => (
              <article
                key={scholarship.title}
                className="flex h-full flex-col rounded-xl border border-line-200 bg-paper p-6 lg:p-8"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
                  <span className="text-lg font-bold text-brand-700">{scholarship.rate}</span>
                </div>
                <h3 className="text-h4 mb-3 font-bold text-ink-950">{scholarship.title}</h3>
                <p className="text-ink-600">{scholarship.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section variant="paper">
        <Container>
          <div className="mx-auto max-w-3xl">
            <SectionHeading align="center">Nguồn thông tin chính thức</SectionHeading>
            <p className="mt-3 text-center text-body text-ink-600">
              Đọc văn bản nguồn để kiểm tra điều kiện, thời hạn và phạm vi áp dụng trước khi đăng
              ký.
            </p>
            <div className="mt-8 space-y-4">
              <DocumentCard
                title="Thông tin tuyển sinh phương thức đào tạo từ xa năm 2026"
                type="Nguồn chính thức"
                date="Trường Đại học Phú Xuân"
                viewUrl={admissions2026Url}
              />
              <DocumentCard
                title="Thông báo tuyển sinh PXUni-Elearning năm 2026 – đợt 2"
                type="Thông báo tuyển sinh"
                date="Trường Đại học Phú Xuân"
                viewUrl={admissionsNoticeUrl}
              />
            </div>
          </div>
        </Container>
      </Section>

      <AdmissionBanner
        heading="Cần xác nhận mức phí theo hồ sơ của bạn?"
        description="Để lại thông tin để được tư vấn về số tín chỉ, học bổng và mức phí áp dụng cho đợt nhập học hiện hành."
        primaryHref="https://www.tuyensinh.topicauni.edu.vn/"
        primaryLabel="Đăng ký xét tuyển"
        secondaryHref="/lien-he/"
        secondaryLabel="Nhận tư vấn học phí"
      />
    </div>
  );
}
