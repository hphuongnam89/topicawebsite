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
    <section
      id="quy-trinh-tuyen-sinh"
      className="scroll-mt-20 border-y border-navy-800 bg-navy-950 py-16 [background-image:radial-gradient(ellipse_at_top_right,rgba(29,89,153,0.38),transparent_48%)] lg:py-24"
      aria-labelledby="admission-timeline-title"
    >
      <Container>
        <SectionHeading
          id="admission-timeline-title"
          title="Lộ trình trở thành sinh viên Topica"
          subtitle="5 bước đơn giản để bắt đầu hành trình học tập"
          align="center"
          titleClassName="text-white"
          subtitleClassName="text-white/70"
        />

        <div className="mx-auto mt-10 max-w-5xl sm:mt-12">
          <div className="relative">
            {/* Horizontal line behind circles (desktop only) */}
            <div className="absolute top-6 right-[9.375%] left-[9.375%] z-0 hidden h-[2px] bg-white/20 lg:block" />

            <div
              className="relative grid grid-cols-1 gap-7 lg:grid-cols-5 lg:gap-4"
              role="list"
            >
              {admissionSteps.map((step, index) => {
                const IconComponent = iconMap[step.icon] || CheckCircle;
                return (
                  <ScrollReveal key={step.step} delay={index * 0.1}>
                    <div
                      className="relative flex flex-row items-start gap-4 rounded-lg border border-white/15 bg-white/5 p-4 shadow-xs lg:flex-col lg:items-center lg:gap-0 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
                      role="listitem"
                    >
                      {/* Align the connector with the numbered node: card padding (16px) + node radius (24px). */}
                      {index < admissionSteps.length - 1 && (
                        <div
                          aria-hidden="true"
                          className="absolute z-0 w-[2px] bg-gold-300/50 lg:hidden"
                          style={{
                            left: "calc(2.5rem - 1px)",
                            top: "2.5rem",
                            bottom: "calc(-2.5rem - 1.75rem)",
                          }}
                        />
                      )}

                      <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-gold-300 bg-gold-400 font-bold text-navy-950 shadow-[0_0_0_6px_rgba(196,159,99,0.12)] lg:mx-auto">
                        {index + 1}
                      </div>

                      <div className="relative z-10 flex-1 pt-2 lg:mt-3 lg:pt-0">
                        <div className="flex justify-start lg:justify-center">
                          <IconComponent className="h-6 w-6 text-gold-300" />
                        </div>
                        <h3 className="mt-2 text-left font-semibold text-white lg:text-center">
                          {step.title}
                        </h3>
                        <p className="mt-1 max-w-[180px] text-left text-body-sm text-white/70 lg:mx-auto lg:text-center">
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

        <ScrollReveal delay={0.12}>
        <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-white/15 bg-navy-900/80 px-5 py-6 text-center shadow-lg shadow-black/10 lg:mt-16 sm:px-8 sm:py-7">
          <p className="text-body-sm font-semibold text-gold-300">
            Sẵn sàng bắt đầu lộ trình của bạn?
          </p>
          <div className="mx-auto mt-4 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
            <ButtonLink
              href="https://www.tuyensinh.topicauni.edu.vn/"
              external
              variant="primary"
              size="lg"
              className="w-full justify-center hover:-translate-y-0.5 hover:shadow-md"
            >
              Đăng ký xét tuyển
            </ButtonLink>
            <ButtonLink
              href="/tuyen-sinh/hoc-phi-hoc-bong/"
              variant="secondary"
              size="lg"
              className="w-full justify-center border-white/30 bg-white/5 text-white hover:-translate-y-0.5 hover:border-gold-300 hover:bg-white/10 hover:shadow-md"
            >
              Tra cứu học phí & học bổng
            </ButtonLink>
          </div>
        </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
