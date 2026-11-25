"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Keyboard, Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeech } from "@/components/builder/use-speech";
import type { Answer, InterviewResponse } from "@/lib/ai/contracts";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
  One question at a time, large and centred. Mic first with a text fallback,
  a thin step indicator, and back / skip on every question.
*/

type Props = {
  niche: string | null;
  answers: Answer[];
  onAnswers: (answers: Answer[]) => void;
  onNiche: (niche: string) => void;
  onDone: () => void;
};

export function Interview({ niche, answers, onAnswers, onNiche, onDone }: Props) {
  const [turn, setTurn] = useState<InterviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const speech = useSpeech(useCallback((text: string) => setDraft((d) => (d ? `${d} ${text}` : text)), []));

  const ask = useCallback(
    async (current: Answer[]) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/ai/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ niche: niche ?? undefined, answers: current }),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Request failed");
        const data = (await res.json()) as InterviewResponse;
        if (data.niche && !niche) onNiche(data.niche);
        if (data.done) onDone();
        else setTurn(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
      } finally {
        setLoading(false);
      }
    },
    [niche, onDone, onNiche],
  );

  useEffect(() => {
    // Fetch the first (or resumed) question once on mount. The timeout keeps
    // state updates out of the effect body and dedupes Strict Mode's double run.
    const id = window.setTimeout(() => void ask(answers), 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (skipped = false) => {
    if (!turn?.next) return;
    const text = draft.trim();
    if (!skipped && !text) {
      setTyping(true);
      inputRef.current?.focus();
      return;
    }
    speech.stop();
    const next = [...answers, { topic: turn.next.topic, question: turn.next.question, answer: skipped ? "" : text, skipped }];
    onAnswers(next);
    setDraft("");
    void ask(next);
  };

  const back = () => {
    const last = answers[answers.length - 1];
    if (!last) return;
    const previous = answers.slice(0, -1);
    onAnswers(previous);
    setDraft(last.answer);
    setTurn((t) => (t ? { ...t, next: { topic: last.topic, question: last.question }, progress: { ...t.progress, answered: previous.length } } : t));
  };

  const step = (turn?.progress.answered ?? answers.length) + 1;
  const total = Math.max(turn?.progress.total ?? 10, step);
  const showText = typing || !speech.supported;

  return (
    <div className="mx-auto flex min-h-[70dvh] w-full max-w-prose flex-col justify-center px-6 py-12">
      <div className="mb-10 flex items-center gap-4">
        <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-border" aria-hidden="true">
          <motion.div className="h-full origin-left bg-accent" animate={{ scaleX: Math.min(step / total, 1) }} transition={{ duration: 0.4, ease }} />
        </div>
        <span className="text-caption text-text-muted tabular-nums">
          {step} of {total}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.h2
          key={turn?.next?.question ?? (loading ? "loading" : "empty")}
          className="text-center text-h2-m md:text-h2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease }}
          aria-live="polite"
        >
          {loading && !turn ? <span className="text-text-muted">Getting your first question…</span> : turn?.next?.question}
        </motion.h2>
      </AnimatePresence>

      {error ? (
        <p role="alert" className="mt-6 text-center text-body-sm text-error">
          {error}{" "}
          <button type="button" className="underline" onClick={() => void ask(answers)}>Try again</button>
        </p>
      ) : null}

      <div className="mt-10 flex flex-col items-center gap-6">
        {speech.supported && !typing ? (
          <>
            <button
              type="button"
              onClick={speech.listening ? speech.stop : speech.start}
              disabled={loading}
              aria-pressed={speech.listening}
              aria-label={speech.listening ? "Stop recording" : "Answer by voice"}
              className={cn(
                "flex size-16 cursor-pointer items-center justify-center rounded-full bg-accent text-accent-text shadow-pop transition-transform duration-150 ease-out hover:-translate-y-px disabled:opacity-50",
              )}
            >
              {speech.listening ? <Square className="size-5" aria-hidden="true" /> : <Mic className="size-6" aria-hidden="true" />}
            </button>
            {speech.listening ? (
              <div className="flex h-6 items-end gap-1" aria-hidden="true">
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1 rounded-full bg-accent"
                    animate={{ height: [6, 22, 10, 18, 6] }}
                    transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.08, ease: "easeInOut" }}
                  />
                ))}
              </div>
            ) : null}
            {draft || speech.interim ? (
              <p className="text-center text-body-lg text-text">
                {draft} <span className="text-text-muted">{speech.interim}</span>
              </p>
            ) : null}
            {speech.error ? <p className="text-body-sm text-error">{speech.error}</p> : null}
            <button type="button" onClick={() => setTyping(true)} className="inline-flex items-center gap-2 text-label text-text-soft hover:text-text">
              <Keyboard className="size-4" aria-hidden="true" /> Type instead
            </button>
          </>
        ) : null}

        {showText ? (
          <label className="w-full">
            <span className="sr-only">Your answer</span>
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              rows={4}
              maxLength={2000}
              placeholder="Type your answer"
              autoFocus
              className="min-h-30 w-full rounded-control border border-border bg-surface p-4 text-body text-text placeholder:text-text-muted hover:border-border-strong focus-visible:border-accent"
            />
          </label>
        ) : null}

        <div className="flex w-full items-center justify-between gap-3">
          <Button variant="ghost" onClick={back} disabled={answers.length === 0 || loading}>
            <ArrowLeft aria-hidden="true" /> Back
          </Button>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => submit(true)} disabled={loading || !turn?.next}>Skip</Button>
            <Button onClick={() => submit()} loading={loading && Boolean(turn)} disabled={!turn?.next}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
