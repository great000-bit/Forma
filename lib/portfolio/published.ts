import type { Metadata } from "next";
import { portfolioSchema, type Portfolio } from "@/lib/portfolio/schema";
import { portfolioUrl } from "@/lib/portfolio/slug";
import { siteConfig } from "@/lib/site";
import { getSupabase } from "@/lib/supabase/server";

/** A published portfolio and the URL it should be shared and indexed under. */
export type Published = { portfolio: Portfolio; url: string };

type Row = { data: unknown; slug: string; custom_domain: string | null; domain_status: string | null };

function toPublished(row: Row | null): Published | null {
  if (!row) return null;
  const parsed = portfolioSchema.safeParse(row.data);
  if (!parsed.success) return null;
  const url =
    row.custom_domain && row.domain_status === "active"
      ? `https://${row.custom_domain}`
      : portfolioUrl(row.slug, siteConfig.url, process.env.PORTFOLIO_ROOT_DOMAIN);
  return { portfolio: parsed.data, url };
}

const COLUMNS = "data, slug, custom_domain, domain_status";

export async function publishedBySlug(slug: string): Promise<Published | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.from("portfolios").select(COLUMNS).eq("slug", slug).eq("status", "published").maybeSingle();
  return toPublished(data as Row | null);
}

export async function publishedByDomain(host: string): Promise<Published | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("portfolios")
    .select(COLUMNS)
    .eq("custom_domain", host)
    .eq("domain_status", "active")
    .eq("status", "published")
    .maybeSingle();
  return toPublished(data as Row | null);
}

function describe(p: Portfolio): string {
  const { profile, about } = p.sections;
  const text = profile.tagline || about.body.split("\n")[0] || `${profile.role} portfolio`;
  return text.length > 155 ? `${text.slice(0, 152).trimEnd()}…` : text;
}

export function publishedMetadata(found: Published | null): Metadata {
  if (!found) return { title: "Portfolio not found", robots: { index: false } };
  const p = found.portfolio;
  const { name, role, location } = p.sections.profile;
  const title = [name, role].filter(Boolean).join(", ") || "Portfolio";
  return {
    title: { absolute: location ? `${title} in ${location}` : title },
    description: describe(p),
    alternates: { canonical: found.url },
    openGraph: { type: "profile", url: found.url, title, description: describe(p), siteName: name || "Portfolio" },
    twitter: { card: "summary_large_image", title, description: describe(p) },
  };
}
