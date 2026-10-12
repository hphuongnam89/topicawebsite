import Link from "next/link";
import Image from "next/image";
import { ArrowRight, GraduationCap, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardMedia, CardBody, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { buttonStyles } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { programs as defaultPrograms, programGroups, type Program } from "@/data/programs";

export function ProgramsSection({
  programs = defaultPrograms,
}: { programs?: readonly Program[] } = {}) {
  return (
    <section
      id="chuong-trinh-dao-tao"
      className="scroll-mt-20 bg-canvas py-16 lg:py-24"
      aria-labelledby="programs-title"
    >
      <Container>
        <SectionHeading
          id="programs-title"
          title={`${programs.length} Ngành Đào tạo Cử nhân Trực tuyến`}
          subtitle="Chương trình đào tạo chất lượng cao do Trường Đại học Phú Xuân cấp bằng cử nhân, linh hoạt thời gian cho người đi làm"
          align="center"
        />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                          alt={program.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-[var(--duration-slow)] group-hover:scale-[1.03] motion-reduce:transition-none"
                        />
                      </div>
                    </CardMedia>

                    <CardBody className="flex-1">
                      <div className="mb-2.5 flex items-center justify-between gap-2">
                        <Badge variant="navy">{programGroups[program.group]}</Badge>
                        <StatusBadge variant="active" showIcon={false} />
                      </div>

                      <h3 className="font-serif text-h3 font-bold text-ink-950 transition-colors group-hover:text-navy-900">
                        {mainName}
                      </h3>

                      {specialization && (
                        <p className="mt-1 text-xs font-semibold tracking-wider text-gold-700 uppercase">
                          Chuyên ngành: {specialization}
                        </p>
                      )}

                      <p className="mt-2.5 line-clamp-2 text-body-sm leading-relaxed text-ink-600">
                        {program.shortDescription}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line-100 pt-3 text-xs text-ink-600">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5 text-navy-700" aria-hidden="true" />
                          Cử nhân ĐH Phú Xuân
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-navy-700" aria-hidden="true" />
                          Theo lộ trình và tín chỉ được công nhận
                        </span>
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
                        Xem chi tiết & Khung chương trình
                        <ArrowRight
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

        {/* Pathway to Directory & Tuition Details */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-xl border border-line-200 bg-surface-subtle/60 p-6 sm:flex-row sm:px-8">
          <div>
            <h4 className="font-semibold text-navy-950">
              Bạn muốn so sánh toàn diện 5 ngành và mức học phí?
            </h4>
            <p className="mt-1 text-body-sm text-ink-600">
              Tra cứu bảng học phí theo tín chỉ và kế hoạch đào tạo chi tiết từng ngành.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/nganh-dao-tao/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 bg-canvas px-4 py-2 text-body-sm font-semibold text-navy-900 shadow-2xs transition-colors hover:bg-navy-50"
            >
              Xem danh mục ngành
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/tuyen-sinh/hoc-phi-hoc-bong/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line-200 bg-canvas px-4 py-2 text-body-sm font-semibold text-ink-700 shadow-2xs transition-colors hover:border-navy-300 hover:text-navy-900"
            >
              Tra cứu học phí 2026
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
