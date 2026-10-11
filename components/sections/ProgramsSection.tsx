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
import { programs, programGroups } from "@/data/programs";

export function ProgramsSection() {
  return (
    <section className="bg-canvas py-16 lg:py-24" aria-labelledby="programs-title">
      <Container>
        <SectionHeading
          id="programs-title"
          title="5 Ngành Đào tạo Cử nhân Trực tuyến"
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
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <Badge variant="navy">{programGroups[program.group]}</Badge>
                        <StatusBadge variant="active" showIcon={false} />
                      </div>

                      <h3 className="font-serif text-h3 font-bold text-ink-950 group-hover:text-navy-900 transition-colors">
                        {mainName}
                      </h3>

                      {specialization && (
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gold-700">
                          Chuyên ngành: {specialization}
                        </p>
                      )}

                      <p className="mt-2.5 line-clamp-2 text-body-sm text-ink-600 leading-relaxed">
                        {program.shortDescription}
                      </p>

                      <div className="mt-4 pt-3 border-t border-line-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-600">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5 text-navy-700" aria-hidden="true" />
                          Cử nhân ĐH Phú Xuân
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-navy-700" aria-hidden="true" />
                          3.5 – 4.0 năm
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
      </Container>
    </section>
  );
}
