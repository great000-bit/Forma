import { ArrowUpRight, FileDown, Mail, MessageCircle, Phone } from "lucide-react";
import type { Project, Sections } from "@/lib/portfolio/schema";
import { cn } from "@/lib/utils";

/*
  Reusable portfolio sections. Pure and server-safe so published portfolios
  render without client JavaScript. Colours come from --pf-accent and
  --pf-on-accent set by the template root; everything else uses tokens.
*/

const STATUS_LABEL: Record<Sections["profile"]["status"], string> = {
  open: "Open to work",
  freelance: "Available for freelance",
  booked: "Currently booked",
  "not-looking": "Not looking right now",
  unknown: "",
};

const LABEL_TEXT: Record<Project["label"], string> = {
  client: "",
  personal: "Personal project",
  practice: "Practice project",
  nda: "Under NDA, details on request",
};

export function Caption({ children, number }: { children: React.ReactNode; number?: number }) {
  return (
    <p className="mb-4 text-caption tracking-[0.08em] text-text-muted uppercase">
      {number !== undefined ? <span className="mr-2 tabular-nums">{String(number).padStart(2, "0")}</span> : null}
      {children}
    </p>
  );
}

export function ProfileSection({
  data,
  variant = "left",
  headingClass,
}: {
  data: Sections["profile"];
  variant?: "left" | "split" | "compact";
  headingClass?: string;
}) {
  const status = data.statusNote || STATUS_LABEL[data.status];
  return (
    <div className={cn("flex flex-col gap-5", variant === "split" && "md:flex-row md:items-center md:justify-between md:gap-12")}>
      <div className="flex flex-col gap-4">
        {status ? (
          <p className="flex items-center gap-2 text-body-sm text-text-soft">
            <span className="size-2 rounded-full bg-success" aria-hidden="true" />
            {status}
          </p>
        ) : null}
        <h1 className={cn("text-h1-m md:text-h1", variant === "compact" && "md:text-h2", headingClass)}>
          {data.name || "Your name"}
        </h1>
        {data.role || data.location ? (
          <p className="text-body-lg text-text-soft">
            {[data.role, data.location].filter(Boolean).join(" · ")}
          </p>
        ) : null}
        {data.tagline ? <p className="max-w-prose text-body text-text-soft">{data.tagline}</p> : null}
      </div>
      {data.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- user-supplied remote URL
        <img
          src={data.avatarUrl}
          alt={`Portrait of ${data.name}`}
          width={160}
          height={160}
          loading="eager"
          className={cn("size-20 rounded-full object-cover", variant === "split" && "md:size-40")}
        />
      ) : null}
    </div>
  );
}

