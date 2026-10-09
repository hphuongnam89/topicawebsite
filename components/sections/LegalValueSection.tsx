import { DegreeImage } from "@/components/ui/DegreeImage";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { homepageContent } from "@/data/homepage-content";
import { isPublicClaimApproved } from "@/CONTENT_SOURCE_OF_TRUTH";

export function LegalValueSection() {
  if (!isPublicClaimApproved("degree.issuer")) return null;
  return (
    <section className="bg-canvas py-16 sm:py-20 lg:py-24" aria-labelledby="legal-value-title">
      <Container>
        <div className="grid gap-10 border-y border-line-200 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16 lg:py-14 xl:gap-20">
          <div className="space-y-8">
            <ScrollReveal variant="slideInLeft">
              <div className="flex items-start gap-4">
                <ShieldCheck className="mt-1 h-8 w-8 shrink-0 text-brand-700" aria-hidden="true" />
                <div>
                  <p className="text-body-sm font-semibold tracking-[0.14em] text-brand-700 uppercase">
                    Giá trị bằng cấp & chất lượng
                  </p>
                  <h2
                    id="legal-value-title"
                    className="mt-4 max-w-[11ch] font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] font-semibold text-ink-950"
                  >
                    {homepageContent.legal.title}
                  </h2>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.06}>
              <p className="max-w-xl text-body-lg leading-relaxed text-ink-600">
                {homepageContent.legal.description}
              </p>
              <a
                href={homepageContent.legal.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-body-sm font-semibold text-brand-800 underline decoration-brand-300 underline-offset-4"
              >
                Xem nguồn chính thức
                <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
              </a>
            </ScrollReveal>
          </div>
          <ScrollReveal variant="scaleIn" delay={0.12} className="max-w-full min-w-0">
            <DegreeImage />
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
