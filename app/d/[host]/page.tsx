import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { PublishedPage } from "@/components/portfolio/published-page";
import { hostnameProblem, normalizeHostname } from "@/lib/domains/hostname";
import { publishedByDomain, publishedMetadata } from "@/lib/portfolio/published";

/** Served for custom domains: proxy.ts rewrites amara.com/ to /d/amara.com. */
export const revalidate = 60;

const load = cache(async (raw: string) => {
  const host = normalizeHostname(decodeURIComponent(raw));
  return host && !hostnameProblem(host) ? publishedByDomain(host) : null;
});

export async function generateMetadata({ params }: { params: Promise<{ host: string }> }): Promise<Metadata> {
  const { host } = await params;
  return publishedMetadata(await load(host));
}

export default async function PublishedByDomain({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const found = await load(host);
  if (!found) notFound();
  return <PublishedPage portfolio={found.portfolio} />;
}
