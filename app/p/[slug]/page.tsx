import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { PublishedPage } from "@/components/portfolio/published-page";
import { publishedBySlug, publishedMetadata } from "@/lib/portfolio/published";

export const revalidate = 60;

const load = cache(publishedBySlug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return publishedMetadata(await load(slug));
}

export default async function PublishedBySlug({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await load(slug);
  if (!found) notFound();
  return <PublishedPage id={found.id} portfolio={found.portfolio} showBadge={found.showBadge} />;
}
