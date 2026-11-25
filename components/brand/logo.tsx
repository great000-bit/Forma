"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ease } from "@/lib/motion";

/*
  Stand-in for the official mark: a lowercase f made of three rounded blocks.
  Stem and crossbar follow the text color (Ink in light, Paper in dark);
  the top arm is always Signal. Replace with /brand/logo files when available.
*/
const blocks = {
  stem: { x: 5, y: 3, width: 5, height: 18, rx: 2.5 },
  crossbar: { x: 2, y: 9.5, width: 13, height: 4.5, rx: 2.25 },
  arm: { x: 11.5, y: 3, width: 8.5, height: 4.5, rx: 2.25 },
};

export function LogoMark({
  className,
  animated = false,
}: {
  className?: string;
  animated?: boolean;
}) {
  if (!animated) {
    return (
      <svg viewBox="0 0 24 24" className={cn("size-6", className)} aria-hidden="true">
        <rect {...blocks.stem} fill="var(--text)" />
        <rect {...blocks.crossbar} fill="var(--text)" />
        <rect {...blocks.arm} fill="var(--signal)" />
      </svg>
    );
  }

  // Assembly order: stem, crossbar, then the Signal arm. 600ms total.
  const piece = (delay: number) => ({
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay, ease },
  });

  return (
    <svg viewBox="0 0 24 24" className={cn("size-6", className)} aria-hidden="true">
      <motion.g {...piece(0)}>
        <rect {...blocks.stem} fill="var(--text)" />
      </motion.g>
      <motion.g {...piece(0.1)}>
        <rect {...blocks.crossbar} fill="var(--text)" />
      </motion.g>
      <motion.g {...piece(0.25)}>
        <rect {...blocks.arm} fill="var(--signal)" />
      </motion.g>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="font-display text-[22px] leading-none font-medium tracking-[-0.04em] text-text">
        forma
      </span>
    </span>
  );
}
