import type { Variants } from "framer-motion";

export const ease = [0.22, 1, 0.36, 1] as const;

/** Rise, fade and un-blur. Soft and quick, never bouncy. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease } },
};

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export const buildSection: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};
