import { Search, PhoneCall, FileText, CheckCircle, GraduationCap } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { admissionSteps } from "@/data/admissions";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Search,
  PhoneCall,
  FileText,
  CheckCircle,
  GraduationCap,
};

export function AdmissionTimeline() {
  return (
    <section className="bg-paper py-16 lg:py-24" aria-labelledby="admission-timeline-title">
      <Container>
        <SectionHeading
          id="admission-timeline-title"
          title="Lộ trình trở thành sinh viên Topica"
          subtitle="5 bước đơn giản để bắt đầu hành trình học tập"
          align="center"
        />

        <div className="mx-auto mt-10 max-w-5xl sm:mt-12">
          <div className="relative">
            {/* Horizontal line behind circles (desktop only) */}
            <div className="absolute top-6 right-[10%] left-[10%] hidden h-[2px] bg-line-200 lg:block" />

            <div
              className="relative z-10 grid grid-cols-1 gap-7 lg:grid-cols-5 lg:gap-4"
              role="list"
            >
              {admissionSteps.map((step, index) => {
                const IconComponent = iconMap[step.icon] || CheckCircle;
                return (
                  <ScrollReveal key={step.step} delay={index * 0.1}>
                    <div
                      className="relative flex flex-row items-start gap-4 rounded-lg border border-line-100 bg-canvas p-4 shadow-xs lg:flex-col lg:items-center lg:gap-0 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
                      role="listitem"
                    >
                      {/* Vertical line connector for mobile */}
                      {index < admissionSteps.length - 1 && (
                        <div className="absolute top-12 bottom-[-2rem] left-6 -z-10 w-[2px] bg-line-200 lg:hidden" />
                      )}

                      <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-700 font-bold text-white shadow-sm lg:mx-auto">
                        {index + 1}
                      </div>

                      <div className="flex-1 pt-2 lg:mt-3 lg:pt-0">
                        <div className="flex justify-start lg:justify-center">
                          <IconComponent className="h-6 w-6 text-brand-500" />
                        </div>
                        <h3 className="mt-2 text-left font-semibold text-ink-950 lg:text-center">
                          {step.title}
                        </h3>
                        <p className="mt-1 max-w-[180px] text-left text-body-sm text-ink-600 lg:mx-auto lg:text-center">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-brand-200 bg-brand-50/70 px-5 py-6 text-center lg:mt-16 sm:px-8 sm:py-7">
          <p className="text-body-sm font-semibold text-brand-800">
            Sẵn sàng bắt đầu lộ trình của bạn?
          </p>
          <ButtonLink
            href="https://www.tuyensinh.topicauni.edu.vn/"
            external
            variant="primary"
            size="lg"
            className="mt-4"
          >
            Đăng ký xét tuyển
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
