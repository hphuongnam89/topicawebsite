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
  const revealDelay = Math.min(delay ?? 0, 0.24).toString();

  return (
    <div
      className={`scroll-reveal${className ? ` ${className}` : ""}`}
      data-reveal={variant}
      data-reveal-delay={revealDelay}
      data-reveal-margin={viewportMargin}
    >
      {children}
    </div>
  );
}
