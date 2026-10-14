import { LocalizedText } from "@/components/i18n/LocalizedText";
import { LocalizedElement } from "@/components/i18n/LocalizedElement";
import { ArrowDown, ArrowRight, BookOpen, CreditCard, GraduationCap } from "lucide-react";
import Link from "@/components/i18n/LocalizedLink";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import type { ProgramDetail } from "@/data/program-details";

export function ProgramHero({ program }: { program: ProgramDetail }) {
  const fact = (label: string) => program.facts.find((item) => item.label === label);
  const credits = fact("Khối lượng");
  const duration = fact("Thời gian");
  const creditValue = credits?.status === "verified" ? credits.value.match(/^\d+/)?.[0] : undefined;
  const termValue =
    duration?.status === "verified" ? duration.value.match(/(\d+) học kỳ/)?.[1] : undefined;
  const profileFacts = [
    { label: "Mã ngành", value: program.code },
    {
      label: "Văn bằng",
      value: fact("Văn bằng")?.status === "verified" ? fact("Văn bằng")?.value : null,
    },
    {
      label: "Đơn vị cấp bằng",
      value: "Trường Đại học Phú Xuân",
    },
    {
      label: "Ngôn ngữ",
      value: fact("Ngôn ngữ")?.status === "verified" ? fact("Ngôn ngữ")?.value : null,
    },
  ].filter((item) => item.value);
  return (
    <header className="program-hero border-b border-[var(--color-academic-rule)] bg-[var(--color-academic-canvas)]">
      <Container className="grid min-h-[38rem] min-w-0 gap-0 px-0 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="program-hero-copy min-w-0 px-[var(--academic-gutter)] py-12 sm:py-16 lg:pt-12 lg:pb-16">
          <LocalizedElement
            as="nav"
            aria-label="Đường dẫn"
            className="mb-7 text-sm text-[var(--color-academic-muted)]"
          >
            <ol className="flex min-w-0 flex-wrap gap-x-2 gap-y-1">
              <li>
                <Link className="whitespace-nowrap underline-offset-4 hover:underline" href="/">
                  <LocalizedText>Trang chủ</LocalizedText>
                </Link>
              </li>
              <li aria-hidden="true">
                <LocalizedText>/</LocalizedText>
              </li>
              <li>
                <Link
                  className="whitespace-nowrap underline-offset-4 hover:underline"
                  href="/nganh-dao-tao/"
                >
                  <LocalizedText>Ngành đào tạo</LocalizedText>
                </Link>
              </li>
              <li aria-hidden="true">
                <LocalizedText>/</LocalizedText>
              </li>
              <li aria-current="page" className="min-w-0 [overflow-wrap:anywhere] break-words">
                <LocalizedText>{program.officialName}</LocalizedText>
              </li>
            </ol>
          </LocalizedElement>

          <p className="mb-4 text-xs font-bold tracking-[0.16em] text-[var(--color-academic-accent-strong)] uppercase">
            <LocalizedText>{program.heroLabel}</LocalizedText>
          </p>
          <h1
            className={`max-w-full font-display font-semibold tracking-[-0.03em] break-words text-[var(--color-academic-ink)] sm:max-w-[16ch] ${
              program.officialName.length >= 35
                ? "text-[clamp(1.875rem,3.5vw+0.5rem,2.75rem)] leading-[1.18]"
                : "text-[clamp(2rem,4vw+0.5rem,3rem)] leading-[1.15]"
            }`}
          >
            <LocalizedText>{program.officialName}</LocalizedText>
          </h1>
          <p className="mt-4 text-lg font-semibold text-[var(--color-academic-accent-strong)] sm:text-xl">
            <LocalizedText>{program.marketingLabel}</LocalizedText>
          </p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--color-academic-muted)] sm:text-lg">
            <LocalizedText>{program.summary}</LocalizedText>
          </p>

          <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            <ButtonLink
              href="https://www.tuyensinh.topicauni.edu.vn/"
              size="lg"
              rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              className="w-full justify-center bg-[var(--color-academic-accent-strong)] text-[var(--color-academic-on-accent)] hover:bg-[var(--color-academic-ink)]"
            >
              <LocalizedText>Đăng ký xét tuyển</LocalizedText>
            </ButtonLink>
            <ButtonLink
              href="#chuong-trinh"
              size="lg"
              variant="secondary"
              rightIcon={<ArrowDown className="h-4 w-4" aria-hidden="true" />}
              className="w-full justify-center border-[var(--color-academic-rule-strong)] bg-transparent text-[var(--color-academic-ink)] hover:bg-[var(--color-academic-paper)]"
            >
              <LocalizedText>Xem chương trình</LocalizedText>
            </ButtonLink>
            <ButtonLink
              href="/tuyen-sinh/hoc-phi-hoc-bong/"
              size="lg"
              variant="secondary"
              leftIcon={<CreditCard className="h-4 w-4" aria-hidden="true" />}
              className="w-full justify-center border-[var(--color-academic-rule-strong)] bg-transparent text-[var(--color-academic-ink)] hover:bg-[var(--color-academic-paper)] sm:col-span-2 sm:mx-auto sm:w-[calc((100%-0.75rem)/2)]"
            >
              <LocalizedText>Tra cứu học phí</LocalizedText>
            </ButtonLink>
          </div>
        </div>

        <div className="program-hero-panel relative min-w-0 border-t border-[var(--color-academic-rule)] bg-[var(--color-academic-paper)] px-[var(--academic-gutter)] py-12 lg:border-t-0 lg:border-l lg:pt-12 lg:pb-16">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1 bg-[var(--color-academic-accent)] lg:inset-y-0 lg:left-0 lg:h-auto lg:w-1"
          />
          <p className="text-xs font-bold tracking-[0.16em] text-[var(--color-academic-muted)] uppercase">
            <LocalizedText>Hồ sơ học thuật</LocalizedText>
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            <div className="border-b border-[var(--color-academic-rule)] pb-8">
              <GraduationCap
                className="h-7 w-7 text-[var(--color-academic-accent-strong)]"
                aria-hidden="true"
              />
              <p className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-academic-ink)]">
                <LocalizedText>{creditValue ?? "—"}</LocalizedText>
              </p>
              <p className="mt-1 text-sm text-[var(--color-academic-muted)]">
                <LocalizedText>
                  {creditValue ? "tín chỉ tích lũy" : "tín chỉ · chờ hồ sơ"}
                </LocalizedText>
              </p>
            </div>
            <div className="border-b border-[var(--color-academic-rule)] pb-8">
              <BookOpen
                className="h-7 w-7 text-[var(--color-academic-accent-strong)]"
                aria-hidden="true"
              />
              <p className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-academic-ink)]">
                <LocalizedText>{termValue ?? "—"}</LocalizedText>
              </p>
              <p className="mt-1 text-sm text-[var(--color-academic-muted)]">
                <LocalizedText>{termValue ? duration?.value : "học kỳ · chờ hồ sơ"}</LocalizedText>
              </p>
            </div>
          </div>
          {profileFacts.length > 0 && (
            <dl className="mt-8 space-y-5 text-sm">
              {profileFacts.map((item, index) => (
                <div
                  key={item.label}
                  className={`flex items-baseline justify-between gap-4 pb-4 ${
                    index < profileFacts.length - 1
                      ? "border-b border-[var(--color-academic-rule)]"
                      : ""
                  }`}
                >
                  <dt className="text-[var(--color-academic-muted)]">
                    <LocalizedText>{item.label}</LocalizedText>
                  </dt>
                  <dd className="font-semibold text-[var(--color-academic-ink)]">
                    <LocalizedText>{item.value}</LocalizedText>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </Container>
    </header>
  );
}
