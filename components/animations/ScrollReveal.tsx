"use client";

import { motion, useReducedMotion } from "motion/react";

type ScrollRevealProps = {
  variant?: "fadeUp" | "slideInLeft" | "slideInRight" | "scaleIn" | "imageReveal";
  delay?: number;
  className?: string;
  children: React.ReactNode;
  viewportMargin?: string;
  viewportAmount?: "some" | "all" | number;
};

export function ScrollReveal({
  variant = "fadeUp",
  delay,
  className,
  children,
  viewportMargin = "0px 0px -8% 0px",
  viewportAmount = 0.15,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const revealDelay = Math.min(delay ?? 0, 0.18);
  const initial =
    variant === "slideInLeft"
      ? { opacity: 0, x: -18 }
      : variant === "slideInRight"
        ? { opacity: 0, x: 18 }
        : variant === "scaleIn" || variant === "imageReveal"
          ? { opacity: 0, scale: 0.985 }
          : { opacity: 0, y: 16 };

  return (
    <motion.div
      className={`scroll-reveal${className ? ` ${className}` : ""}`}
      initial={shouldReduceMotion ? false : initial}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: viewportAmount, margin: viewportMargin }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.52, delay: revealDelay, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {children}
    </motion.div>
  );
}
