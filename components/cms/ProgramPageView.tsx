import { LocalizedText } from "@/components/i18n/LocalizedText";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  GraduationCap,
  Landmark,
  CreditCard,
  MessageCircle,
} from "lucide-react";
import { CurriculumExplorer } from "@/components/program/CurriculumExplorer";
import { LearningOutcomes } from "@/components/program/LearningOutcomes";
import { PendingAcademicSections } from "@/components/program/PendingAcademicSections";
import { ProgramHero } from "@/components/program/ProgramHero";
import { ProgramInPageNav } from "@/components/program/ProgramInPageNav";
import { ProgramQuickFacts } from "@/components/program/ProgramQuickFacts";
import { ProgramStickyBar } from "@/components/program/ProgramStickyBar";
import { StudyRoadmap } from "@/components/program/StudyRoadmap";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { env } from "@/lib/env";
import type { ProgramDetail } from "@/data/program-details";
import { OFFICIAL_TUITION_PROGRAMS } from "@/data/tuition";

const careerIcons = [Building2, Landmark, GraduationCap];

export function ProgramPageView({ program }: { program: ProgramDetail }) {
  const canonical = `${env.NEXT_PUBLIC_SITE_URL}/${program.slug}`;
  const hasAcademicSource = program.evidenceLevel === "academic_source";
  const hasCurriculum = program.curriculum.length > 0;
  const hasRoadmap = program.semesters.length > 0;
  const hasOutcomes = program.outcomes.length > 0;
  const hasAdmissions = Boolean(
    program.admissions || program.graduation || program.confirmations.length,
  );
  const fact = (label: string) =>
    program.facts.find((item) => item.label === label && item.status === "verified")?.value;
  const creditFact = fact("Khối lượng");
  const durationFact = fact("Thời gian");
  const degreeFact = fact("Văn bằng");
  const tuitionInfo = OFFICIAL_TUITION_PROGRAMS.find((p) => p.slug === program.slug);
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": hasCurriculum ? "Course" : "EducationalOccupationalProgram",
    name: program.officialName,
    description: program.summary,
    url: canonical,
    inLanguage: "vi",
    ...(program.englishName ? { alternateName: program.englishName } : {}),
    ...(degreeFact ? { educationalCredentialAwarded: degreeFact } : {}),
    ...(durationFact?.includes("3 năm") ? { timeRequired: "P3Y" } : {}),
    ...(hasCurriculum
      ? { provider: { "@type": "EducationalOrganization", name: "Trường Đại học Phú Xuân" } }
      : {}),
  };
  const faqs = [
    ...(creditFact ? [["Chương trình có bao nhiêu tín chỉ?", `${creditFact} tích lũy.`]] : []),
    ...(hasRoadmap
      ? [
          [
            "Lộ trình học tập có bao nhiêu học kỳ?",
            `Chương trình được bố trí trong ${program.semesters.length} học kỳ (khoảng 3 năm).`,
          ],
        ]
      : []),
    [
      "Học phí của ngành này là bao nhiêu?",
      tuitionInfo
        ? `Đơn giá học phí: ${tuitionInfo.pricePerCredit.toLocaleString("vi-VN")}đ/tín chỉ (~${tuitionInfo.tuitionPerSemester.toLocaleString("vi-VN")}đ/học kỳ). Học phí thu theo số tín chỉ thực tế đăng ký. Xem chi tiết biểu phí tại trang Tuyển sinh & Học phí.`
        : "Học phí được tính theo số tín chỉ thực tế đăng ký trong mỗi kỳ. Vui lòng xem bảng học phí chính thức.",
    ],
    [
      "Đơn vị cấp bằng và giá trị văn bằng?",
      "Văn bằng Cử nhân do Trường Đại học Phú Xuân cấp, được Bộ GD&ĐT công nhận toàn quốc và có giá trị tương đương bằng chính quy theo Luật Giáo dục Đại học sửa đổi.",
    ],
  ];
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: env.NEXT_PUBLIC_SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Ngành học",
        item: `${env.NEXT_PUBLIC_SITE_URL}/nganh-dao-tao/`,
      },
      { "@type": "ListItem", position: 3, name: program.officialName, item: canonical },
    ],
  };

  return (
    <article className="program-page bg-[var(--color-academic-canvas)] pb-[var(--academic-sticky-height)] text-[var(--color-academic-ink)]">
      <JsonLd data={courseSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ProgramHero program={program} />
      <ProgramInPageNav program={program} />
      <ProgramQuickFacts program={program} />
      {hasCurriculum ? (
        <CurriculumExplorer program={program} />
      ) : (
        <PendingAcademicSections program={program} />
      )}
      {hasRoadmap && <StudyRoadmap program={program} />}
      {hasOutcomes && <LearningOutcomes program={program} />}

      <section
        id="co-hoi-nghe-nghiep"
        aria-labelledby="career-title"
        className="scroll-mt-28 bg-[var(--color-academic-ink)] py-[var(--academic-section-space)] text-[var(--color-academic-on-accent)]"
      >
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-[var(--color-academic-accent)] uppercase">
                <LocalizedText>Sau tốt nghiệp</LocalizedText>
              </p>
              <h2
                id="career-title"
                className="mt-3 max-w-[12ch] text-4xl font-semibold tracking-[-0.03em] !text-[var(--color-academic-on-accent)] sm:text-5xl"
              >
                <LocalizedText>Cơ hội nghề nghiệp</LocalizedText>
              </h2>
              <p className="mt-5 max-w-md leading-7 text-[color:var(--color-academic-on-accent)]/75">
                <LocalizedText>
                  {hasAcademicSource
                    ? "Hồ sơ nguồn mô tả nhóm môi trường làm việc, không gắn chức danh hoặc doanh nghiệp cụ thể."
                    : "Các vị trí dưới đây được giữ theo nội dung trang ngành hiện hành; chưa đối chiếu hồ sơ chương trình đào tạo."}
                </LocalizedText>
              </p>
            </div>
            <ol className="border-t border-[color:var(--color-academic-on-accent)]/25">
              {program.careers.map((career, index) => {
                const Icon = careerIcons[index] ?? Building2;
                return (
                  <li
                    key={career}
                    className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-b border-[color:var(--color-academic-on-accent)]/25 py-6 sm:grid-cols-[4rem_minmax(0,1fr)]"
                  >
                    <Icon
                      className="h-6 w-6 text-[var(--color-academic-accent)]"
                      aria-hidden="true"
                    />
                    <p className="leading-7 text-[color:var(--color-academic-on-accent)]/90">
                      <LocalizedText>{career}</LocalizedText>
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
          <LocalizedText>
            {program.furtherStudy && (
              <p className="mt-10 border-l-2 border-[var(--color-academic-accent)] pl-4 text-sm leading-6 text-[color:var(--color-academic-on-accent)]/75">
                <LocalizedText>{program.furtherStudy}</LocalizedText>
              </p>
            )}
          </LocalizedText>
        </Container>
      </section>

      {hasAdmissions && (
        <section
          id="dieu-kien-tuyen-sinh"
          aria-labelledby="admissions-title"
          className="scroll-mt-28 bg-[var(--color-academic-paper)] py-[var(--academic-section-space)]"
        >
          <Container>
            <div className="grid min-w-0 gap-8 lg:grid-cols-2 lg:gap-16">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-[var(--color-academic-accent-strong)] uppercase">
                  <LocalizedText>Tuyển sinh & tốt nghiệp</LocalizedText>
                </p>
                <h2
                  id="admissions-title"
                  className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[var(--color-academic-ink)] sm:text-5xl"
                >
                  <LocalizedText>Điều kiện trong hồ sơ chương trình</LocalizedText>
                </h2>
                <dl className="mt-8 space-y-7">
                  <LocalizedText>
                    {program.admissions && (
                      <div className="border-t border-[var(--color-academic-rule-strong)] pt-5">
                        <dt className="text-sm font-bold text-[var(--color-academic-ink)]">
                          <LocalizedText>Đối tượng tuyển sinh</LocalizedText>
                        </dt>
                        <dd className="mt-2 leading-7 text-[var(--color-academic-muted)]">
                          <LocalizedText>{program.admissions}</LocalizedText>
                        </dd>
                      </div>
                    )}
                  </LocalizedText>
                  <LocalizedText>
                    {program.graduation && (
                      <div className="border-t border-[var(--color-academic-rule-strong)] pt-5">
                        <dt className="text-sm font-bold text-[var(--color-academic-ink)]">
                          <LocalizedText>Điều kiện tốt nghiệp</LocalizedText>
                        </dt>
                        <dd className="mt-2 leading-7 text-[var(--color-academic-muted)]">
                          <LocalizedText>{program.graduation}</LocalizedText>
                        </dd>
                      </div>
                    )}
                  </LocalizedText>
                </dl>
              </div>

              {program.confirmations.length > 0 && (
                <div className="border border-[var(--color-academic-rule-strong)] bg-[var(--color-academic-elevated)] p-6 sm:p-8">
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className="mt-1 h-5 w-5 shrink-0 text-[var(--color-academic-warning)]"
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--color-academic-ink)]">
                        <LocalizedText>Điểm cần đối chiếu trong nguồn</LocalizedText>
                      </h3>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-4 text-sm leading-6 text-[var(--color-academic-muted)]">
                    {program.confirmations.map((item) => (
                      <li
                        key={item}
                        className="border-l-2 border-[var(--color-academic-warning)] pl-4"
                      >
                        <LocalizedText>{item}</LocalizedText>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      <section
        id="cau-hoi-thuong-gap"
        aria-labelledby="faq-title"
        className="scroll-mt-28 bg-[var(--color-academic-canvas)] py-[var(--academic-section-space)]"
      >
        <Container size="narrow">
          <p className="text-xs font-bold tracking-[0.16em] text-[var(--color-academic-accent-strong)] uppercase">
            <LocalizedText>Câu hỏi thường gặp</LocalizedText>
          </p>
          <h2
            id="faq-title"
            className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[var(--color-academic-ink)] sm:text-5xl"
          >
            <LocalizedText>Thông tin cốt lõi</LocalizedText>
          </h2>
          <div className="mt-9 border-t border-[var(--color-academic-rule-strong)]">
            {faqs.map(([question, answer]) => (
              <details
                key={question}
                className="group border-b border-[var(--color-academic-rule)]"
              >
                <summary className="cursor-pointer list-none py-5 font-semibold text-[var(--color-academic-ink)] marker:content-none">
                  <LocalizedText>{question}</LocalizedText>
                </summary>
                <p className="pb-6 leading-7 text-[var(--color-academic-muted)]">
                  <LocalizedText>{answer}</LocalizedText>
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[var(--color-academic-ink)] py-14 text-[var(--color-academic-on-accent)] sm:py-16">
        <Container className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-[var(--color-academic-accent)] uppercase">
              <LocalizedText>Hành trình học tập của bạn</LocalizedText>
            </p>
            <h2 className="mt-2 max-w-2xl text-2xl font-semibold !text-[var(--color-academic-on-accent)] sm:text-3xl lg:text-4xl">
              <LocalizedText>Sẵn sàng trở thành sinh viên ngành </LocalizedText>
              <LocalizedText>{program.officialName}</LocalizedText>
              <LocalizedText>?</LocalizedText>
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[var(--color-academic-on-accent)]/80">
              <LocalizedText>
                Kiểm tra điều kiện nhập học, xem dự toán học phí chính xác hoặc nộp hồ sơ xét tuyển
                trực tuyến ngay hôm nay.
              </LocalizedText>
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[30rem]">
            <ButtonLink
              href="https://www.tuyensinh.topicauni.edu.vn/"
              size="lg"
              external
              rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              className="w-full justify-center bg-[var(--color-academic-accent-strong)] text-[var(--color-academic-on-accent)] hover:bg-[var(--color-academic-ink)]"
            >
              <LocalizedText>Đăng ký xét tuyển</LocalizedText>
            </ButtonLink>
            <ButtonLink
              href="/tuyen-sinh/hoc-phi-hoc-bong/"
              size="lg"
              variant="secondary"
              leftIcon={<CreditCard className="h-4 w-4" aria-hidden="true" />}
              className="w-full justify-center bg-[var(--color-academic-elevated)] text-[var(--color-academic-ink)] hover:bg-[var(--color-academic-paper)]"
            >
              <LocalizedText>Xem biểu phí & học bổng</LocalizedText>
            </ButtonLink>
            <ButtonLink
              href="/lien-he/"
              size="lg"
              variant="secondary"
              leftIcon={<MessageCircle className="h-4 w-4" aria-hidden="true" />}
              className="w-full justify-center border border-white/20 bg-transparent text-white hover:bg-white/10 sm:col-span-2 sm:mx-auto sm:w-[calc((100%-0.75rem)/2)]"
            >
              <LocalizedText>Nhận tư vấn</LocalizedText>
            </ButtonLink>
          </div>
        </Container>
      </section>

      <ProgramStickyBar program={program} />
    </article>
  );
}
