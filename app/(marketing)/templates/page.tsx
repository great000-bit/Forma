import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/marketing/section";
import { MiniPreview } from "@/components/templates/mini-preview";
import { NICHES } from "@/lib/niches";
import { cn } from "@/lib/utils";
import { templateCount, templatesFor } from "@/templates/catalog";

export const metadata: Metadata = {
  title: "Portfolio templates for every field",
  description: "Original portfolio templates for designers, developers, data people, writers and more. Twenty per field, built around how each field shows its work.",
  alternates: { canonical: "/templates" },
};

export default async function TemplatesPage({ searchParams }: { searchParams: Promise<{ niche?: string }> }) {
  const { niche: asked } = await searchParams;
  const niche = NICHES.find((n) => n.slug === asked) ?? NICHES[0];
  const list = templatesFor(niche.slug);

  return (
    <Container className="flex flex-col gap-10 py-16 md:py-24">
      <header className="flex max-w-prose flex-col gap-4">
        <h1 className="text-h1-m md:text-h1">Templates</h1>
        <p className="text-body-lg text-text-soft">
          {templateCount()} original designs, twenty for each field. Every one works on a phone first and loads fast on a weak connection.
        </p>
      </header>

      <nav aria-label="Fields">
        <ul className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
          {NICHES.map((n) => (
            <li key={n.slug} className="shrink-0">
              <Link
                href={`/templates?niche=${n.slug}`}
                aria-current={n.slug === niche.slug ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center rounded-full border px-4 text-label transition-colors",
                  n.slug === niche.slug ? "border-text bg-text text-bg" : "border-border text-text-soft hover:border-border-strong hover:text-text",
                )}
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => {
          const slug = t.id.split("/")[1];
          return (
            <li key={t.id}>
              <Link
                href={`/templates/${niche.slug}/${slug}`}
                className="group block overflow-hidden rounded-card border border-border bg-surface shadow-card transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-border-strong hover:shadow-pop"
              >
                <MiniPreview niche={niche.slug} templateId={t.id} />
                <div className="flex flex-col gap-1 border-t border-border px-5 py-4">
                  <h2 className="text-h4">{t.name}</h2>
                  <p className="text-body-sm text-text-soft">{t.concept}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
