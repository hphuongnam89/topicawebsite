import { LocalizedText } from "@/components/i18n/LocalizedText";
import { cn } from "@/components/ui/cn";
import Link from "@/components/i18n/LocalizedLink";
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
import { formatDateVN } from "@/lib/date";
import { getLivePrograms } from "@/lib/services/public-site";
import { getPublicAdmissionRounds } from "@/lib/services/cms-models";

export interface AdmissionHubProps {
  page: Pick<CmsPage, "excerpt">;
}

export async function AdmissionHub({ page }: AdmissionHubProps) {
  // Fetch latest admission news
  const admissionNews = await cms
    .getArticles({
      category: "tin-tuc-tuyen-sinh",
      limit: 4,
    })
    .catch(() => ({ articles: [], total: 0 }));
  const articles = admissionNews?.articles || [];
  const rounds = getPublicAdmissionRounds();

  // Common admission FAQs
  const faqData = [
    {
      question: "Topica xét tuyển bằng những phương thức nào?",
      answer:
        "Phương thức và điều kiện xét tuyển phụ thuộc đối tượng và kỳ tuyển sinh. Xem thông báo đang áp dụng hoặc trao đổi với bộ phận tuyển sinh để xác định hồ sơ phù hợp.",
    },
    {
      question: "Hồ sơ xét tuyển trực tuyến cần chuẩn bị những gì?",
      answer:
        "Hồ sơ trực tuyến bao gồm: Ảnh chụp học bạ (nếu xét học bạ), ảnh chụp CMND/CCCD, và giấy chứng nhận tốt nghiệp tạm thời (có thể bổ sung sau).",
    },
    {
      question: "Topica có các chương trình học bổng nào cho tân sinh viên?",
      answer:
        "Xem mục Học phí & Học bổng để đối chiếu quyền lợi, đối tượng và thời hạn. Bộ phận tuyển sinh xác nhận suất và điều kiện áp dụng cho hồ sơ của bạn.",
    },
    {
      question: "Thời gian nhận hồ sơ xét tuyển là khi nào?",
      answer:
        "Thời hạn được ghi trong thông báo của từng kỳ. Khi chưa có kỳ đang mở được công bố ở đây, bạn có thể nhận tư vấn để xác nhận lịch tiếp theo.",
    },
    {
      question: "Học phí tại Topica được đóng như thế nào?",
      answer:
        "Học phí tính theo số tín chỉ và chính sách áp dụng cho khóa, đối tượng. Xem bảng học phí và đề nghị dự toán sau khi xác nhận tín chỉ được công nhận; các ưu đãi cần đáp ứng điều kiện.",
    },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-navy-950 pt-24 pb-16 md:pt-32 md:pb-24">
        <Container className="relative z-10">
          <div className="max-w-measure mx-auto text-center">
            <span className="mb-4 inline-block rounded-full border border-gold-400/40 bg-navy-900/60 px-3.5 py-1 text-xs font-semibold tracking-wider text-gold-300 uppercase backdrop-blur-xs">
              <LocalizedText>Năm học 2026-2027</LocalizedText>
            </span>
            <h1 className="mb-6 font-display text-display text-white md:text-[4rem]">
              <LocalizedText>Tuyển sinh</LocalizedText>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-body-lg text-white/80">
              <LocalizedText>
                {page.excerpt ||
                  "Khám phá các chương trình đào tạo chất lượng cao tại Topica. Chúng tôi chào đón những sinh viên đam mê học hỏi, sẵn sàng kiến tạo tương lai."}
              </LocalizedText>
            </p>
            <div className="mx-auto grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
              <ButtonLink
                href="https://www.tuyensinh.topicauni.edu.vn/"
                variant="accent"
                size="lg"
                external
                className="w-full justify-center"
              >
                <LocalizedText>Đăng ký xét tuyển</LocalizedText>
              </ButtonLink>
              <ButtonLink
                href="/lien-he/"
                variant="secondary"
                size="lg"
                className="w-full justify-center border-white/30 text-white hover:bg-white/10"
              >
                <LocalizedText>Nhận tư vấn</LocalizedText>
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
              description="Khám phá 5 chương trình cử nhân đào tạo từ xa."
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

      <Section className="bg-canvas">
        <Container>
          <SectionHeading>
            <LocalizedText>Kỳ tuyển sinh</LocalizedText>
          </SectionHeading>
          {rounds.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {rounds.map((round) => (
                <article
                  key={round.id}
                  className="rounded-xl border border-line-200 bg-canvas p-5 shadow-2xs"
                >
                  <h3 className="text-h4 font-bold text-navy-950">
                    <LocalizedText>{round.name}</LocalizedText>
                  </h3>
                  <p className="mt-2 text-ink-700">
                    <LocalizedText>
                      {round.status === "open"
                        ? "Đang nhận hồ sơ"
                        : round.status === "planned"
                          ? "Chưa mở nhận hồ sơ"
                          : "Đã đóng nhận hồ sơ"}
                    </LocalizedText>
                  </p>
                  <p className="mt-2 text-ink-700">
                    <LocalizedText>Hạn hồ sơ: </LocalizedText>
                    <LocalizedText>{formatDateVN(round.deadlineAt)}</LocalizedText>
                  </p>
                  <ButtonLink
                    className="mt-4"
                    href={round.status === "open" ? round.applicationUrl : "/lien-he/"}
                    external={
                      round.status === "open" && round.applicationUrl.startsWith("https://")
                    }
                  >
                    <LocalizedText>
                      {round.status === "open"
                        ? "Xem hướng dẫn nộp hồ sơ"
                        : "Nhận tư vấn kỳ tuyển sinh"}
                    </LocalizedText>
                  </ButtonLink>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-4 rounded-xl border border-line-200 bg-surface-subtle/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="text-ink-700">
                <p className="font-semibold text-navy-950">
                  <LocalizedText>Kế hoạch tiếp nhận hồ sơ năm 2026</LocalizedText>
                </p>
                <p className="mt-1 text-body-sm text-ink-600">
                  <LocalizedText>Chưa có kỳ tuyển sinh đang mở được công bố tại đây.</LocalizedText>
                  <LocalizedText> </LocalizedText>
                  <Link
                    className="font-medium text-navy-800 underline hover:text-navy-950"
                    href="/lien-he/"
                  >
                    <LocalizedText>Liên hệ để xác nhận lịch nhận hồ sơ.</LocalizedText>
                  </Link>
                </p>
              </div>
              <ButtonLink href="/lien-he/" variant="secondary" size="sm" className="shrink-0">
                <LocalizedText>Nhận thông báo kỳ mới</LocalizedText>
              </ButtonLink>
            </div>
          )}
        </Container>
      </Section>
      {/* Latest Admission News */}
      <Section className="bg-paper">
        <Container>
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <SectionHeading className="mb-0">
              <LocalizedText>Tin tuyển sinh mới nhất</LocalizedText>
            </SectionHeading>
            <ButtonLink href="/tin-tuc-tuyen-sinh/" variant="secondary" size="sm">
              <LocalizedText>Xem tất cả</LocalizedText>
            </ButtonLink>
          </div>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {articles.map((article) => (
                <AdmissionAnnouncementCard
                  key={article.id}
                  title={article.title}
                  href={`/tin-tuc/${article.slug}`}
                  date={formatDateVN(article.publishedAt)}
                  summary={article.excerpt}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-line-200 bg-canvas py-12 text-center text-ink-600">
              <LocalizedText>Hiện chưa có tin tức tuyển sinh mới.</LocalizedText>
            </div>
          )}
        </Container>
      </Section>

      {/* Admission Timeline */}
      <Section className="border-y border-line-100 bg-canvas">
        <Container>
          <SectionHeading align="center">
            <LocalizedText>Quy trình xét tuyển</LocalizedText>
          </SectionHeading>
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
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-gold-400 bg-navy-900 text-lg font-bold text-white shadow-xs">
                      {index + 1}
                    </div>
                    <div className="pt-2 md:pt-0 md:text-center">
                      <h4 className="text-h4 mb-2 text-ink-950">
                        <LocalizedText>{step.title}</LocalizedText>
                      </h4>
                      <p className="text-body-sm text-ink-600">
                        <LocalizedText>{step.description}</LocalizedText>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Programs Preview */}
      <ProgramsSection programs={getLivePrograms()} />

      {/* FAQ Preview */}
      <Section className="bg-canvas">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <SectionHeading align="center" className="mb-4">
                <LocalizedText>Câu hỏi thường gặp</LocalizedText>
              </SectionHeading>
              <p className="text-ink-600">
                <LocalizedText>
                  Những thắc mắc phổ biến của thí sinh và phụ huynh về kỳ tuyển sinh.
                </LocalizedText>
              </p>
            </div>

            <FAQAccordion faqs={faqData} />

            <div className="mt-8 text-center">
              <ButtonLink href="/nhung-cau-hoi-thuong-gap/" variant="secondary">
                <LocalizedText>Xem tất cả câu hỏi</LocalizedText>
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
