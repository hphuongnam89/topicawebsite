import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardMedia, CardBody, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buttonStyles } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { programs, programGroups } from "@/data/programs";

export function ProgramsSection() {
  return (
    <section className="bg-paper py-16 lg:py-24">
      <Container>
        <SectionHeading
          title="Chương trình đào tạo"
          subtitle="Đa dạng ngành nghề, chương trình đào tạo chất lượng cao được Bộ GD&ĐT công nhận"
          align="center"
        />
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program, index) => (
            <ScrollReveal key={program.slug} delay={index * 0.05}>
              <Link href={program.href} className="group block h-full">
                <Card className="flex h-full flex-col overflow-hidden">
                  <CardMedia aspect="aspect-[4/3]">
                    <div className="relative h-full w-full overflow-hidden bg-brand-50">
                      <Image
                        src={program.image}
                        alt={program.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </CardMedia>
                  <CardBody className="flex-1">
                    <Badge variant="brand">{programGroups[program.group]}</Badge>
                    <h3 className="mt-2 font-display text-h3 text-ink-950">{program.name}</h3>
                    <p className="mt-2 line-clamp-2 text-body-sm text-ink-600">
                      {program.shortDescription}
                    </p>
                  </CardBody>
                  <CardFooter>
                    <span className={buttonStyles({ variant: "tertiary", size: "sm" })}>
                      Tìm hiểu thêm
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
