import Link from "next/link";
import { ArrowRight, Eye } from "lucide-react";
import { templateCount } from "@/templates/catalog";
import { cn } from "@/lib/utils";
import { RevealGroup, RevealItem } from "@/components/marketing/reveal";
import { Container, Section, SectionHeader } from "@/components/marketing/section";

type Layout = "split" | "grid" | "reel" | "rows" | "gallery" | "doc";

const templates: { name: string; niche: string; layout: Layout }[] = [
  { name: "Studio", niche: "Product Design", layout: "split" },
  { name: "Ledger", niche: "Data Science", layout: "rows" },
  { name: "Reel", niche: "Video Editing", layout: "reel" },
  { name: "Folio", niche: "Photography", layout: "gallery" },
  { name: "Atlas", niche: "Cloud/DevOps", layout: "grid" },
  { name: "Margin", niche: "Technical Writing", layout: "doc" },
];

const line = "rounded-full bg-border-strong";

/** Abstract, original layout sketches. Real previews arrive with the template library. */
function Sketch({ layout }: { layout: Layout }) {
  switch (layout) {
    case "split":
      return (
        <div className="grid h-full grid-cols-2 gap-4">
          <div className="flex flex-col justify-center gap-2">
            <div className={cn(line, "h-3 w-4/5 bg-text")} />
            <div className={cn(line, "h-3 w-3/5 bg-text")} />
            <div className={cn(line, "mt-2 h-1.5 w-full")} />
            <div className={cn(line, "h-1.5 w-4/5")} />
            <div className="mt-3 h-5 w-16 rounded-full bg-accent" />
          </div>
          <div className="rounded-chip bg-accent-soft" />
        </div>
      );
    case "rows":
      return (
        <div className="flex h-full flex-col gap-3">
          <div className={cn(line, "h-3 w-1/2 bg-text")} />
          <div className="flex flex-1 items-end gap-1.5 rounded-chip border border-border bg-surface p-3">
            {[40, 65, 50, 80, 60, 95, 70].map((h) => (
              <div key={h} className="flex-1 rounded-t-sm bg-accent/70" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex gap-2">
            <div className="h-8 flex-1 rounded-chip border border-border bg-surface" />
            <div className="h-8 flex-1 rounded-chip border border-border bg-surface" />
          </div>
        </div>
      );
    case "reel":
      return (
        <div className="flex h-full flex-col gap-3 rounded-chip bg-ink p-4">
          <div className="flex flex-1 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--signal)_25%,transparent)]">
            <div className="size-8 rounded-full border-2 border-white/80" />
          </div>
          <div className="h-1.5 w-2/3 rounded-full bg-white/70" />
          <div className="h-1.5 w-1/3 rounded-full bg-white/30" />
        </div>
      );
    case "gallery":
      return (
        <div className="grid h-full grid-cols-3 grid-rows-2 gap-2">
          <div className="col-span-2 row-span-2 rounded-chip bg-border-strong" />
          <div className="rounded-chip bg-accent-soft" />
          <div className="rounded-chip bg-border" />
        </div>
      );
    case "grid":
      return (
        <div className="flex h-full flex-col gap-3">
          <div className={cn(line, "h-3 w-2/5 bg-text")} />
          <div className="grid flex-1 grid-cols-3 gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className={cn("rounded-chip border border-border bg-surface", i === 1 && "border-accent")}
              />
            ))}
          </div>
        </div>
      );
    case "doc":
      return (
        <div className="grid h-full grid-cols-[1fr_3fr] gap-4">
          <div className="flex flex-col gap-2 border-r border-border pr-3">
            <div className={cn(line, "h-1.5 w-full bg-accent")} />
            <div className={cn(line, "h-1.5 w-4/5")} />
            <div className={cn(line, "h-1.5 w-3/5")} />
          </div>
          <div className="flex flex-col gap-2">
            <div className={cn(line, "mb-1 h-3 w-3/4 bg-text")} />
            {["w-full", "w-11/12", "w-full", "w-4/5", "w-full", "w-2/3"].map((w, i) => (
              <div key={i} className={cn(line, "h-1.5", w)} />
            ))}
          </div>
        </div>
      );
  }
}

export function Templates() {
  return (
    <Section id="templates" aria-labelledby="templates-title" className="border-y border-border bg-surface">
      <Container>
        <SectionHeader
          id="templates-title"
          title="Templates with a point of view."
          description="Original designs, each built around how people in that field show their work. Pick one, or let Forma choose."
        />
      </Container>
      {/* Swipe rail on small screens, grid from lg up */}
      <Container className="px-0 md:px-0 lg:px-12">
        <RevealGroup className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 [scrollbar-width:none] md:px-8 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0 lg:pb-0">
          {templates.map((t) => (
            <RevealItem key={t.name} className="w-[280px] shrink-0 snap-start sm:w-[320px] lg:w-auto">
              <article className="group overflow-hidden rounded-card border border-border bg-bg shadow-card transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-border-strong hover:shadow-pop">
                <div className="relative aspect-[4/3] p-6">
                  <Sketch layout={t.layout} />
                  <div className="absolute inset-0 flex items-center justify-center bg-bg/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 ease-out group-hover:opacity-100">
                    <span className="inline-flex h-9 items-center gap-2 rounded-full bg-surface-raised px-4 text-label text-text shadow-pop">
                      <Eye className="size-4" aria-hidden="true" />
                      Preview
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border bg-surface px-6 py-4">
                  <h3 className="text-h4">{t.name}</h3>
                  <span className="text-caption text-text-muted">{t.niche}</span>
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
      <Container className="mt-10 flex justify-center">
        <Link href="/templates" className="inline-flex h-11 items-center gap-2 rounded-full border border-border-strong px-5 text-label text-text transition-colors hover:bg-bg">
          Browse all {templateCount()} templates
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Container>
    </Section>
  );
}
