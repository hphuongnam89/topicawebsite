import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Landmark,
  Phone,
  WalletCards,
} from "lucide-react";
import { LeadForm } from "@/components/forms/LeadForm";
import { CurriculumExplorer } from "@/components/program/CurriculumExplorer";
import { LearningOutcomes } from "@/components/program/LearningOutcomes";
import { PendingAcademicSections } from "@/components/program/PendingAcademicSections";
import { ProgramHero } from "@/components/program/ProgramHero";
import { ProgramQuickFacts } from "@/components/program/ProgramQuickFacts";
import { ProgramStickyBar } from "@/components/program/ProgramStickyBar";
import { StudyRoadmap } from "@/components/program/StudyRoadmap";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { contactInfo } from "@/data/campuses";
import { getProgramPageContent } from "@/data/program-page-content";
import type { ProgramDetail } from "@/data/program-details";
import { env } from "@/lib/env";
import { isPublicClaimApproved } from "@/CONTENT_SOURCE_OF_TRUTH";

const careerIcons = [Building2, Landmark, GraduationCap];
const admissionBullets = [
  "Đã tốt nghiệp THPT hoặc trung học nghề, hoặc có bằng Trung cấp, Cao đẳng, Đại học theo quy định.",
  "Có 5 phương thức xét tuyển: điểm thi, học bạ, kết hợp chứng chỉ ngoại ngữ, đánh giá năng lực hoặc đã tốt nghiệp một trình độ đào tạo.",
  "Theo thông báo 2026, ngưỡng tham khảo là từ 15 điểm với điểm thi và từ 16 điểm với học bạ, tùy phương thức.",
  "Có đủ sức khỏe và thông tin, hồ sơ dự tuyển theo yêu cầu hiện hành.",
];

