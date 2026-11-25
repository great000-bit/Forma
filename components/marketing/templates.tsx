import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MiniPreview } from "@/components/templates/mini-preview";
import { Container, Section, SectionHeader } from "@/components/marketing/section";
import { NICHES } from "@/lib/niches";
import { getTemplate, templateCount } from "@/templates/catalog";

// A spread across fields so the rows show range, not twelve versions of one look.
const ROW_A = [
  "ui-ux-design/signal-dark",
  "photography/owambe",
  "data-science/notebook",
  "brand-identity/logofolio",
  "game-development/trailer-hero",
  "copywriting/headline-wall",
  "web-development/terminal",
];
const ROW_B = [
  "product-design/metric-row",
  "cybersecurity/terminal-soc",
  "illustration/sketchbook",
  "cloud-devops/architecture",
  "motion-design/reel",
  "social-media-management/feed-grid",
  "mobile-development/device-frames",
];

function Row({ ids, reverse }: { ids: string[]; reverse?: boolean }) {
  // Only ids that exist; the list is duplicated so the loop is seamless.
  const items = ids.map(getTemplate).filter((t, i) => t.id === ids[i]);
  return (
    <div className="marquee gap-5 pr-5" data-reverse={reverse ? "" : undefined} style={{ ["--marquee-speed" as string]: "80s" }}>
      {[...items, ...items].map((t, i) => (
        <Link
          key={`${t.id}-${i}`}
          href={`/templates/${t.id}`}
          tabIndex={i >= items.length ? -1 : undefined}
          aria-hidden={i >= items.length ? true : undefined}
          className="glass group block w-[300px] shrink-0 overflow-hidden rounded-card transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-pop sm:w-[360px]"
        >
          <MiniPreview niche={t.niche} templateId={t.id} />
          <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4">
            <span className="text-label text-text">{t.name}</span>
            <span className="truncate text-caption text-text-muted">
              {NICHES.find((n) => n.slug === t.niche)?.label}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function Templates() {
  return (
    <Section id="templates" aria-labelledby="templates-title" className="overflow-hidden">
      <Container>
        <SectionHeader
          id="templates-title"
          title={`${templateCount()} templates. Twenty for every field.`}
          description="Original designs, each built around how people in that field show their work. Pick one, or let Forma choose."
        />
      </Container>
      <div className="flex flex-col gap-5 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <Row ids={ROW_A} />
        <Row ids={ROW_B} reverse />
      </div>
      <Container className="mt-12 flex justify-center">
        <Link
          href="/templates"
          className="glass inline-flex h-11 items-center gap-2 rounded-full px-5 text-label text-text transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-px hover:shadow-pop"
        >
          Browse all templates
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Container>
    </Section>
  );
}
