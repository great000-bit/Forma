export const RESERVED_SLUGS = new Set([
  "www", "app", "api", "admin", "dashboard", "editor", "builder", "login", "mail", "help", "support", "blog", "docs", "status", "forma",
]);

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/;

/** "Amara Okafor" -> "amara-okafor" */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

export function slugProblem(slug: string): string | null {
  if (slug.length < 3) return "Use at least 3 characters";
  if (!SLUG_RE.test(slug)) return "Use lowercase letters, numbers and dashes";
  if (RESERVED_SLUGS.has(slug)) return "That name is reserved. Try another";
  return null;
}

/** Public URL for a slug. Uses subdomains when PORTFOLIO_ROOT_DOMAIN is set, otherwise /p/slug. */
export function portfolioUrl(slug: string, origin: string, rootDomain?: string): string {
  return rootDomain ? `https://${slug}.${rootDomain}` : `${origin.replace(/\/$/, "")}/p/${slug}`;
}
