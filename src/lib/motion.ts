import type { Transition, Variants } from "motion/react";

export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  spring: [0.34, 1.56, 0.64, 1] as const,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const pageTransition: Transition = {
  duration: 0.32,
  ease: ease.out,
};

export const itemTransition: Transition = {
  duration: 0.5,
  ease: ease.out,
};
