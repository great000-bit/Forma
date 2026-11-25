import { PortfolioView } from "@/components/portfolio/portfolio-view";
import type { Portfolio } from "@/lib/portfolio/schema";

/** A live portfolio as visitors see it, with ProfilePage structured data. */
export function PublishedPage({ portfolio, showBadge = true }: { portfolio: Portfolio; showBadge?: boolean }) {
  const { profile, contact } = portfolio.sections;
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
        <PortfolioView portfolio={portfolio} showBadge={showBadge} />
      </div>
    </>
  );
}
