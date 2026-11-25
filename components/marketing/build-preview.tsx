"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { Check, Loader2, Mic } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
  Landing-page simulation of the live build (DESIGN_SYSTEM section 8).
  Same order and states as the real builder; content is a fictional sample.
*/

const STEPS = [
  { label: "Profile", status: "Setting up your profile" },
  { label: "About", status: "Writing your about section" },
  { label: "Skills", status: "Listing your skills" },
  { label: "Projects", status: "Laying out your projects" },
  { label: "Experience", status: "Adding your experience" },
  { label: "Contact", status: "Connecting your contact links" },
] as const;

const DONE = STEPS.length;
const START_MS = 1000;
const STEP_MS = 2400;
const HOLD_MS = 4500;

const SAMPLE = {
  initials: "AO",
  name: "Amara Okafor",
  role: "Product designer in Lagos",
  about:
    "I design fintech and health products for people on budget phones and patchy networks. Six years in, I still start every project by watching someone use the old version.",
  skills: ["Product strategy", "Interaction design", "Prototyping", "Design systems", "Usability testing"],
  projects: [
    { title: "Ledgerline", summary: "Rebuilt onboarding for a savings app. Sign-ups doubled in a quarter." },
    { title: "Queue", summary: "Patient check-in for busy clinics, built to work offline." },
  ],
  experience: [
    { role: "Senior Product Designer", org: "Fintech startup", years: "2023 to now" },
    { role: "Product Designer", org: "Health agency", years: "2020 to 2023" },
  ],
  contact: ["Email", "WhatsApp", "LinkedIn"],
};

type Phase = "pending" | "active" | "done";

const phaseFor = (index: number, step: number): Phase =>
  step > index ? "done" : step === index ? "active" : "pending";

function useBuildLoop(running: boolean) {
  const [state, setState] = useState({ step: -1, run: 0 });

  useEffect(() => {
    if (!running) return;
    const { step } = state;
    const delay = step === -1 ? START_MS : step >= DONE ? HOLD_MS : STEP_MS;
    const id = window.setTimeout(() => {
      setState((s) => (s.step >= DONE ? { step: -1, run: s.run + 1 } : { ...s, step: s.step + 1 }));
    }, delay);
    return () => window.clearTimeout(id);
  }, [state, running]);

  return state;
}

/** Types text in. Full text is laid out invisibly underneath so nothing reflows. */
function Typed({ text, delay = 0, speed = 14 }: { text: string; delay?: number; speed?: number }) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduce) return;
    let interval: number | undefined;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        setCount((c) => {
          if (c >= text.length) {
            window.clearInterval(interval);
            return c;
          }
          return c + 1;
        });
      }, speed);
    }, delay);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [text, delay, speed, reduce]);

  return (
    <span className="grid">
      <span className="invisible [grid-area:1/1]">{text}</span>
      <span className="[grid-area:1/1]">{reduce ? text : text.slice(0, count)}</span>
    </span>
  );
}

/** Headings type first, body follows once the heading has finished. */
function Text({ phase, text, after = 0 }: { phase: Phase; text: string; after?: number }) {
  return phase === "active" ? <Typed text={text} delay={after} /> : <>{text}</>;
}

const typingTime = (text: string) => text.length * 14 + 150;

