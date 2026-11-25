"use client";

import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" forcedTheme="dark" defaultTheme="dark" disableTransitionOnChange>
      {/* "user" swaps movement for a plain fade when prefers-reduced-motion is on */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  );
}
