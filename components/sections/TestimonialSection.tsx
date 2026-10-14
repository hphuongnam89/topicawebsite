"use client";

import { useCallback, useEffect, useRef, useState, KeyboardEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/data/testimonials";
import { cn } from "@/components/ui/cn";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

import type { Testimonial } from "@/data/testimonials";

interface TestimonialSectionProps {
  data?: readonly Testimonial[];
}

export function TestimonialSection({ data }: TestimonialSectionProps) {
  const providedItems = (data ?? []).filter(
    (item) =>
      !item.isSample &&
      !/chờ xác nhận|tên minh họa|nội dung mẫu/i.test(
        `${item.name} ${item.role} ${item.program} ${item.quote}`,
      ),
  );
  const items = providedItems.length > 0 ? providedItems : testimonials;
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = useCallback((index: number) => {
    if (!scrollRef.current) return;
    const scrollContainer = scrollRef.current;
    const cards = scrollContainer.children;
    if (cards.length > index) {
      const targetCard = cards[index] as HTMLElement;
      scrollContainer.scrollTo({
        left: targetCard.offsetLeft - scrollContainer.offsetLeft,
        behavior: "smooth",
      });
      activeIndexRef.current = index;
      setActiveIndex(index);
    }
  }, []);

  useEffect(() => {
    if (items.length < 2) return;

    const intervalId = window.setInterval(() => {
      scrollToIndex((activeIndexRef.current + 1) % items.length);
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, [items.length, scrollToIndex]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollContainer = scrollRef.current;
    const scrollLeft = scrollContainer.scrollLeft + scrollContainer.offsetLeft;
    const newIndex = Array.from(scrollContainer.children).reduce((closestIndex, child, index) => {
      const closest = scrollContainer.children[closestIndex] as HTMLElement | undefined;
      const currentDistance = Math.abs((child as HTMLElement).offsetLeft - scrollLeft);
      const closestDistance = closest ? Math.abs(closest.offsetLeft - scrollLeft) : Infinity;
      return currentDistance < closestDistance ? index : closestIndex;
    }, 0);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < items.length) {
      activeIndexRef.current = newIndex;
      setActiveIndex(newIndex);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      scrollToIndex(Math.max(0, activeIndex - 1));
    } else if (e.key === "ArrowRight") {
      scrollToIndex(Math.min(items.length - 1, activeIndex + 1));
    }
  };

  return (
    <section className="bg-canvas py-16 lg:py-24" aria-labelledby="testimonials-title">
      <Container>
        <SectionHeading
          id="testimonials-title"
          title="Sinh viên nói gì về Topica?"
          align="center"
        />

        <ScrollReveal variant="scaleIn">
          <div className="group relative mt-12 flex justify-center">
            <div
              ref={scrollRef}
              className="flex w-full snap-x snap-mandatory [scrollbar-width:none] gap-6 overflow-x-auto scroll-smooth pb-8 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              role="region"
              aria-label="Chia sẻ của sinh viên"
              aria-roledescription="carousel"
            >
              {items.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="w-[85vw] max-w-[350px] min-w-[280px] shrink-0 snap-center sm:w-[350px] lg:w-[calc((100%_-_3rem)_/_3)] lg:max-w-none lg:min-w-0"
                >
                  <div className="flex h-full flex-col rounded-lg border border-line-200 bg-paper p-6 transition-all hover:border-gold-300 hover:shadow-md">
                    <div className="font-display text-[3rem] leading-none text-gold-500">
                      &quot;
                    </div>
                    <p className="mt-2 flex-grow text-body text-ink-800">{testimonial.quote}</p>

                    <div className="mt-6 flex items-center gap-4">
                      {testimonial.avatar ? (
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-gold-200"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-100 font-semibold text-navy-900">
                          {testimonial.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-ink-950">{testimonial.name}</div>
                        <div className="text-body-sm text-ink-600">{testimonial.role}</div>
                        {testimonial.program && (
                          <div className="text-body-sm font-medium text-gold-700">
                            {testimonial.program}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
              className="absolute top-1/2 -left-5 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line-200 bg-canvas shadow-xs transition-[background-color,transform] hover:border-gold-400 hover:bg-gold-50 focus-visible:outline-navy-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
              disabled={activeIndex === 0}
              aria-label="Chia sẻ trước"
            >
              <ChevronLeft className="h-5 w-5 text-ink-800" />
            </button>

            <button
              onClick={() => scrollToIndex(Math.min(items.length - 1, activeIndex + 1))}
              className="absolute top-1/2 -right-5 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line-200 bg-canvas shadow-xs transition-[background-color,transform] hover:border-gold-400 hover:bg-gold-50 focus-visible:outline-navy-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
              disabled={activeIndex === items.length - 1}
              aria-label="Chia sẻ tiếp theo"
            >
              <ChevronRight className="h-5 w-5 text-ink-800" />
            </button>
          </div>
        </ScrollReveal>

        <div className="mt-4 flex justify-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className="flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-navy-500"
              aria-label={`Xem chia sẻ ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full transition-[width,background-color]",
                  index === activeIndex ? "w-6 bg-navy-900" : "bg-line-200",
                )}
              />
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}
