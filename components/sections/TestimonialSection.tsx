import { ExternalLink, Quote } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { testimonials } from "@/data/testimonials";
import type { Testimonial } from "@/data/testimonials";

interface TestimonialSectionProps {
  data?: readonly Testimonial[];
}

export function TestimonialSection({ data }: TestimonialSectionProps) {
  const items = data && data.length > 0 ? data : testimonials;
  const [featured, ...supporting] = items;
  if (!featured) return null;

  return (
    <section className="bg-canvas py-16 sm:py-20 lg:py-24" aria-labelledby="testimonials-title">
      <Container>
        <div className="grid min-w-0 gap-8 border-t-2 border-ink-950 pt-8 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)] lg:gap-16">
          <header className="min-w-0">
            <p className="text-body-sm font-semibold tracking-[0.12em] text-brand-700 uppercase">
              Cảm nhận người học
            </p>
            <h2
              id="testimonials-title"
              className="mt-4 max-w-[12ch] font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.08] font-semibold text-ink-950"
            >
              Người học nói về trải nghiệm tại Topica
            </h2>
            <p className="mt-5 max-w-md text-body text-ink-600">
              Các chia sẻ dưới đây được dẫn lại từ trang chủ chính thức và gắn liên kết để bạn tự
              kiểm tra nguồn.
            </p>
          </header>
          <div className="min-w-0">
            <figure className="border-b border-line-200 pb-8">
              <Quote className="h-8 w-8 text-brand-500" aria-hidden="true" />
              <blockquote className="mt-5 font-display text-[clamp(1.4rem,2.5vw,2rem)] leading-relaxed text-ink-950">
                {featured.quote}
              </blockquote>
              <figcaption className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <span>
                  <strong className="block text-ink-950">{featured.name}</strong>
                  <span className="text-body-sm text-ink-600">
                    {featured.role} · {featured.program}
                  </span>
                </span>
                <SourceLink testimonial={featured} />
              </figcaption>
            </figure>
            <div className="grid min-w-0 gap-8 pt-8 md:grid-cols-2">
              {supporting.map((testimonial) => (
                <figure key={testimonial.id} className="min-w-0 border-l-2 border-brand-300 pl-5">
                  <blockquote className="text-body leading-relaxed text-ink-800">
                    {testimonial.quote}
                  </blockquote>
                  <figcaption className="mt-5">
                    <strong className="block text-ink-950">{testimonial.name}</strong>
                    <span className="text-body-sm text-ink-600">
                      {testimonial.role} · {testimonial.program}
                    </span>
                    <SourceLink testimonial={testimonial} />
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function SourceLink({ testimonial }: { testimonial: Testimonial }) {
  return (
    <a
      href={testimonial.sourceUrl}
      target="_blank"
      rel="noreferrer"
      data-track="official_source_click"
      data-track-label={`Cảm nhận ${testimonial.name}`}
      className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold whitespace-nowrap text-brand-800 underline decoration-brand-300 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info"
    >
      Xem nguồn chính thức
      <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}
