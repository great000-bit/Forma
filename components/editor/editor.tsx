"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Eye,
  EyeOff,
  Monitor,
  Palette,
  Plus,
  Redo2,
  Smartphone,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";
import { PublishDialog } from "@/components/editor/publish-dialog";
import { PortfolioView } from "@/components/portfolio/portfolio-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { applyOps, type Op } from "@/lib/portfolio/ops";
import {
  AVAILABILITY,
  PROJECT_LABELS,
  portfolioSchema,
  SECTION_IDS,
  type Portfolio,
  type SectionId,
} from "@/lib/portfolio/schema";
import { cn } from "@/lib/utils";
import { getTemplate, templatesFor } from "@/templates/catalog";

const LABELS: Record<SectionId | "design", string> = {
  profile: "Profile",
  about: "About",
  skills: "Skills",
  projects: "Projects",
  experience: "Experience",
  contact: "Contact",
  design: "Design",
};

const STATUS_TEXT: Record<(typeof AVAILABILITY)[number], string> = {
  open: "Open to work",
  freelance: "Available for freelance",
  booked: "Booked",
  "not-looking": "Not looking",
  unknown: "Don't show",
};

type Save = "saved" | "saving" | "unsaved" | "invalid" | "error";

// ---------- small field helpers ----------

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-label text-text">{label}</span>
      {children}
      {hint ? <span className="text-caption text-text-muted">{hint}</span> : null}
    </label>
  );
}

function TextArea(props: React.ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className="min-h-30 w-full rounded-control border border-border bg-surface p-4 text-body text-text placeholder:text-text-muted hover:border-border-strong focus-visible:border-accent"
    />
  );
}

const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

// ---------- editor ----------

