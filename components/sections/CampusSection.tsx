import { MapPin, Phone, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { campuses, contactInfo } from "@/data/campuses";

export function CampusSection() {
  return (
    <section className="bg-paper py-16 lg:py-24">
      <Container>
        <SectionHeading
          title="Hệ thống trung tâm"
          subtitle="Topica có mặt tại 6 thành phố lớn trên cả nước"
          align="center"
        />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campuses.map((campus, index) => (
            <ScrollReveal key={campus.city} delay={index * 0.1}>
              <div className="flex h-full flex-col rounded-lg border border-line-200 bg-canvas p-5 transition-shadow hover:shadow-sm sm:p-6">
                <h3 className="font-sans text-body-lg font-bold text-ink-950">{campus.city}</h3>

                <div className="mt-2 flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                  <span className="text-body-sm text-ink-600">{campus.address}</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Shared contact info — verified from topicauni.edu.vn footer */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-body-sm text-ink-600">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-brand-500" />
            <a
              href={`tel:${contactInfo.phone}`}
              className="transition-colors hover:text-brand-600"
            >
              {contactInfo.phone}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-brand-500" />
            <a
              href={`mailto:${contactInfo.email}`}
              className="transition-colors hover:text-brand-600"
            >
              {contactInfo.email}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
