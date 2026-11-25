"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Sparkles, Undo2 } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { PortfolioView } from "@/components/portfolio/portfolio-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { buildEventSchema, type Answer } from "@/lib/ai/contracts";
import { ease } from "@/lib/motion";
import { applyOps, type Op } from "@/lib/portfolio/ops";
import { emptyPortfolio, SECTION_IDS, type Portfolio, type SectionId } from "@/lib/portfolio/schema";
import { cn } from "@/lib/utils";
import { getTemplate, templatesFor } from "@/templates/catalog";

const LABELS: Record<SectionId, string> = {
  profile: "Profile",
  about: "About",
  skills: "Skills",
  projects: "Projects",
  experience: "Experience",
  contact: "Contact",
};

type Phase = "pending" | "active" | "done";

/** Reads a text/event-stream response and yields parsed JSON payloads. */
async function* readEvents(res: Response) {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const chunk = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const line = chunk.split("\n").find((l) => l.startsWith("data:"));
      if (line) yield JSON.parse(line.slice(5).trim()) as unknown;
    }
  }
}

function Skeleton({ id }: { id: SectionId }) {
  const rows = id === "projects" ? ["h-48", "h-48"] : id === "profile" ? ["h-10 w-3/5", "h-5 w-2/5"] : ["h-4", "h-4 w-11/12", "h-4 w-3/4"];
  return (
    <div className={cn("flex flex-col gap-3", id === "projects" && "grid gap-6 sm:grid-cols-2")} aria-hidden="true">
      {rows.map((r, i) => (
        <div key={i} className={cn("skeleton", r)} />
      ))}
    </div>
  );
}

