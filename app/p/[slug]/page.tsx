import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { PortfolioView } from "@/components/portfolio/portfolio-view";
import { portfolioSchema, type Portfolio } from "@/lib/portfolio/schema";
import { portfolioUrl } from "@/lib/portfolio/slug";
import { siteConfig } from "@/lib/site";
import { getSupabase } from "@/lib/supabase/server";

export const revalidate = 60;

const load = cache(async (slug: string): Promise<Portfolio | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.from("portfolios").select("data").eq("slug", slug).eq("status", "published").maybeSingle();
  const parsed = portfolioSchema.safeParse(data?.data);
  return parsed.success ? parsed.data : null;
});

function describe(p: Portfolio): string {
  const { profile, about } = p.sections;
  const text = profile.tagline || about.body.split("\n")[0] || `${profile.role} portfolio`;
  return text.length > 155 ? `${text.slice(0, 152).trimEnd()}…` : text;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) return { title: "Portfolio not found", robots: { index: false } };
  const { name, role, location } = p.sections.profile;
  const title = [name, role].filter(Boolean).join(", ") || "Portfolio";
  const url = portfolioUrl(slug, siteConfig.url, process.env.PORTFOLIO_ROOT_DOMAIN);
  return {
    title: { absolute: location ? `${title} in ${location}` : title },
    description: describe(p),
    alternates: { canonical: url },
    openGraph: { type: "profile", url, title, description: describe(p), siteName: name || "Portfolio" },
    twitter: { card: "summary_large_image", title, description: describe(p) },
  };
}

export default async function PublishedPortfolio({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) notFound();

  const { profile, contact } = p.sections;
  const sameAs = contact.links.map((l) => l.href);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: profile.name,
      jobTitle: profile.role || undefined,
      address: profile.location ? { "@type": "PostalAddress", addressLocality: profile.location } : undefined,
      email: contact.email ? `mailto:${contact.email}` : undefined,
      sameAs: sameAs.length ? sameAs : undefined,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div id="main">
        {/* Free plan for everyone until payments land in Phase 9. */}
        <PortfolioView portfolio={p} showBadge />
      </div>
    </>
  );
}