function Block({
  phase,
  skeleton,
  children,
  sectionRef,
}: {
  phase: Phase;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  sectionRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div ref={sectionRef} className="relative">
      {phase === "pending" ? (
        skeleton
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          {children}
        </motion.div>
      )}
      <AnimatePresence>
        {phase === "active" ? (
          <motion.span
            key="outline"
            className="pointer-events-none absolute -inset-3 rounded-[14px] ring-2 ring-accent/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.35, 1, 0.35] }}
            exit={{ opacity: 0, transition: { duration: 0.4, ease } }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-caption tracking-[0.08em] text-text-muted uppercase">{children}</p>;
}

function Sk({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

function Portfolio({
  step,
  sectionRef,
}: {
  step: number;
  sectionRef: (index: number) => (el: HTMLDivElement | null) => void;
}) {
  const p = (i: number) => phaseFor(i, step);

  return (
    <div className="flex flex-col gap-12">
      {/* Profile */}
      <Block
        phase={p(0)}
        sectionRef={sectionRef(0)}
        skeleton={
          <div className="flex flex-col gap-4">
            <Sk className="size-16 rounded-full" />
            <Sk className="h-8 w-3/5" />
            <Sk className="h-4 w-2/5" />
            <div className="flex gap-3 pt-2">
              <Sk className="h-10 w-32 rounded-full" />
              <Sk className="h-10 w-28 rounded-full" />
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-accent-soft text-h4 text-accent">
            {SAMPLE.initials}
          </div>
          <h3 className="text-h3-m sm:text-h1-m">
            <Text phase={p(0)} text={SAMPLE.name} />
          </h3>
          <p className="text-body-lg text-text-soft">
            <Text phase={p(0)} text={SAMPLE.role} after={typingTime(SAMPLE.name)} />
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <span className="inline-flex h-10 items-center rounded-full bg-text px-5 text-label text-bg">
              Get in touch
            </span>
            <span className="inline-flex h-10 items-center rounded-full border border-border px-5 text-label text-text">
              See my work
            </span>
          </div>
        </div>
      </Block>

      {/* About */}
      <Block
        phase={p(1)}
        sectionRef={sectionRef(1)}
        skeleton={
          <div className="flex flex-col gap-3">
            <Sk className="h-3 w-16" />
            <Sk className="h-4 w-full" />
            <Sk className="h-4 w-11/12" />
            <Sk className="h-4 w-3/4" />
          </div>
        }
      >
        <Caption>About</Caption>
        <p className="max-w-prose text-body text-text-soft">
          <Text phase={p(1)} text={SAMPLE.about} />
        </p>
      </Block>

      {/* Skills */}
      <Block
        phase={p(2)}
        sectionRef={sectionRef(2)}
        skeleton={
          <div className="flex flex-col gap-3">
            <Sk className="h-3 w-14" />
            <div className="flex flex-wrap gap-2">
              {["w-28", "w-36", "w-24", "w-32", "w-30"].map((w) => (
                <Sk key={w} className={cn("h-8 rounded-full", w)} />
              ))}
            </div>
          </div>
        }
      >
        <Caption>Skills</Caption>
        <ul className="flex flex-wrap gap-2">
          {SAMPLE.skills.map((skill, i) => (
            <motion.li
              key={skill}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.12, ease }}
              className="inline-flex h-8 items-center rounded-full border border-border bg-bg px-3 text-body-sm text-text-soft"
            >
              {skill}
            </motion.li>
          ))}
        </ul>
      </Block>

      {/* Projects */}
      <Block
        phase={p(3)}
        sectionRef={sectionRef(3)}
        skeleton={
          <div className="flex flex-col gap-3">
            <Sk className="h-3 w-20" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Sk className="h-48 rounded-[14px]" />
              <Sk className="h-48 rounded-[14px]" />
            </div>
          </div>
        }
      >
        <Caption>Selected work</Caption>
        <div className="grid gap-4 sm:grid-cols-2">
          {SAMPLE.projects.map((project, i) => (
            <div key={project.title} className="overflow-hidden rounded-[14px] border border-border bg-white/[0.03]">
              <div className="relative h-28 bg-accent-soft">
                <div
                  className={cn(
                    "absolute rounded-chip bg-surface shadow-sm",
                    i === 0 ? "inset-x-8 top-6 bottom-0" : "top-6 bottom-0 left-1/2 w-20 -translate-x-1/2",
                  )}
                />
              </div>
              <div className="p-4">
                <p className="text-label text-text">
                  <Text phase={p(3)} text={project.title} after={i * 900} />
                </p>
                <p className="mt-1 text-body-sm text-text-soft">
                  <Text phase={p(3)} text={project.summary} after={i * 900 + typingTime(project.title)} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </Block>

      {/* Experience */}
      <Block
        phase={p(4)}
        sectionRef={sectionRef(4)}
        skeleton={
          <div className="flex flex-col gap-3">
            <Sk className="h-3 w-24" />
            <Sk className="h-12 w-full" />
            <Sk className="h-12 w-full" />
          </div>
        }
      >
        <Caption>Experience</Caption>
        <ul className="divide-y divide-border border-y border-border">
          {SAMPLE.experience.map((job, i) => (
            <li key={job.role} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
              <span className="text-label text-text">
                <Text phase={p(4)} text={`${job.role}, ${job.org}`} after={i * 700} />
              </span>
              <span className="text-body-sm text-text-muted tabular-nums">{job.years}</span>
            </li>
          ))}
        </ul>
      </Block>

      {/* Contact */}
      <Block
        phase={p(5)}
        sectionRef={sectionRef(5)}
        skeleton={
          <div className="flex flex-col gap-3">
            <Sk className="h-7 w-1/2" />
            <div className="flex gap-3">
              <Sk className="h-10 w-24 rounded-full" />
              <Sk className="h-10 w-28 rounded-full" />
              <Sk className="h-10 w-24 rounded-full" />
            </div>
          </div>
        }
      >
        <h4 className="text-h4">
          <Text phase={p(5)} text="Let's work together" />
        </h4>
        <div className="mt-4 flex flex-wrap gap-3">
          {SAMPLE.contact.map((label) => (
            <span
              key={label}
              className="inline-flex h-10 items-center rounded-full border border-border px-4 text-label text-text"
            >
              {label}
            </span>
          ))}
        </div>
      </Block>
    </div>
  );
}

function StepIcon({ phase }: { phase: Phase }) {
  if (phase === "done") {
    return (
      <span className="flex size-5 items-center justify-center rounded-full bg-accent text-accent-text">
        <Check className="size-3" strokeWidth={2.5} />
      </span>
    );
  }
  if (phase === "active") return <Loader2 className="size-5 animate-spin text-accent" />;
  return <span className="size-5 rounded-full border-[1.5px] border-border-strong" />;
}

function StatusText({ step, className }: { step: number; className?: string }) {
  const text =
    step < 0 ? "Getting ready" : step >= DONE ? "Your portfolio is ready" : STEPS[step]?.status ?? "";
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={text}
        className={className}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2, ease }}
      >
        {text}
      </motion.span>
    </AnimatePresence>
  );
}

function ProgressLine({ progress, className }: { progress: number; className?: string }) {
  return (
    <div className={cn("h-0.5 overflow-hidden bg-border", className)}>
      <motion.div
        className="h-full origin-left bg-accent"
        initial={false}
        animate={{ scaleX: progress }}
        transition={{ duration: 0.8, ease }}
      />
    </div>
  );
}

export function BuildPreview({
  variant = "full",
  className,
}: {
  variant?: "full" | "compact";
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionEls = useRef<(HTMLDivElement | null)[]>([]);
  const inView = useInView(rootRef, { amount: 0.3 });
  const reduce = useReducedMotion();
  const { step, run } = useBuildLoop(inView);
  const y = useMotionValue(0);

  const progress = step < 0 ? 0 : step >= DONE ? 1 : (step + 0.5) / DONE;
  const done = step >= DONE;

  // Keep the section being written in view by gliding the page inside the frame.
  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;
    const max = Math.max(0, content.scrollHeight - viewport.clientHeight);
    const el = step >= 0 && step < DONE ? sectionEls.current[step] : null;
    const target = el ? Math.min(max, Math.max(0, el.offsetTop - 40)) : 0;
    const controls = animate(y, -target, { duration: reduce ? 0 : 0.9, ease });
    return () => controls.stop();
  }, [step, run, y, reduce]);

  const sectionRef = (index: number) => (el: HTMLDivElement | null) => {
    sectionEls.current[index] = el;
  };

  const frame = (
    <div className="glass overflow-hidden rounded-card">
      <div className="flex h-11 items-center gap-2 border-b border-border bg-black/40 px-4">
        <span className="size-2.5 rounded-full bg-border-strong" />
        <span className="size-2.5 rounded-full bg-border-strong" />
        <span className="size-2.5 rounded-full bg-border-strong" />
        <span className="mx-auto inline-flex h-7 items-center rounded-full border border-border bg-surface px-3 font-mono text-caption font-normal tracking-normal text-text-muted">
          amara.forma.app
        </span>
        <span className="w-12" />
      </div>
      <ProgressLine progress={progress} className="bg-transparent" />
      <div ref={viewportRef} className="relative h-[440px] overflow-hidden bg-black/70 sm:h-[520px]">
        <motion.div
          key={run}
          ref={contentRef}
          style={{ y }}
          className="relative px-6 pt-8 pb-16 sm:px-10 sm:pt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease }}
        >
          <Portfolio step={step} sectionRef={sectionRef} />
        </motion.div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black to-transparent" />

        {variant === "compact" ? (
          <div className="absolute inset-x-0 bottom-5 flex justify-center px-4">
            <div className="glow-edge inline-flex h-11 max-w-full items-center gap-3 rounded-full bg-[rgba(10,16,40,0.85)] px-4 backdrop-blur-xl">
              {done ? (
                <span className="flex size-5 items-center justify-center rounded-full bg-accent text-accent-text">
                  <Check className="size-3" strokeWidth={2.5} />
                </span>
              ) : (
                <LogoMark className="size-5" />
              )}
              <StatusText step={step} className="truncate text-body-sm text-text" />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <p className="sr-only">
        Animated example of Forma building a sample portfolio, one section at a time.
      </p>
      <div aria-hidden="true">
        {variant === "compact" ? (
          frame
        ) : (
          <div className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-6">
            {/* AI panel, desktop */}
            <div className="glass relative hidden flex-col overflow-hidden rounded-card p-8 lg:flex">
              <ProgressLine progress={progress} className="absolute inset-x-0 top-0" />
              <div className="flex items-center gap-3">
                <LogoMark key={run} animated />
                <span className="text-label text-text">Building your portfolio</span>
              </div>

              <ul className="mt-8 flex flex-col gap-1">
                {STEPS.map((s, i) => {
                  const phase = phaseFor(i, step);
                  return (
                    <li
                      key={s.label}
                      className={cn(
                        "flex h-11 items-center gap-3 rounded-control px-3 transition-colors duration-300 ease-out",
                        phase === "active" && "bg-accent-soft",
                      )}
                    >
                      <StepIcon phase={phase} />
                      <span
                        className={cn(
                          "text-body-sm transition-colors duration-300 ease-out",
                          phase === "pending" && "text-text-muted",
                          phase === "active" && "font-medium text-text",
                          phase === "done" && "text-text-soft",
                        )}
                      >
                        {s.label}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 min-h-6">
                <StatusText step={step} className="block font-mono text-body-sm text-text-muted" />
              </div>

              <AnimatePresence>
                {done ? (
                  <motion.div
                    className="mt-4 flex gap-3"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease }}
                  >
                    <span className="inline-flex h-9 items-center rounded-control border border-border bg-surface px-4 text-label text-text">
                      Edit
                    </span>
                    <span className="inline-flex h-9 items-center rounded-control bg-accent px-4 text-label text-accent-text">
                      Publish
                    </span>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="glow-edge mt-auto flex h-12 items-center gap-3 rounded-full bg-[rgba(10,16,40,0.7)] pr-1.5 pl-4 text-body-sm text-text-muted">
                <span className="flex-1 truncate">Tell Forma what to change</span>
                <span className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-text">
                  <Mic className="size-4" />
                </span>
              </div>
            </div>

            {frame}

            {/* AI status strip, mobile and tablet */}
            <div className="glass overflow-hidden rounded-card lg:hidden">
              <ProgressLine progress={progress} />
              <div className="flex h-14 items-center gap-3 px-4">
                {done ? (
                  <StepIcon phase="done" />
                ) : step < 0 ? (
                  <LogoMark className="size-5" />
                ) : (
                  <StepIcon phase="active" />
                )}
                <StatusText step={step} className="flex-1 truncate text-body-sm text-text" />
                <span className="text-caption text-text-muted tabular-nums">
                  {Math.min(Math.max(step + 1, 0), DONE)} of {DONE}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