export function Editor({ id, initial, published }: { id: string; initial: Portfolio; published: { slug: string; url: string } | null }) {
  const [draft, setDraft] = useState<Portfolio>(initial);
  const [past, setPast] = useState<Portfolio[]>([]);
  const [future, setFuture] = useState<Portfolio[]>([]);
  const [selected, setSelected] = useState<SectionId | "design">("profile");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [save, setSave] = useState<Save>("saved");
  const [saveError, setSaveError] = useState("");
  const [command, setCommand] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiNote, setAiNote] = useState("");
  const lastSaved = useRef(JSON.stringify(initial));

  /** Every change goes through here so undo works everywhere. */
  const commit = (next: Portfolio) => {
    setPast((p) => [...p.slice(-49), draft]);
    setFuture([]);
    setDraft(next);
  };

  const edit = (mutate: (p: Portfolio) => void) => {
    const next = structuredClone(draft);
    mutate(next);
    commit(next);
  };

  const undo = () => {
    const prev = past[past.length - 1];
    if (!prev) return;
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [draft, ...f]);
    setDraft(prev);
  };
  const redo = () => {
    const next = future[0];
    if (!next) return;
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, draft]);
    setDraft(next);
  };

  // Autosave: 1.2s after the last valid change.
  useEffect(() => {
    const json = JSON.stringify(draft);
    if (json === lastSaved.current) return;
    const valid = portfolioSchema.safeParse(draft);
    const timer = window.setTimeout(async () => {
      if (!valid.success) {
        setSave("invalid");
        setSaveError(valid.error.issues[0]?.message ?? "Check the highlighted fields");
        return;
      }
      setSave("saving");
      try {
        const res = await fetch(`/api/portfolios/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(valid.data),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Couldn't save");
        lastSaved.current = json;
        setSave("saved");
      } catch (e) {
        setSave("error");
        setSaveError(e instanceof Error ? e.message : "Couldn't save");
      }
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [draft, id]);

  // Keyboard shortcuts for undo / redo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select")) return; // let fields handle their own undo
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const runCommand = async () => {
    const valid = portfolioSchema.safeParse(draft);
    if (!valid.success || command.trim().length < 2) return;
    setAiBusy(true);
    setAiNote("");
    try {
      const res = await fetch("/api/ai/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolio: valid.data, instruction: command }),
      });
      const data = (await res.json()) as { ops?: Op[]; summary?: string; error?: string };
      if (!res.ok || !data.ops) throw new Error(data.error ?? "That didn't work");
      if (data.ops.length) commit(applyOps(valid.data, data.ops));
      setAiNote(data.summary || "Done");
      setCommand("");
    } catch (e) {
      setAiNote(e instanceof Error ? e.message : "That didn't work");
    } finally {
      setAiBusy(false);
    }
  };

  const move = (sid: SectionId, dir: -1 | 1) =>
    edit((p) => {
      const i = p.layout.order.indexOf(sid);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= p.layout.order.length) return;
      [p.layout.order[i], p.layout.order[j]] = [p.layout.order[j]!, p.layout.order[i]!];
    });

  const toggleHidden = (sid: SectionId) =>
    edit((p) => {
      p.layout.hidden = p.layout.hidden.includes(sid) ? p.layout.hidden.filter((h) => h !== sid) : [...p.layout.hidden, sid];
    });

  const s = draft.sections;
  const saveLabel = { saved: "Saved", saving: "Saving…", unsaved: "Unsaved", invalid: saveError, error: saveError }[save];

  // Order shown in the sidebar includes any section missing from layout.order.
  const order = [...draft.layout.order, ...SECTION_IDS.filter((x) => !draft.layout.order.includes(x))];

  return (
    <div className="flex h-dvh flex-col bg-bg">
      {/* Top bar */}
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface px-4">
        <Button asChild variant="ghost" size="icon" aria-label="Back to dashboard">
          <Link href="/dashboard"><ArrowLeft className="size-5!" aria-hidden="true" /></Link>
        </Button>
        <div className="hidden items-center gap-1 rounded-control border border-border p-1 sm:flex" role="group" aria-label="Preview size">
          {(["desktop", "mobile"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDevice(d)}
              aria-pressed={device === d}
              aria-label={d === "desktop" ? "Desktop preview" : "Mobile preview"}
              className={cn("flex size-9 items-center justify-center rounded-chip text-text-muted", device === d && "bg-accent-soft text-accent")}
            >
              {d === "desktop" ? <Monitor className="size-4" /> : <Smartphone className="size-4" />}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="icon" onClick={undo} disabled={past.length === 0} aria-label="Undo"><Undo2 className="size-5!" /></Button>
        <Button variant="ghost" size="icon" onClick={redo} disabled={future.length === 0} aria-label="Redo"><Redo2 className="size-5!" /></Button>

        <form
          className="mx-auto flex max-w-[520px] flex-1 items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void runCommand();
          }}
        >
          <label htmlFor="ai-command" className="sr-only">Tell Forma what to change</label>
          <Input id="ai-command" value={command} onChange={(e) => setCommand(e.target.value)} placeholder="Tell Forma what to change" className="h-10" maxLength={500} />
          <Button type="submit" size="sm" loading={aiBusy} aria-label="Apply AI change"><Sparkles aria-hidden="true" /></Button>
        </form>

        <span className={cn("hidden max-w-[220px] truncate text-body-sm md:block", save === "error" || save === "invalid" ? "text-error" : "text-text-muted")} aria-live="polite">
          {saveLabel}
        </span>
        <PublishDialog id={id} name={draft.sections.profile.name} published={published} />
      </header>
      {aiNote ? <p className="border-b border-border bg-accent-soft px-4 py-2 text-center text-body-sm text-text" aria-live="polite">{aiNote}</p> : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
        {/* Sections */}
        <nav aria-label="Sections" className="hidden w-[240px] shrink-0 flex-col gap-1 overflow-y-auto border-r border-border bg-surface p-3 md:flex">
          {order.map((sid, i) => {
            const hidden = draft.layout.hidden.includes(sid);
            return (
              <div key={sid} className={cn("group flex items-center gap-1 rounded-control pr-1", selected === sid && "bg-accent-soft")}>
                <button type="button" onClick={() => setSelected(sid)} className={cn("flex h-11 flex-1 items-center px-3 text-left text-body-sm", hidden ? "text-text-muted line-through" : "text-text")}>
                  {LABELS[sid]}
                </button>
                <button type="button" onClick={() => move(sid, -1)} disabled={i === 0} aria-label={`Move ${LABELS[sid]} up`} className="flex size-8 items-center justify-center rounded-chip text-text-muted hover:text-text disabled:opacity-30"><ArrowUp className="size-4" /></button>
                <button type="button" onClick={() => move(sid, 1)} disabled={i === order.length - 1} aria-label={`Move ${LABELS[sid]} down`} className="flex size-8 items-center justify-center rounded-chip text-text-muted hover:text-text disabled:opacity-30"><ArrowDown className="size-4" /></button>
                <button type="button" onClick={() => toggleHidden(sid)} aria-label={hidden ? `Show ${LABELS[sid]}` : `Hide ${LABELS[sid]}`} className="flex size-8 items-center justify-center rounded-chip text-text-muted hover:text-text">
                  {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            );
          })}
          <div className="my-2 h-px bg-border" />
          <button type="button" onClick={() => setSelected("design")} className={cn("flex h-11 items-center gap-2 rounded-control px-3 text-body-sm text-text", selected === "design" && "bg-accent-soft")}>
            <Palette className="size-4 text-text-muted" aria-hidden="true" /> Design
          </button>
        </nav>

        {/* Preview */}
        <div className="min-w-0 flex-1 p-4 md:overflow-y-auto md:p-6">
          <div className={cn("mx-auto overflow-hidden rounded-card border border-border shadow-pop transition-[max-width] duration-300 ease-out", device === "mobile" ? "max-w-[390px]" : "max-w-[1200px]")}>
            <PortfolioView portfolio={draft} showBadge />
          </div>
        </div>

        {/* Fields */}
        <aside aria-label={`${LABELS[selected]} fields`} className="w-full shrink-0 border-t border-border bg-surface p-6 md:max-w-[380px] md:overflow-y-auto md:border-t-0 md:border-l">
          <div className="mb-6 md:hidden">
            <Select aria-label="Section to edit" value={selected} onChange={(e) => setSelected(e.target.value as SectionId | "design")}>
              {[...order, "design" as const].map((x) => <option key={x} value={x}>{LABELS[x]}</option>)}
            </Select>
          </div>
          <h2 className="mb-6 text-h4">{LABELS[selected]}</h2>

          {selected === "profile" ? (
            <div className="flex flex-col gap-5">
              <Field label="Name"><Input value={s.profile.name} onChange={(e) => edit((p) => void (p.sections.profile.name = e.target.value))} /></Field>
              <Field label="Role"><Input value={s.profile.role} onChange={(e) => edit((p) => void (p.sections.profile.role = e.target.value))} /></Field>
              <Field label="Location"><Input value={s.profile.location} onChange={(e) => edit((p) => void (p.sections.profile.location = e.target.value))} /></Field>
              <Field label="One-line intro" hint={`${s.profile.tagline.length}/160`}>
                <TextArea value={s.profile.tagline} maxLength={160} onChange={(e) => edit((p) => void (p.sections.profile.tagline = e.target.value))} />
              </Field>
              <Field label="Availability">
                <Select value={s.profile.status} onChange={(e) => edit((p) => void (p.sections.profile.status = e.target.value as Portfolio["sections"]["profile"]["status"]))}>
                  {AVAILABILITY.map((a) => <option key={a} value={a}>{STATUS_TEXT[a]}</option>)}
                </Select>
              </Field>
              <Field label="Photo URL" hint="Uploads arrive with storage in a later phase."><Input value={s.profile.avatarUrl ?? ""} onChange={(e) => edit((p) => void (p.sections.profile.avatarUrl = e.target.value || undefined))} placeholder="https://" /></Field>
            </div>
          ) : null}

          {selected === "about" ? (
            <Field label="About you" hint="Leave a blank line between paragraphs.">
              <TextArea rows={10} value={s.about.body} maxLength={1200} onChange={(e) => edit((p) => void (p.sections.about.body = e.target.value))} />
            </Field>
          ) : null}

          {selected === "skills" ? (
            <div className="flex flex-col gap-6">
              {s.skills.groups.map((g, gi) => (
                <div key={gi} className="flex flex-col gap-3 rounded-control border border-border p-4">
                  <Field label="Group name"><Input value={g.label} onChange={(e) => edit((p) => void (p.sections.skills.groups[gi]!.label = e.target.value))} /></Field>
                  <Field label="Skills" hint="Separate with commas."><Input defaultValue={g.items.join(", ")} onBlur={(e) => edit((p) => void (p.sections.skills.groups[gi]!.items = list(e.target.value)))} /></Field>
                  <Button variant="ghost" size="sm" onClick={() => edit((p) => void p.sections.skills.groups.splice(gi, 1))}><Trash2 aria-hidden="true" /> Remove group</Button>
                </div>
              ))}
              {s.skills.groups.length < 6 ? (
                <Button variant="secondary" onClick={() => edit((p) => void p.sections.skills.groups.push({ label: "", items: [] }))}><Plus aria-hidden="true" /> Add group</Button>
              ) : null}
            </div>
          ) : null}

          {selected === "projects" ? (
            <div className="flex flex-col gap-6">
              {s.projects.items.map((pr, pi) => (
                <details key={pr.id} className="rounded-control border border-border p-4" open={pi === 0}>
                  <summary className="cursor-pointer text-label text-text">{pr.title || "Untitled project"}</summary>
                  <div className="mt-4 flex flex-col gap-4">
                    <Field label="Title"><Input value={pr.title} onChange={(e) => edit((p) => void (p.sections.projects.items[pi]!.title = e.target.value))} /></Field>
                    <Field label="Company or client"><Input value={pr.context} onChange={(e) => edit((p) => void (p.sections.projects.items[pi]!.context = e.target.value))} /></Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Your role"><Input value={pr.role} onChange={(e) => edit((p) => void (p.sections.projects.items[pi]!.role = e.target.value))} /></Field>
                      <Field label="Year"><Input value={pr.year} onChange={(e) => edit((p) => void (p.sections.projects.items[pi]!.year = e.target.value))} /></Field>
                    </div>
                    <Field label="Summary"><TextArea value={pr.summary} maxLength={300} onChange={(e) => edit((p) => void (p.sections.projects.items[pi]!.summary = e.target.value))} /></Field>
                    <Field label="Result" hint="Only real outcomes."><Input value={pr.result} maxLength={160} onChange={(e) => edit((p) => void (p.sections.projects.items[pi]!.result = e.target.value))} /></Field>
                    <Field label="Tags" hint="Separate with commas."><Input defaultValue={pr.tags.join(", ")} onBlur={(e) => edit((p) => void (p.sections.projects.items[pi]!.tags = list(e.target.value).slice(0, 8)))} /></Field>
                    <Field label="Type">
                      <Select value={pr.label} onChange={(e) => edit((p) => void (p.sections.projects.items[pi]!.label = e.target.value as (typeof PROJECT_LABELS)[number]))}>
                        <option value="client">Client or employer work</option>
                        <option value="personal">Personal project</option>
                        <option value="practice">Practice project</option>
                        <option value="nda">Under NDA</option>
                      </Select>
                    </Field>
                    <Field label="Image URL"><Input value={pr.imageUrl ?? ""} placeholder="https://" onChange={(e) => edit((p) => void (p.sections.projects.items[pi]!.imageUrl = e.target.value || undefined))} /></Field>
                    <Field label="Link" hint="Case study, live site or prototype.">
                      <Input
                        value={pr.links[0]?.href ?? ""}
                        placeholder="https://"
                        onChange={(e) =>
                          edit((p) => {
                            const v = e.target.value.trim();
                            p.sections.projects.items[pi]!.links = v ? [{ label: pr.links[0]?.label || "View project", href: v }] : [];
                          })
                        }
                      />
                    </Field>
                    <Button variant="ghost" size="sm" onClick={() => edit((p) => void p.sections.projects.items.splice(pi, 1))}><Trash2 aria-hidden="true" /> Remove project</Button>
                  </div>
                </details>
              ))}
              {s.projects.items.length < 12 ? (
                <Button
                  variant="secondary"
                  onClick={() => edit((p) => void p.sections.projects.items.push({ id: `p${Date.now()}`, title: "New project", context: "", role: "", year: "", summary: "", result: "", tags: [], links: [], label: "client" }))}
                >
                  <Plus aria-hidden="true" /> Add project
                </Button>
              ) : null}
            </div>
          ) : null}

          {selected === "experience" ? (
            <div className="flex flex-col gap-6">
              {s.experience.items.map((job, ji) => (
                <div key={ji} className="flex flex-col gap-3 rounded-control border border-border p-4">
                  <Field label="Role"><Input value={job.role} onChange={(e) => edit((p) => void (p.sections.experience.items[ji]!.role = e.target.value))} /></Field>
                  <Field label="Company"><Input value={job.org} onChange={(e) => edit((p) => void (p.sections.experience.items[ji]!.org = e.target.value))} /></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="From"><Input value={job.start} onChange={(e) => edit((p) => void (p.sections.experience.items[ji]!.start = e.target.value))} /></Field>
                    <Field label="To"><Input value={job.end} placeholder="now" onChange={(e) => edit((p) => void (p.sections.experience.items[ji]!.end = e.target.value))} /></Field>
                  </div>
                  <Field label="What you did"><TextArea value={job.summary} maxLength={240} onChange={(e) => edit((p) => void (p.sections.experience.items[ji]!.summary = e.target.value))} /></Field>
                  <Button variant="ghost" size="sm" onClick={() => edit((p) => void p.sections.experience.items.splice(ji, 1))}><Trash2 aria-hidden="true" /> Remove</Button>
                </div>
              ))}
              {s.experience.items.length < 10 ? (
                <Button variant="secondary" onClick={() => edit((p) => void p.sections.experience.items.push({ role: "New role", org: "", start: "", end: "", summary: "" }))}><Plus aria-hidden="true" /> Add role</Button>
              ) : null}
            </div>
          ) : null}

          {selected === "contact" ? (
            <div className="flex flex-col gap-5">
              <Field label="Heading"><Input value={s.contact.heading} placeholder="Let's work together" onChange={(e) => edit((p) => void (p.sections.contact.heading = e.target.value))} /></Field>
              <Field label="Email"><Input type="email" value={s.contact.email ?? ""} onChange={(e) => edit((p) => void (p.sections.contact.email = e.target.value || undefined))} /></Field>
              <Field label="WhatsApp" hint="With country code, e.g. +234 803 000 0000"><Input inputMode="tel" value={s.contact.whatsapp ?? ""} onChange={(e) => edit((p) => void (p.sections.contact.whatsapp = e.target.value || undefined))} /></Field>
              <Field label="Phone"><Input inputMode="tel" value={s.contact.phone ?? ""} onChange={(e) => edit((p) => void (p.sections.contact.phone = e.target.value || undefined))} /></Field>
              <Field label="CV link"><Input value={s.contact.cvUrl ?? ""} placeholder="https://" onChange={(e) => edit((p) => void (p.sections.contact.cvUrl = e.target.value || undefined))} /></Field>
              <div className="flex flex-col gap-3">
                <span className="text-label text-text">Profile links</span>
                {s.contact.links.map((l, li) => (
                  <div key={li} className="grid grid-cols-[1fr_2fr_auto] gap-2">
                    <Input aria-label="Link label" value={l.label} placeholder="LinkedIn" onChange={(e) => edit((p) => void (p.sections.contact.links[li]!.label = e.target.value))} />
                    <Input aria-label="Link URL" value={l.href} placeholder="https://" onChange={(e) => edit((p) => void (p.sections.contact.links[li]!.href = e.target.value))} />
                    <Button variant="ghost" size="icon" aria-label="Remove link" onClick={() => edit((p) => void p.sections.contact.links.splice(li, 1))}><Trash2 className="size-4!" /></Button>
                  </div>
                ))}
                {s.contact.links.length < 8 ? (
                  <Button variant="secondary" size="sm" onClick={() => edit((p) => void p.sections.contact.links.push({ label: "", href: "" }))}><Plus aria-hidden="true" /> Add link</Button>
                ) : null}
              </div>
            </div>
          ) : null}

          {selected === "design" ? (
            <div className="flex flex-col gap-5">
              <Field label="Template">
                <Select
                  value={draft.templateId}
                  onChange={(e) => {
                    const t = getTemplate(e.target.value);
                    edit((p) => {
                      p.templateId = t.id;
                      p.theme = { ...p.theme, ...t.theme };
                    });
                  }}
                >
                  {templatesFor(draft.niche).map((t) => <option key={t.id} value={t.id}>{t.name}: {t.concept}</option>)}
                </Select>
              </Field>
              <Field label="Accent colour" hint="Unreadable colours fall back to Forma purple automatically.">
                <div className="flex items-center gap-3">
                  <input type="color" value={draft.theme.accent} aria-label="Accent colour" onChange={(e) => edit((p) => void (p.theme.accent = e.target.value.toUpperCase()))} className="size-12 cursor-pointer rounded-control border border-border bg-surface p-1" />
                  <Input value={draft.theme.accent} onChange={(e) => edit((p) => void (p.theme.accent = e.target.value))} className="font-mono" />
                </div>
              </Field>
              <Field label="Mode">
                <Select value={draft.theme.mode} onChange={(e) => edit((p) => void (p.theme.mode = e.target.value as "light" | "dark"))}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </Select>
              </Field>
              <Field label="Heading font">
                <Select value={draft.theme.font} onChange={(e) => edit((p) => void (p.theme.font = e.target.value as "sans" | "serif" | "mono"))}>
                  <option value="sans">Clean sans</option>
                  <option value="serif">Elegant serif</option>
                  <option value="mono">Technical mono</option>
                </Select>
              </Field>
            </div>
          ) : null}
        </aside>
      </div>

    </div>
  );
}
