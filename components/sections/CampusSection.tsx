import { LocalizedText } from "@/components/i18n/LocalizedText";
import { MapPin, Phone, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import {
  campuses as defaultCampuses,
  contactChannels as defaultChannels,
  type Campus,
} from "@/data/campuses";
import type { ContactChannels } from "@/lib/services/public-site";

export function CampusSection({
  channels: contactChannels = defaultChannels,
  locations: campuses = defaultCampuses,
}: { channels?: ContactChannels; locations?: readonly Campus[] } = {}) {
  return (
    <section className="bg-paper py-16 lg:py-24" aria-labelledby="campus-title">
      <Container>
        <SectionHeading
          id="campus-title"
          title="Hệ thống trung tâm"
          subtitle="Địa điểm hỗ trợ và thông tin liên hệ"
          align="center"
        />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campuses.map((campus, index) => (
            <ScrollReveal key={`${campus.city}-${campus.address}`} delay={index * 0.1}>
              <article className="flex h-full flex-col rounded-lg border border-line-200 bg-canvas p-5 transition-all hover:border-gold-400 hover:shadow-md sm:p-6">
                <h3 className="font-sans text-body-lg font-bold text-ink-950"><LocalizedText>{campus.city}</LocalizedText></h3>

                <div className="mt-2 flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                  <span className="text-body-sm text-ink-600"><LocalizedText>{campus.address}</LocalizedText></span>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>

        {/* Shared contact info — unified by role */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 text-body-sm text-ink-600 sm:flex-row sm:flex-wrap sm:gap-6">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gold-500" />
            <span><LocalizedText>Hotline tư vấn:</LocalizedText></span>
            <a
              href={contactChannels.admissionsHotline.href}
              className="font-bold text-navy-900 transition-colors hover:text-gold-700 focus-visible:outline-navy-500"
            >
              <LocalizedText>{contactChannels.admissionsHotline.value}</LocalizedText>
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gold-500" />
            <span><LocalizedText>Tư vấn nhanh:</LocalizedText></span>
            <a
              href={contactChannels.admissionsDirect.href}
              className="font-bold text-navy-900 transition-colors hover:text-gold-700 focus-visible:outline-navy-500"
            >
              <LocalizedText>{contactChannels.admissionsDirect.value}</LocalizedText>
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gold-500" />
            <a
              href={contactChannels.admissionsEmail.href}
              className="rounded-sm font-medium transition-colors hover:text-navy-900 focus-visible:outline-navy-500"
            >
              <LocalizedText>{contactChannels.admissionsEmail.value}</LocalizedText>
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