export function BuildView({ niche, answers, initial, initialSavedId, onPortfolio, onSaved, onRestart }: {
  niche: string;
  answers: Answer[];
  initial: Portfolio | null;
  initialSavedId: string | null;
  onPortfolio: (p: Portfolio) => void;
  onSaved: (id: string) => void;
  onRestart: () => void;
}) {
  const [templateId] = useState(() => initial?.templateId ?? templatesFor(niche)[0]!.id);
  const [portfolio, setPortfolio] = useState<Portfolio>(() => initial ?? emptyPortfolio(niche, templateId, getTemplate(templateId).theme));
  const [phases, setPhases] = useState<Record<SectionId, Phase>>(() =>
    Object.fromEntries(SECTION_IDS.map((id) => [id, initial ? "done" : "pending"])) as Record<SectionId, Phase>,
  );
  const [status, setStatus] = useState(initial ? "Your portfolio is ready" : "Starting");
  const [finished, setFinished] = useState(Boolean(initial));
  const [error, setError] = useState<string | null>(null);
  // Keep the latest callback without restarting (and aborting) the build stream.
  const onPortfolioRef = useRef(onPortfolio);
  useEffect(() => {
    onPortfolioRef.current = onPortfolio;
  }, [onPortfolio]);

  // Edit state
  const [instruction, setInstruction] = useState("");
  const [editing, setEditing] = useState(false);
  const [editNote, setEditNote] = useState<string | null>(null);
  const [history, setHistory] = useState<Portfolio[]>([]);

  useEffect(() => {
    if (initial) return;
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch("/api/ai/build", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ niche, templateId, answers }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new Error((await res.json().catch(() => null))?.error ?? "Build failed");

        for await (const raw of readEvents(res)) {
          const parsed = buildEventSchema.safeParse(raw);
          if (!parsed.success) continue;
          const event = parsed.data;
          if (event.type === "status") {
            setStatus(event.text);
            setPhases((p) => ({ ...p, [event.step]: "active" }));
          } else if (event.type === "section") {
            setPortfolio((p) => ({ ...p, sections: { ...p.sections, [event.id]: event.data } as Portfolio["sections"] }));
            setPhases((p) => ({ ...p, [event.id]: "done" }));
          } else if (event.type === "done") {
            setPortfolio(event.portfolio);
            onPortfolioRef.current(event.portfolio);
            setStatus("Your portfolio is ready");
            setFinished(true);
          } else {
            setError(event.message);
          }
        }
      } catch (e) {
        if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Build failed");
      }
    })();

    return () => controller.abort();
  }, [answers, initial, niche, templateId]);

  const update = (next: Portfolio) => {
    setHistory((h) => [...h.slice(-19), portfolio]);
    setPortfolio(next);
    onPortfolio(next);
  };

  const runEdit = async () => {
    if (instruction.trim().length < 2) return;
    setEditing(true);
    setEditNote(null);
    try {
      const res = await fetch("/api/ai/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolio, instruction }),
      });
      const data = (await res.json()) as { ops?: Op[]; summary?: string; error?: string };
      if (!res.ok || !data.ops) throw new Error(data.error ?? "That edit didn't work");
      if (data.ops.length > 0) update(applyOps(portfolio, data.ops));
      setEditNote(data.summary || "Done");
      setInstruction("");
    } catch (e) {
      setEditNote(e instanceof Error ? e.message : "That edit didn't work");
    } finally {
      setEditing(false);
    }
  };

  const [savedId, setSavedId] = useState<string | null>(initialSavedId);
  const [saving, setSaving] = useState(false);
  const [saveNote, setSaveNote] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setSaveNote(null);
    try {
      const res = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: savedId ?? undefined, portfolio, answers }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
      if (res.status === 401) return setSaveNote("signin");
      if (!res.ok || !data.id) throw new Error(data.error ?? "Couldn't save right now.");
      setSavedId(data.id);
      onSaved(data.id);
      setSaveNote("Saved to your dashboard.");
    } catch (e) {
      setSaveNote(e instanceof Error ? e.message : "Couldn't save right now.");
    } finally {
      setSaving(false);
    }
  };

  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setHistory((h) => h.slice(0, -1));
    setPortfolio(previous);
    onPortfolio(previous);
  };

  const done = SECTION_IDS.filter((id) => phases[id] === "done").length;

  const renderSection = (id: SectionId, node: ReactNode) => {
    const phase = phases[id];
    return (
      <div className="relative">
        {phase === "done" ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
            {node}
          </motion.div>
        ) : (
          <Skeleton id={id} />
        )}
        <AnimatePresence>
          {phase === "active" ? (
            <motion.span
              key="pulse"
              className="pointer-events-none absolute -inset-3 rounded-[14px] ring-2 ring-accent/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.35, 1, 0.35] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            />
          ) : null}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="mx-auto grid w-full max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:px-6">
      <aside className="relative flex flex-col gap-6 overflow-hidden rounded-card border border-border bg-surface p-6 shadow-card lg:sticky lg:top-6 lg:max-h-[calc(100dvh-48px)] lg:self-start lg:p-8">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-border" aria-hidden="true">
          <motion.div className="h-full origin-left bg-accent" animate={{ scaleX: done / SECTION_IDS.length }} transition={{ duration: 0.8, ease }} />
        </div>
        <div className="flex items-center gap-3">
          <LogoMark animated />
          <span className="text-label text-text">{finished ? "Your portfolio is ready" : "Building your portfolio"}</span>
        </div>

        <ul className="flex flex-col gap-1">
          {SECTION_IDS.map((id) => (
            <li key={id} className={cn("flex h-11 items-center gap-3 rounded-control px-3", phases[id] === "active" && "bg-accent-soft")}>
              {phases[id] === "done" ? (
                <span className="flex size-5 items-center justify-center rounded-full bg-accent text-accent-text"><Check className="size-3" strokeWidth={2.5} /></span>
              ) : phases[id] === "active" ? (
                <Loader2 className="size-5 animate-spin text-accent" />
              ) : (
                <span className="size-5 rounded-full border-[1.5px] border-border-strong" />
              )}
              <span className={cn("text-body-sm", phases[id] === "pending" ? "text-text-muted" : "text-text")}>{LABELS[id]}</span>
            </li>
          ))}
        </ul>

        <p className="font-mono text-body-sm text-text-muted" aria-live="polite">{error ?? status}</p>

        {error ? (
          <Button variant="secondary" onClick={onRestart}>Start over</Button>
        ) : null}

        {finished ? (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-label text-text">Template</span>
              <Select
                value={portfolio.templateId}
                onChange={(e) => {
                  const t = getTemplate(e.target.value);
                  update({ ...portfolio, templateId: t.id, theme: { ...portfolio.theme, ...t.theme } });
                }}
              >
                {templatesFor(niche).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </label>

            <form
              className="flex flex-col gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void runEdit();
              }}
            >
              <label htmlFor="ai-edit" className="text-label text-text">Tell Forma what to change</label>
              <Input id="ai-edit" value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="Make my bio shorter" maxLength={500} />
              <div className="flex gap-2">
                <Button type="submit" loading={editing} className="flex-1"><Sparkles aria-hidden="true" /> Apply</Button>
                <Button type="button" variant="secondary" onClick={undo} disabled={history.length === 0} aria-label="Undo last change"><Undo2 aria-hidden="true" /></Button>
              </div>
              {editNote ? <p className="text-body-sm text-text-soft" aria-live="polite">{editNote}</p> : null}
            </form>

            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <Button onClick={() => void save()} loading={saving} variant={savedId ? "secondary" : "primary"}>
                {savedId ? "Save changes" : "Save to my dashboard"}
              </Button>
              {saveNote ? (
                <p className="text-body-sm text-text-soft" aria-live="polite">
                  {saveNote === "signin" ? (
                    <>
                      <a href="/login?next=/builder" className="font-medium text-accent hover:underline">Sign in</a> to save. Your portfolio stays here while you do.
                    </>
                  ) : (
                    saveNote
                  )}
                </p>
              ) : null}
              {savedId ? (
                <Button asChild variant="secondary">
                  <a href={`/editor/${savedId}`}>Open the editor</a>
                </Button>
              ) : (
                <p className="text-body-sm text-text-muted">Save to keep editing by hand and publish later.</p>
              )}
            </div>
          </div>
        ) : null}
      </aside>

      <div className="overflow-hidden rounded-card border border-border bg-surface shadow-pop">
        <div className="flex h-11 items-center gap-2 border-b border-border bg-bg px-4" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-border-strong" />
          <span className="size-2.5 rounded-full bg-border-strong" />
          <span className="size-2.5 rounded-full bg-border-strong" />
          <span className="mx-auto inline-flex h-7 items-center rounded-full border border-border bg-surface px-3 font-mono text-caption text-text-muted">
            {(portfolio.sections.profile.name.split(" ")[0] || "you").toLowerCase()}.forma.app
          </span>
        </div>
        <PortfolioView portfolio={portfolio} renderSection={renderSection} showBadge />
      </div>
    </div>
  );
}
