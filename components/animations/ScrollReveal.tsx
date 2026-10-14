"use client";

import { useEffect, useRef, type CSSProperties } from "react";

type ScrollRevealProps = {
  variant?: "fadeUp" | "slideInLeft" | "slideInRight" | "scaleIn" | "imageReveal";
  delay?: number;
  className?: string;
  children: React.ReactNode;
  viewportMargin?: string;
};

export function ScrollReveal({
  variant = "fadeUp",
  delay,
  className,
  children,
  viewportMargin = "-64px",
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      element.dataset.scrollReady = "true";
      element.dataset.scrollVisible = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          target.dataset.scrollReady = "true";
          target.dataset.scrollVisible = String(entry.isIntersecting);
        }
      },
      { rootMargin: `${viewportMargin} 0px ${viewportMargin} 0px`, threshold: 0.08 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [viewportMargin]);

  return (
    <div
      ref={elementRef}
      className={`scroll-reveal${className ? ` ${className}` : ""}`}
      data-reveal={variant}
      style={
        {
          "--reveal-delay": `${Math.min(delay ?? 0, 0.24)}s`,
          "--reveal-margin": viewportMargin,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
