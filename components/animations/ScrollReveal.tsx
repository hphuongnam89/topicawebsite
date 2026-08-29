import type { CSSProperties } from "react";

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
  return (
    <div
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
