import { cn } from "@/components/ui/cn";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { cms } from "@/lib/cms";
import type { CmsPage } from "@/lib/cms/types";
import { admissionSteps } from "@/data/admissions";
import { ProgramsSection } from "@/components/sections/ProgramsSection";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { AdmissionCTA } from "@/components/sections/AdmissionCTA";
import { QuickActionCard } from "./QuickActionCard";
import { AdmissionAnnouncementCard } from "./AdmissionAnnouncementCard";
import { GraduationCap, ClipboardList, FileText, Banknote, HelpCircle, Phone } from "lucide-react";

export interface AdmissionHubProps {
  page: CmsPage;
}

export async function AdmissionHub({ page }: AdmissionHubProps) {
  // Fetch latest admission news
  const admissionNews = await cms.getArticles({
    category: "tin-tuc-tuyen-sinh",
    limit: 4,
  });

  // Common admission FAQs
  const faqData = [
    {
      question: "Topica xét tuyển bằng những phương thức nào?",
      answer:
        "Topica xét tuyển thông qua 3 phương thức chính: Xét tuyển thẳng, Xét tuyển dựa trên kết quả thi THPT Quốc gia, và Xét tuyển học bạ THPT.",
    },
    {
      question: "Hồ sơ xét tuyển trực tuyến cần chuẩn bị những gì?",
      answer:
        "Hồ sơ trực tuyến bao gồm: Ảnh chụp học bạ (nếu xét học bạ), ảnh chụp CMND/CCCD, và giấy chứng nhận tốt nghiệp tạm thời (có thể bổ sung sau).",
    },
    {
      question: "Topica có các chương trình học bổng nào cho tân sinh viên?",
      answer:
        "Topica có nhiều loại học bổng cho tân sinh viên, bao gồm Học bổng Tài năng, Học bổng Khuyến học, và Học bổng Hỗ trợ tài chính. Giá trị học bổng có thể lên tới 100% học phí toàn khóa.",
    },
    {
      question: "Thời gian nhận hồ sơ xét tuyển là khi nào?",
      answer:
        "Topica tổ chức nhiều đợt xét tuyển trong năm. Đợt 1 thường bắt đầu từ tháng 3 và kết thúc vào tháng 5. Bạn nên theo dõi thông báo trên website để cập nhật lịch chi tiết.",
    },
    {
      question: "Học phí tại Topica được đóng như thế nào?",
      answer:
        "Học phí được đóng theo từng kỳ học (2 kỳ/năm). Sinh viên có thể chọn đóng qua chuyển khoản ngân hàng hoặc qua cổng thanh toán trực tuyến của trường.",
    },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-ink-950 pt-24 pb-16 md:pt-32 md:pb-24">
        <Container className="relative z-10">
          <div className="max-w-measure mx-auto text-center">
            <span className="text-brand-400 mb-4 inline-block rounded-full border border-brand-500/30 px-3 py-1 text-xs font-semibold tracking-wider uppercase">
              Năm học 2026-2027
            </span>
            <h1 className="mb-6 font-display text-display text-white md:text-[4rem]">Tuyển sinh</h1>
            <p className="text-ink-200 mx-auto mb-10 max-w-2xl text-body-lg">
              {page.excerpt ||
                "Khám phá các chương trình đào tạo chất lượng cao tại Topica. Chúng tôi chào đón những sinh viên đam mê học hỏi, sẵn sàng kiến tạo tương lai."}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <ButtonLink
                href="https://www.tuyensinh.topicauni.edu.vn/"
                variant="primary"
                size="lg"
              >
                Đăng ký xét tuyển
              </ButtonLink>
              <ButtonLink
                href="/lien-he/"
                variant="secondary"
                size="lg"
                className="border-line-600 text-white hover:bg-white/10"
              >
                Nhận tư vấn
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      {/* Quick Actions Grid */}
      <Section className="bg-canvas">
        <Container>
          <div className="relative z-20 -mt-8 grid grid-cols-1 gap-6 md:-mt-12 md:grid-cols-2 lg:grid-cols-3">
            <QuickActionCard
              icon={<GraduationCap size={24} />}
              title="Ngành đào tạo"
              description="Khám phá các chương trình đại học chính quy."
              href="/nganh-dao-tao/"
            />
            <QuickActionCard
              icon={<ClipboardList size={24} />}
              title="Phương thức xét tuyển"
              description="Các hình thức và điều kiện tuyển sinh năm 2026."
              href="/thong-tin-tuyen-sinh-nam-2026/"
            />
            <QuickActionCard
              icon={<FileText size={24} />}
              title="Hồ sơ xét tuyển"
              description="Hướng dẫn chuẩn bị và nộp hồ sơ trực tuyến."
              href="/tuyen-sinh/xet-tuyen-truc-tuyen/"
            />
            <QuickActionCard
              icon={<Banknote size={24} />}
              title="Học phí & Học bổng"
              description="Thông tin học phí và chính sách hỗ trợ tài chính."
              href="/tuyen-sinh/hoc-phi-hoc-bong/"
            />
            <QuickActionCard
              icon={<HelpCircle size={24} />}
              title="Câu hỏi thường gặp"
              description="Giải đáp các thắc mắc về quá trình tuyển sinh."
              href="/nhung-cau-hoi-thuong-gap/"
            />
            <QuickActionCard
              icon={<Phone size={24} />}
              title="Liên hệ tư vấn"
              description="Kết nối với đội ngũ tư vấn tuyển sinh Topica."
              href="/lien-he/"
            />
          </div>
        </Container>
      </Section>

      {/* Latest Admission News */}
      <Section className="bg-paper">
        <Container>
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <SectionHeading className="mb-0">Tin tuyển sinh mới nhất</SectionHeading>
            <ButtonLink href="/tin-tuc-tuyen-sinh/" variant="secondary" size="sm">
              Xem tất cả
            </ButtonLink>
          </div>

          {admissionNews.articles.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {admissionNews.articles.map((article) => (
                <AdmissionAnnouncementCard
                  key={article.id}
                  title={article.title}
                  href={`/tin-tuc-tuyen-sinh/${article.slug}`}
                  date={new Date(article.publishedAt).toLocaleDateString("vi-VN")}
                  summary={article.excerpt}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-line-200 bg-canvas py-12 text-center text-ink-600">
              Hiện chưa có tin tức tuyển sinh mới.
            </div>
          )}
        </Container>
      </Section>

      {/* Admission Timeline */}
      <Section className="border-y border-line-100 bg-canvas">
        <Container>
          <SectionHeading align="center">Quy trình xét tuyển</SectionHeading>
          <div className="mx-auto mt-12 max-w-4xl">
            <div className="relative">
              {/* Desktop timeline line */}
              <div className="absolute top-6 right-0 left-0 hidden h-0.5 bg-line-200 md:block" />
              {/* Mobile timeline line */}
              <div className="absolute top-0 bottom-0 left-[23px] w-0.5 bg-line-200 md:hidden" />

              <div className="relative flex flex-col gap-8 md:flex-row md:gap-4">
                {admissionSteps?.map((step, index) => (
                  <div
                    key={index}
                    className="relative flex flex-1 flex-row items-start gap-6 md:flex-col md:items-center md:gap-4"
                  >
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-canvas bg-brand-600 text-lg font-bold text-white">
                      {index + 1}
                    </div>
                    <div className="pt-2 md:pt-0 md:text-center">
                      <h4 className="text-h4 mb-2 text-ink-950">{step.title}</h4>
                      <p className="text-body-sm text-ink-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Programs Preview */}
      <ProgramsSection />

      {/* FAQ Preview */}
      <Section className="bg-canvas">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <SectionHeading align="center" className="mb-4">
                Câu hỏi thường gặp
              </SectionHeading>
              <p className="text-ink-600">
                Những thắc mắc phổ biến của thí sinh và phụ huynh về kỳ tuyển sinh.
              </p>
            </div>

            <FAQAccordion faqs={faqData} />

            <div className="mt-8 text-center">
              <ButtonLink href="/nhung-cau-hoi-thuong-gap/" variant="secondary">
                Xem tất cả câu hỏi
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>

      {/* Final CTA */}
      <AdmissionCTA />
    </main>
  );
}
