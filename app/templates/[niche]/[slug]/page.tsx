import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PortfolioView } from "@/components/portfolio/portfolio-view";
import { Button } from "@/components/ui/button";
import { NICHES } from "@/lib/niches";
import { samplePortfolio } from "@/lib/portfolio/sample";
import { TEMPLATES } from "@/templates/catalog";

type Params = { niche: string; slug: string };

export const revalidate = 86400;

function find({ niche, slug }: Params) {
  const template = TEMPLATES.find((t) => t.id === `${niche}/${slug}`);
  const field = NICHES.find((n) => n.slug === niche);
  return template && field ? { template, field } : null;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const found = find(await params);
  if (!found) return {};
  return {
    title: `${found.template.name}: ${found.field.label} portfolio template`,
    description: found.template.concept,
    alternates: { canonical: `/templates/${found.template.id}` },
  };
}

export default async function TemplatePreviewPage({ params }: { params: Promise<Params> }) {
  const found = find(await params);
  if (!found) notFound();
  const { template, field } = found;

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-40 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-border bg-bg/90 px-4 py-2 backdrop-blur-[12px] md:px-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/templates?niche=${field.slug}`}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              All {field.label}
            </Link>
          </Button>
          <div className="hidden flex-col sm:flex">
            <h1 className="text-label text-text">{template.name}</h1>
            <p className="text-caption text-text-muted">Sample content. Yours comes from your answers.</p>
          </div>
        </div>
        <Button asChild size="sm">
          <Link href={`/builder?template=${encodeURIComponent(template.id)}`}>Use this template</Link>
        </Button>
      </header>
      <PortfolioView portfolio={samplePortfolio(field.slug, template.id)} />
    </div>
  );
}