export function ProgramPageView({ program }: { program: ProgramDetail }) {
  const canonical = `${env.NEXT_PUBLIC_SITE_URL}/${program.slug}`;
  const pageContent = getProgramPageContent(program);
  const hasCurriculum = program.curriculum.length > 0;
  const hasRoadmap = program.semesters.length > 0;
  const showAcademicDetails = isPublicClaimApproved("program.academic-tables");
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: env.NEXT_PUBLIC_SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Ngành đào tạo",
        item: `${env.NEXT_PUBLIC_SITE_URL}/nganh-dao-tao/`,
      },
      { "@type": "ListItem", position: 3, name: program.officialName, item: canonical },
    ],
  };

  return (
    <article className="program-page bg-[var(--color-academic-canvas)] pb-[var(--academic-sticky-height)] text-[var(--color-academic-ink)]">
      <JsonLd data={breadcrumbSchema} />
      <ProgramHero
        program={program}
        audience={pageContent.audience}
        showAcademicDetails={showAcademicDetails}
      />
      <ProgramQuickFacts program={program} />

      {showAcademicDetails && (
        <>
          <section
            id="tong-quan-nganh"
            aria-labelledby="learning-title"
            className="bg-[var(--color-academic-paper)] py-[var(--academic-section-space)]"
          >
            <Container>
              <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                <div>
                  <p className="text-xs font-bold tracking-[0.16em] text-[var(--color-academic-accent-strong)] uppercase">
                    Năng lực hình thành
                  </p>
                  <h2
                    id="learning-title"
                    className="mt-3 max-w-[13ch] text-4xl font-semibold tracking-[-0.03em] text-[var(--color-academic-ink)] sm:text-5xl"
                  >
                    Bạn sẽ học gì?
                  </h2>
                  <p className="mt-5 max-w-md leading-7 text-[var(--color-academic-muted)]">
                    {pageContent.learningIntro}
                  </p>
                </div>
                <div className="grid gap-8 sm:grid-cols-2">
                  <ul className="space-y-4 sm:col-span-2 sm:grid sm:grid-cols-2 sm:space-y-0 sm:gap-x-8">
                    {pageContent.learningPoints.map((point) => (
                      <li
                        key={point}
                        className="flex gap-3 border-t border-[var(--color-academic-rule)] py-4 leading-6 text-[var(--color-academic-muted)]"
                      >
                        <CheckCircle2
                          className="mt-1 h-4 w-4 shrink-0 text-[var(--color-academic-accent-strong)]"
                          aria-hidden="true"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  {pageContent.directions.map((direction) => (
                    <div
                      key={direction.label}
                      className="border-l-2 border-[var(--color-academic-accent)] bg-[var(--color-academic-elevated)] p-5 sm:p-6"
                    >
                      <p className="text-sm font-bold text-[var(--color-academic-ink)]">
                        {direction.label}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-academic-muted)]">
                        {direction.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Container>
          </section>

          {hasCurriculum ? (
            <CurriculumExplorer program={program} />
          ) : (
            <PendingAcademicSections program={program} />
          )}
          {hasRoadmap && <StudyRoadmap program={program} />}
          <LearningOutcomes program={program} />

          <section
            aria-labelledby="career-title"
            className="bg-[var(--color-academic-ink)] py-[var(--academic-section-space)] text-[var(--color-academic-on-accent)]"
          >
            <Container>
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                <div>
                  <p className="text-xs font-bold tracking-[0.16em] text-[var(--color-academic-accent)] uppercase">
                    Sau tốt nghiệp
                  </p>
                  <h2
                    id="career-title"
                    className="mt-3 max-w-[12ch] text-4xl font-semibold tracking-[-0.03em] !text-[var(--color-academic-on-accent)] sm:text-5xl"
                  >
                    Cơ hội nghề nghiệp
                  </h2>
                  <p className="mt-5 max-w-md leading-7 text-[color:var(--color-academic-on-accent)]/75">
                    Các vai trò dưới đây là hướng tham khảo theo nội dung ngành và năng lực người
                    học; vị trí thực tế phụ thuộc kinh nghiệm, hồ sơ và nhu cầu tuyển dụng.
                  </p>
                </div>
                <div className="space-y-8">
                  {pageContent.careerTiers.map((tier, tierIndex) => {
                    const Icon = careerIcons[tierIndex] ?? Building2;
                    return (
                      <div key={tier.title}>
                        <h3 className="flex items-center gap-3 text-lg font-semibold !text-[var(--color-academic-on-accent)]">
                          <Icon
                            className="h-5 w-5 text-[var(--color-academic-accent)]"
                            aria-hidden="true"
                          />
                          {tier.title}
                        </h3>
                        <ul className="mt-4 grid gap-x-8 border-t border-[color:var(--color-academic-on-accent)]/25 sm:grid-cols-2">
                          {tier.items.map((item) => (
                            <li
                              key={item}
                              className="border-b border-[color:var(--color-academic-on-accent)]/25 py-4 leading-6 text-[color:var(--color-academic-on-accent)]/90"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                        {tier.note && (
                          <p className="mt-3 text-sm text-[color:var(--color-academic-on-accent)]/65">
                            {tier.note}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Container>
          </section>
        </>
      )}

      <section
        id="thong-tin-tuyen-sinh"
        aria-labelledby="admissions-title"
        className="bg-[var(--color-academic-paper)] py-[var(--academic-section-space)]"
      >
        <Container>
          <div className="grid min-w-0 gap-8 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-[var(--color-academic-accent-strong)] uppercase">
                Tuyển sinh
              </p>
              <h2
                id="admissions-title"
                className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[var(--color-academic-ink)] sm:text-5xl"
              >
                Bắt đầu từ hồ sơ của bạn
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-[var(--color-academic-muted)]">
                {pageContent.admissionsNote}
              </p>
              <ul className="mt-8 space-y-4">
                {admissionBullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex gap-3 leading-6 text-[var(--color-academic-muted)]"
                  >
                    <CheckCircle2
                      className="mt-1 h-4 w-4 shrink-0 text-[var(--color-academic-accent-strong)]"
                      aria-hidden="true"
                    />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            <div
              id="hoc-phi"
              className="border border-[var(--color-academic-rule-strong)] p-6 sm:p-8"
            >
              <div className="flex items-start gap-3">
                <WalletCards
                  className="mt-1 h-6 w-6 shrink-0 text-[var(--color-academic-accent-strong)]"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-2xl font-semibold text-[var(--color-academic-ink)]">
                    Học phí & học bổng
                  </h3>
                  <ul className="mt-5 space-y-3 text-sm leading-6 text-[var(--color-academic-muted)]">
                    {pageContent.tuitionBullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="border-l-2 border-[var(--color-academic-accent)] pl-3"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-xs leading-5 text-[var(--color-academic-muted)]">
                    {pageContent.tuitionNote}
                  </p>
                  <a
                    href="#program-consultation-form"
                    data-track="tuition_click"
                    className="mt-6 inline-flex font-semibold text-[var(--color-academic-accent-strong)] underline underline-offset-4"
                  >
                    Nhận bảng phí theo hồ sơ{" "}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section
        id="program-consultation-form"
        aria-labelledby="program-form-title"
        className="bg-[var(--color-academic-canvas)] py-[var(--academic-section-space)]"
      >
        <Container className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)] lg:items-start">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-[var(--color-academic-accent-strong)] uppercase">
              Kiểm tra điều kiện
            </p>
            <h2
              id="program-form-title"
              className="mt-3 max-w-[13ch] text-4xl font-semibold tracking-[-0.03em] text-[var(--color-academic-ink)] sm:text-5xl"
            >
              Nhận tư vấn đúng ngành
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-[var(--color-academic-muted)]">
              Gửi thông tin để được tư vấn về hướng học, hồ sơ đầu vào, học phí và lịch nhận hồ sơ
              mới nhất cho {program.officialName}.
            </p>
            <a
              href={`tel:${contactInfo.phone}`}
              data-track="phone_click"
              className="mt-7 inline-flex items-center gap-2 font-semibold text-[var(--color-academic-accent-strong)]"
            >
              <Phone className="h-4 w-4" aria-hidden="true" /> Gọi {contactInfo.phone}
            </a>
          </div>
          <LeadForm
            id="lead-form"
            heading={`Nhận lộ trình ${program.marketingLabel}`}
            description="Bộ phận tuyển sinh sẽ liên hệ và tư vấn theo ngành bạn đã chọn."
            responseTime="Tư vấn viên sẽ liên hệ trong giờ làm việc."
            programCode={program.code ?? undefined}
            programName={program.officialName}
            programDirection={program.marketingLabel}
          />
        </Container>
      </section>

      <section
        aria-labelledby="faq-title"
        className="bg-[var(--color-academic-paper)] py-[var(--academic-section-space)]"
      >
        <Container size="narrow">
          <p className="text-xs font-bold tracking-[0.16em] text-[var(--color-academic-accent-strong)] uppercase">
            Câu hỏi thường gặp
          </p>
          <h2
            id="faq-title"
            className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[var(--color-academic-ink)] sm:text-5xl"
          >
            Thông tin cốt lõi
          </h2>
          <div className="mt-9 border-t border-[var(--color-academic-rule-strong)]">
            {pageContent.faqs.map(([question, answer]) => (
              <details
                key={question}
                className="group border-b border-[var(--color-academic-rule)]"
              >
                <summary
                  data-track="faq_open"
                  data-track-label={question}
                  className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold text-[var(--color-academic-ink)] marker:content-none"
                >
                  {question}
                  <ChevronDown
                    className="h-5 w-5 shrink-0 text-[var(--color-academic-accent-strong)] transition-transform duration-[var(--academic-duration)] group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="pb-6 leading-7 text-[var(--color-academic-muted)]">{answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[var(--color-academic-ink)] py-14 text-[var(--color-academic-on-accent)] sm:py-16">
        <Container className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-[var(--color-academic-accent)] uppercase">
              Bước tiếp theo
            </p>
            <h2 className="mt-2 max-w-2xl text-3xl font-semibold !text-[var(--color-academic-on-accent)] sm:text-4xl">
              Sẵn sàng tìm hiểu {program.officialName}?
            </h2>
          </div>
          <ButtonLink
            href="#program-consultation-form"
            data-track="program_cta_click"
            size="lg"
            rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            className="self-start bg-[var(--color-academic-elevated)] text-[var(--color-academic-ink)] hover:bg-[var(--color-academic-paper)] md:self-auto"
          >
            Nhận tư vấn ngành này
          </ButtonLink>
        </Container>
      </section>

      <p className="bg-[var(--color-academic-paper)] px-6 py-5 text-center text-xs leading-5 text-[var(--color-academic-muted)] sm:px-8">
        Thông tin chương trình được cập nhật theo hồ sơ đào tạo hiện hành. Một số nội dung có thể
        thay đổi theo quy định; vui lòng xác nhận với tư vấn tuyển sinh trước khi hoàn tất hồ sơ.
      </p>

      <ProgramStickyBar program={program} />
    </article>
  );
}