export function AboutSection({ data, number }: { data: Sections["about"]; number?: number }) {
  if (!data.body) return null;
  return (
    <div>
      <Caption number={number}>About</Caption>
      <div className="max-w-prose space-y-4 text-body text-text-soft">
        {data.body.split(/\n{2,}/).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}

export function SkillsSection({ data, number }: { data: Sections["skills"]; number?: number }) {
  const groups = data.groups.filter((g) => g.items.length > 0);
  if (groups.length === 0) return null;
  return (
    <div>
      <Caption number={number}>Skills</Caption>
      <div className="flex flex-col gap-5">
        {groups.map((g) => (
          <div key={g.label || g.items.join()}>
            {g.label ? <p className="mb-2 text-label text-text">{g.label}</p> : null}
            <ul className="flex flex-wrap gap-2">
              {g.items.map((item) => (
                <li key={item} className="inline-flex h-8 items-center rounded-full border border-border px-3 text-body-sm text-text-soft">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectMeta({ p }: { p: Project }) {
  const meta = [p.context, p.role, p.year].filter(Boolean).join(" · ");
  const label = LABEL_TEXT[p.label];
  return meta || label ? (
    <p className="text-caption text-text-muted">
      {meta}
      {meta && label ? " · " : ""}
      {label}
    </p>
  ) : null;
}

function ProjectLinks({ p }: { p: Project }) {
  if (p.links.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-4">
      {p.links.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-label text-[var(--pf-accent)] hover:underline">
          {l.label}
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}

export function ProjectsSection({
  data,
  variant = "cards",
  number,
}: {
  data: Sections["projects"];
  variant?: "cards" | "index";
  number?: number;
}) {
  if (data.items.length === 0) return null;

  if (variant === "index") {
    return (
      <div>
        <Caption number={number}>Selected work</Caption>
        <ul className="divide-y divide-border border-y border-border">
          {data.items.map((p) => (
            <li key={p.id} className="grid gap-1 py-5 md:grid-cols-[1fr_2fr] md:gap-8">
              <div>
                <h3 className="text-h4">{p.title}</h3>
                <ProjectMeta p={p} />
              </div>
              <div>
                {p.summary ? <p className="text-body text-text-soft">{p.summary}</p> : null}
                {p.result ? <p className="mt-2 text-label text-text">{p.result}</p> : null}
                <ProjectLinks p={p} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <Caption number={number}>Selected work</Caption>
      <div className="grid gap-6 sm:grid-cols-2">
        {data.items.map((p) => (
          <article key={p.id} className="flex flex-col overflow-hidden rounded-card border border-border bg-surface">
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- user-supplied remote URL
              <img src={p.imageUrl} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="aspect-[4/3] w-full bg-[color-mix(in_srgb,var(--pf-accent)_10%,transparent)]" aria-hidden="true" />
            )}
            <div className="flex flex-1 flex-col gap-2 p-6">
              <ProjectMeta p={p} />
              <h3 className="text-h4">{p.title}</h3>
              {p.result ? <p className="text-label text-text">{p.result}</p> : null}
              {p.summary ? <p className="text-body-sm text-text-soft">{p.summary}</p> : null}
              {p.tags.length > 0 ? (
                <ul className="mt-1 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <li key={t} className="rounded-full bg-bg px-2.5 py-1 text-caption text-text-muted">{t}</li>
                  ))}
                </ul>
              ) : null}
              <ProjectLinks p={p} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function ExperienceSection({ data, number }: { data: Sections["experience"]; number?: number }) {
  if (data.items.length === 0) return null;
  return (
    <div>
      <Caption number={number}>Experience</Caption>
      <ul className="divide-y divide-border border-y border-border">
        {data.items.map((job, i) => (
          <li key={`${job.role}-${job.org}-${i}`} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4">
            <div>
              <p className="text-label text-text">{[job.role, job.org].filter(Boolean).join(", ")}</p>
              {job.summary ? <p className="mt-1 max-w-prose text-body-sm text-text-soft">{job.summary}</p> : null}
            </div>
            {job.start || job.end ? (
              <span className="text-body-sm text-text-muted tabular-nums">{[job.start, job.end].filter(Boolean).join(" to ")}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

const btn =
  "inline-flex h-11 items-center gap-2 rounded-control px-5 text-label transition-transform duration-150 ease-out hover:-translate-y-px";

export function ContactSection({ data, name, number }: { data: Sections["contact"]; name: string; number?: number }) {
  const wa = data.whatsapp?.replace(/[^0-9]/g, "");
  const hasAny = data.email || wa || data.phone || data.links.length > 0 || data.cvUrl;
  if (!hasAny) return null;
  return (
    <div>
      <Caption number={number}>Contact</Caption>
      <h2 className="text-h2-m md:text-h2">{data.heading || "Let's work together"}</h2>
      <div className="mt-6 flex flex-wrap gap-3">
        {data.email ? (
          <a href={`mailto:${data.email}`} className={cn(btn, "bg-[var(--pf-accent)] text-[var(--pf-on-accent)]")}>
            <Mail className="size-4" aria-hidden="true" /> Email {name ? name.split(" ")[0] : "me"}
          </a>
        ) : null}
        {wa ? (
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className={cn(btn, "border border-border bg-surface text-text")}>
            <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp
          </a>
        ) : null}
        {data.phone ? (
          <a href={`tel:${data.phone.replace(/[^0-9+]/g, "")}`} className={cn(btn, "border border-border bg-surface text-text")}>
            <Phone className="size-4" aria-hidden="true" /> Call
          </a>
        ) : null}
        {data.cvUrl ? (
          <a href={data.cvUrl} target="_blank" rel="noopener noreferrer" className={cn(btn, "border border-border bg-surface text-text")}>
            <FileDown className="size-4" aria-hidden="true" /> CV
          </a>
        ) : null}
        {data.links.map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={cn(btn, "border border-border bg-surface text-text")}>
            {l.label} <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        ))}
      </div>
    </div>
  );
}
