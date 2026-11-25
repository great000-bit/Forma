"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { BuildPreview } from "@/components/marketing/build-preview";

/**
 * The framed stage under the hero. As it scrolls into place it tilts flat,
 * grows to full size and the blue light underneath brightens.
 */
export function HeroStage() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.25"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  const rotateX = useTransform(p, [0, 1], [reduce ? 0 : 14, 0]);
  const scale = useTransform(p, [0, 1], [reduce ? 1 : 0.92, 1]);
  const glow = useTransform(p, [0, 1], [0.35, 1]);

  return (
    <div ref={ref} className="[perspective:1600px]">
      <motion.div
        style={{ rotateX, scale, transformOrigin: "50% 0%" }}
        className="stage relative overflow-hidden rounded-[28px] border border-border p-3 sm:p-6 md:p-12 lg:p-16"
      >
        <motion.div
          style={{ opacity: glow }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(ellipse_60%_70%_at_50%_100%,rgba(47,107,255,0.45),transparent_70%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[960px]">
          <BuildPreview variant="compact" />
        </div>
      </motion.div>
    </div>
  );
}
