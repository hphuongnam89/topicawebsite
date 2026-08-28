"use client";

import { useMemo } from "react";
import { motion, type Variants } from "motion/react";
import { fadeUp, slideInLeft, slideInRight, scaleIn, imageReveal } from "@/lib/motion";

const variantMap: Record<string, Variants> = {
  fadeUp,
  slideInLeft,
  slideInRight,
  scaleIn,
  imageReveal,
};

type ScrollRevealProps = {
  variant?: keyof typeof variantMap;
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
  const selectedVariant = variantMap[variant] ?? fadeUp;

  const customVariant = useMemo((): Variants => {
    if (!delay) return selectedVariant;

    // Clone to safely add delay without modifying original
    const visible =
      typeof selectedVariant.visible === "object"
        ? { ...selectedVariant.visible }
        : selectedVariant.visible;

    if (typeof visible === "object" && visible !== null) {
      const visibleObj = visible as Record<string, unknown>;
      const existingTransition = (visibleObj.transition as Record<string, unknown>) ?? {};
      visibleObj.transition = { ...existingTransition, delay };
    }

    return {
      ...selectedVariant,
      visible,
    };
  }, [selectedVariant, delay]);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: viewportMargin }}
      variants={customVariant}
      className={className}
    >
      {children}
    </motion.div>
  );
}
