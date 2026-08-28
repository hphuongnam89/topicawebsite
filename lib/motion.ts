import type { Transition, Variants } from "motion/react";

export const standardEase: [number, number, number, number] = [0.2, 0, 0, 1];
export const emphasizedEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const transitions = {
  fast: { duration: 0.12, ease: standardEase },
  base: { duration: 0.18, ease: standardEase },
  slow: { duration: 0.28, ease: standardEase },
  enter: { duration: 0.42, ease: emphasizedEase },
} satisfies Record<string, Transition>;

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: transitions.enter },
} satisfies Variants;

export const imageReveal = {
  hidden: { opacity: 0, scale: 1.02 },
  visible: { opacity: 1, scale: 1, transition: transitions.enter },
} satisfies Variants;

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: transitions.enter },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: transitions.enter },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: transitions.enter },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const cardHover = {
  y: -2,
  transition: transitions.base,
};
