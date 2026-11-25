/**
 * Custom domain rules. Pure, so the editor, API and proxy share them.
 */
const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const TLD = /^[a-z]{2,63}$/;

// Second-level suffixes where the "apex" has three labels (amara.com.ng).
const TWO_PART_SUFFIXES = new Set([
  "com.ng", "org.ng", "net.ng", "edu.ng", "gov.ng", "name.ng", "sch.ng",
  "co.uk", "org.uk", "co.za", "org.za", "co.ke", "or.ke", "com.gh", "org.gh",
  "com.au", "co.nz", "co.in", "com.br",
]);

// Hosts people must never point at a portfolio.
const BLOCKED_SUFFIXES = ["forma.app", "vercel.app", "vercel.com", "localhost"];

/** Accepts "https://www.Amara.com/work" and returns "www.amara.com", or null. */
export function normalizeHostname(input: string): string | null {
  let host = input.trim().toLowerCase();
  if (!host) return null;
  host = host.replace(/^[a-z]+:\/\//, "").split(/[/?#]/)[0]!.replace(/\.$/, "");
  if (host.includes(":") || host.includes("@")) return null;
  return host || null;
}

export function hostnameProblem(host: string | null): string | null {
  if (!host) return "Enter a domain, like amara.com";
  if (host.length > 253) return "That domain is too long";
  const labels = host.split(".");
  if (labels.length < 2) return "Include the ending, like .com or .ng";
  if (!TLD.test(labels.at(-1)!)) return "That ending doesn't look right";
  if (!labels.every((l) => LABEL.test(l))) return "Use letters, numbers, dots and dashes only";
  if (labels.every((l) => /^\d+$/.test(l))) return "Use a domain name, not an IP address";
  if (BLOCKED_SUFFIXES.some((s) => host === s || host.endsWith(`.${s}`))) return "Use a domain you own";
  return null;
}

/** amara.com and amara.com.ng are apex domains; www.amara.com is not. */
export function isApex(host: string): boolean {
  const labels = host.split(".");
  const suffix = labels.slice(-2).join(".");
  return TWO_PART_SUFFIXES.has(suffix) ? labels.length === 3 : labels.length === 2;
}

export type DnsRecord = { type: "A" | "CNAME" | "TXT"; name: string; value: string };

/** The record to add at the domain's registrar for it to reach Forma (hosted on Vercel). */
export function routingRecord(host: string): DnsRecord {
  if (isApex(host)) return { type: "A", name: "@", value: "76.76.21.21" };
  const labels = host.split(".");
  const apexLength = TWO_PART_SUFFIXES.has(labels.slice(-2).join(".")) ? 3 : 2;
  return { type: "CNAME", name: labels.slice(0, -apexLength).join("."), value: "cname.vercel-dns.com" };
}

/** Is this request host one of Forma's own (app, previews, local, portfolio subdomains)? */
export function isAppHost(host: string, siteUrl: string | undefined, rootDomain: string | undefined): boolean {
  if (!host || host === "localhost" || host.endsWith(".localhost") || /^[\d.]+$/.test(host)) return true;
  if (host.endsWith(".vercel.app")) return true;
  const site = siteUrl ? safeHost(siteUrl) : null;
  if (site && (host === site || host === `www.${site}`)) return true;
  if (rootDomain && (host === rootDomain || host.endsWith(`.${rootDomain}`))) return true;
  return false;
}

function safeHost(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}
