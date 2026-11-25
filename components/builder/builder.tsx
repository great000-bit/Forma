"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { BuildView } from "@/components/builder/build-view";
import { Interview } from "@/components/builder/interview";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { Answer } from "@/lib/ai/contracts";
import { WAITLIST_NICHE_OPTIONS } from "@/lib/niches";
import type { Portfolio } from "@/lib/portfolio/schema";

type Stage = "niche" | "interview" | "build";
type Saved = { stage: Stage; niche: string | null; answers: Answer[]; portfolio: Portfolio | null; savedId: string | null };

// Until accounts land (Phase 2), progress lives in this browser tab only.
const KEY = "forma.builder.v1";
const blank: Saved = { stage: "niche", niche: null, answers: [], portfolio: null, savedId: null };

function load(): Saved {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? { ...blank, ...(JSON.parse(raw) as Saved) } : blank;
  } catch {
    return blank;
  }
}

const noopSubscribe = () => () => {};

export function Builder() {
  // sessionStorage only exists in the browser; render nothing on the server.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [saved, setSaved] = useState<Saved | null>(null);
  const loaded = useMemo(() => (mounted ? load() : null), [mounted]);
  const state = saved ?? loaded;

  useEffect(() => {
    if (!saved) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify(saved));
    } catch {
      // Private mode or full storage: keep going in memory.
    }
  }, [saved]);

  const patch = useCallback((p: Partial<Saved>) => setSaved((s) => ({ ...(s ?? loaded ?? blank), ...p })), [loaded]);
  const restart = () => {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      // Nothing stored.
    }
    setSaved(blank);
  };

  if (!state) return <div className="min-h-dvh" />;

  return (
    <div id="main" className="min-h-dvh bg-bg">
      <header className="flex h-16 items-center justify-between border-b border-border px-6">
        <Link href="/" aria-label="Forma home"><Logo /></Link>
        {state.stage !== "niche" ? (
          <Button variant="ghost" size="sm" onClick={restart}>Start over and delete answers</Button>
        ) : null}
      </header>

      {state.stage === "niche" ? (
        <div className="mx-auto flex min-h-[70dvh] max-w-[480px] flex-col justify-center gap-6 px-6 py-12">
          <h1 className="text-h1-m md:text-h1">What do you do?</h1>
          <p className="text-body-lg text-text-soft">Pick your field, or skip and Forma will work it out from your answers.</p>
          <Select value={state.niche ?? ""} onChange={(e) => patch({ niche: e.target.value || null })} aria-label="Your field">
            <option value="">Not sure, figure it out</option>
            {WAITLIST_NICHE_OPTIONS.filter((o) => o.value !== "other").map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
          <Button size="lg" onClick={() => patch({ stage: "interview" })}>Start talking</Button>
          <p className="text-body-sm text-text-muted">About ten short questions. Answer by voice or by typing.</p>
        </div>
      ) : null}

      {state.stage === "interview" ? (
        <Interview
          niche={state.niche}
          answers={state.answers}
          onAnswers={(answers) => patch({ answers })}
          onNiche={(niche) => patch({ niche })}
          onDone={() => patch({ stage: "build" })}
        />
      ) : null}

      {state.stage === "build" ? (
        <BuildView
          niche={state.niche ?? "other"}
          answers={state.answers}
          initial={state.portfolio}
          initialSavedId={state.savedId}
          onPortfolio={(portfolio) => patch({ portfolio })}
          onSaved={(savedId) => patch({ savedId })}
          onRestart={restart}
        />
      ) : null}
    </div>
  );
}
