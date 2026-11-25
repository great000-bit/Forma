export const siteConfig = {
  name: "Forma",
  tagline: "Talk. Watch it build.",
  description:
    "Tell Forma about you and your work. It builds your portfolio while you watch and gives you one link to share.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://forma.app").replace(/\/$/, ""),
  nav: [
    { label: "How it works", href: "/#how-it-works" },
    { label: "Templates", href: "/templates" },
    { label: "Pricing", href: "/#pricing" },
    { label: "FAQ", href: "/#faq" },
  ],
  // Add real handles here. The footer only shows links that are set.
  socials: [] as { label: string; href: string }[],
} as const;
