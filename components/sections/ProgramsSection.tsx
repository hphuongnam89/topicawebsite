import { LocalizedText } from "@/components/i18n/LocalizedText";
import Link from "@/components/i18n/LocalizedLink";
import Image from "@/components/i18n/LocalizedImage";
import { ArrowRight, GraduationCap, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardMedia, CardBody, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buttonStyles } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { programs as defaultPrograms, programGroups, type Program } from "@/data/programs";

export function ProgramsSection({
  programs = defaultPrograms,
}: { programs?: readonly Program[] } = {}) {
  return (
    <section
      id="chuong-trinh-dao-tao"
      className="scroll-mt-20 bg-paper-blue py-16 lg:py-24"
      aria-labelledby="programs-title"
    >
      <Container>
        <SectionHeading
          id="programs-title"
          title={`${programs.length} Ngành Đào tạo Cử nhân Trực tuyến`}
          subtitle="Chương trình đào tạo chất lượng cao do Trường Đại học Phú Xuân cấp bằng cử nhân, linh hoạt thời gian cho người đi làm"
          align="left"
          className="max-w-4xl after:mt-6 after:block after:h-1 after:w-14 after:rounded-full after:bg-gold-500 after:content-['']"
        />

        <div className="mt-9 grid grid-cols-1 gap-6 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {programs.map((program, index) => {
            const hasSpecialization = program.name.includes("- chuyên ngành");
            const mainName = hasSpecialization
              ? program.name.split("- chuyên ngành")[0].trim()
              : program.name;
            const specialization = hasSpecialization
              ? program.name.split("- chuyên ngành")[1].trim()
              : null;

            return (
              <ScrollReveal key={program.slug} delay={index * 0.05}>
                <Link
                  href={program.href}
                  className="group block h-full rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy-700"
                  aria-label={`Tìm hiểu chương trình ${program.name}`}
                >
                  <Card className="flex h-full flex-col overflow-hidden border-line-200 transition-[border-color,box-shadow,transform] duration-[var(--duration-base)] group-hover:border-navy-300 group-hover:shadow-card-hover group-focus-visible:-translate-y-0.5 group-focus-visible:border-navy-700 motion-reduce:transform-none">
                    <CardMedia aspect="aspect-[16/10]">
                      <div className="relative h-full w-full overflow-hidden bg-navy-50">
                        <Image
                          src={program.image}
                          alt={`Ảnh minh họa cho ngành ${program.name}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-[var(--duration-slow)] group-hover:scale-[1.03] motion-reduce:transition-none"
                        />
                      </div>
                    </CardMedia>

                    <CardBody className="flex-1">
                      <div className="mb-2.5 flex items-center justify-between gap-2">
                        <Badge variant="navy"><LocalizedText>{programGroups[program.group]}</LocalizedText></Badge>
                      </div>

                      <h3 className="min-h-[3.5rem] font-serif text-h3 font-bold text-ink-950 transition-colors group-hover:text-navy-900">
                        <LocalizedText>{mainName}</LocalizedText>
                      </h3>

                      <p className="mt-1 min-h-4 text-xs font-semibold tracking-wider text-gold-700 uppercase">
                        <LocalizedText>{specialization ? `Chuyên ngành: ${specialization}` : ""}</LocalizedText>
                      </p>

                      <p className="mt-2.5 line-clamp-2 text-body-sm leading-relaxed text-ink-600">
                        <LocalizedText>{program.shortDescription}</LocalizedText>
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line-100 pt-3 text-xs text-ink-600">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5 text-navy-700" aria-hidden="true" />
                          <LocalizedText>Cử nhân ĐH Phú Xuân
                        </LocalizedText></span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-navy-700" aria-hidden="true" />
                          <LocalizedText>Theo lộ trình và tín chỉ được công nhận
                        </LocalizedText></span>
                      </div>
                    </CardBody>

                    <CardFooter className="pt-0">
                      <span
                        className={buttonStyles({
                          variant: "tertiary",
                          size: "sm",
                          className: "group/cta gap-2 px-0 font-semibold text-navy-900",
                        })}
                      >
                        <LocalizedText>Xem chi tiết & Khung chương trình
                        </LocalizedText><ArrowRight
                          className="h-4 w-4 transition-transform duration-[var(--duration-fast)] group-hover/cta:translate-x-1"
                          aria-hidden="true"
                        />
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>

        <div className="relative mt-12 overflow-hidden rounded-2xl bg-navy-950 px-6 py-8 text-canvas shadow-card sm:px-9 sm:py-9 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-12">
          <div
            className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full border border-gold-400/20"
            aria-hidden="true"
          />
          <div className="relative max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-400">
              <LocalizedText>Chọn ngành học
            </LocalizedText></p>
            <h3 className="mt-2 font-serif text-xl font-bold text-white sm:text-2xl">
              <LocalizedText>Đang phân vân ngành nào phù hợp với bạn?
            </LocalizedText></h3>
            <p className="mt-2 max-w-xl text-body-sm leading-relaxed text-navy-100">
              <LocalizedText>Khám phá chương trình, lộ trình học và định hướng của từng ngành để tìm lựa chọn phù hợp.
            </LocalizedText></p>
          </div>
          <Link
            href="/nganh-dao-tao/"
            className="relative mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-gold-400 px-5 py-3 text-body-sm font-bold text-navy-950 shadow-sm transition-colors hover:bg-gold-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300 sm:w-auto lg:mt-0 lg:shrink-0"
          >
            <LocalizedText>Khám phá các ngành
            </LocalizedText><ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
