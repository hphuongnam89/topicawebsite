import Image from "next/image";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { homepageContent } from "@/data/homepage-content";

export function LegalValueSection() {
  return (
    <section className="bg-canvas py-16 sm:py-20 lg:py-24" aria-labelledby="legal-value-title">
      <Container>
        <div className="grid gap-10 border-y border-line-200 py-10 lg:grid-cols-[minmax(18rem,0.75fr)_minmax(0,1.25fr)] lg:items-center lg:gap-16 lg:py-14 xl:gap-20">
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
          <div className="grid items-center gap-8 lg:grid-cols-1 xl:grid-cols-[minmax(0,0.72fr)_minmax(20rem,1.28fr)] xl:gap-10">
            <ScrollReveal delay={0.06}>
              <p className="max-w-xl text-body-lg leading-relaxed text-ink-600">
                {homepageContent.legal.description}
                <a
                  href={homepageContent.legal.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex min-h-11 items-center text-body-sm font-semibold text-brand-800 underline decoration-brand-300 underline-offset-4"
                >
                  Xem thông tin nguồn chính thức
                  <ExternalLink className="ml-1.5 h-4 w-4" aria-hidden="true" />
                </a>
              </p>
            </ScrollReveal>
            <ScrollReveal variant="scaleIn" delay={0.12}>
              <Image
                src="/official-assets/mau-phoi-bang.png"
                alt="Mẫu phôi bằng cử nhân của Trường Đại học Phú Xuân theo phương thức đào tạo từ xa"
                width={1254}
                height={1254}
                className="h-auto w-full rounded-2xl border border-line-200 bg-canvas shadow-sm"
              />
            </ScrollReveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
