"use client";

import { useRef, useState, KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/data/testimonials";
import { cn } from "@/components/ui/cn";

import type { Testimonial } from "@/data/testimonials";

interface TestimonialSectionProps {
  data?: readonly Testimonial[];
}

export function TestimonialSection({ data }: TestimonialSectionProps) {
  const items = data && data.length > 0 ? data : testimonials;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const scrollContainer = scrollRef.current;
    const cards = scrollContainer.children;
    if (cards.length > index) {
      const targetCard = cards[index] as HTMLElement;
      scrollContainer.scrollTo({
        left: targetCard.offsetLeft - scrollContainer.offsetLeft,
        behavior: "smooth",
      });
      setActiveIndex(index);
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollContainer = scrollRef.current;
    const scrollLeft = scrollContainer.scrollLeft;
    const containerWidth = scrollContainer.clientWidth;
    const newIndex = Math.round(scrollLeft / containerWidth);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < testimonials.length) {
      setActiveIndex(newIndex);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      scrollToIndex(Math.max(0, activeIndex - 1));
    } else if (e.key === "ArrowRight") {
      scrollToIndex(Math.min(testimonials.length - 1, activeIndex + 1));
    }
  };

  return (
    <section className="bg-canvas py-16 lg:py-24" aria-label="Testimonials">
      <Container>
        <SectionHeading title="Sinh viên nói gì về Topica?" align="center" />

        <div className="group relative mt-12 flex justify-center">
          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory [scrollbar-width:none] gap-6 overflow-x-auto scroll-smooth pb-8 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:w-max"
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="region"
            aria-label="Testimonial slider"
          >
            {items.map((testimonial) => (
              <div
                key={testimonial.id}
                className="w-[85vw] max-w-[350px] min-w-[280px] shrink-0 snap-center sm:w-[350px]"
              >
                <div className="flex h-full flex-col rounded-lg border border-line-200 bg-paper p-6">
                  <div className="font-display text-[3rem] leading-none text-brand-300">&quot;</div>
                  <p className="mt-2 flex-grow text-body text-ink-800">{testimonial.quote}</p>

                  <div className="mt-6 flex items-center gap-4">
                    {testimonial.avatar ? (
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
                        {testimonial.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-ink-950">{testimonial.name}</div>
                      <div className="text-body-sm text-ink-600">{testimonial.role}</div>
                      {testimonial.program && (
                        <div className="text-body-sm text-brand-700">{testimonial.program}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
            className="absolute top-1/2 -left-5 z-10 flex hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line-200 bg-canvas shadow-xs transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
            disabled={activeIndex === 0}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5 text-ink-800" />
          </button>

          <button
            onClick={() => scrollToIndex(Math.min(items.length - 1, activeIndex + 1))}
            className="absolute top-1/2 -right-5 z-10 flex hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line-200 bg-canvas shadow-xs transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
            disabled={activeIndex === items.length - 1}
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5 text-ink-800" />
          </button>
        </div>

        <div className="mt-4 flex justify-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                index === activeIndex ? "bg-brand-500" : "bg-line-200",
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
