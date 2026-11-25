import { routingRecord, type DnsRecord } from "@/lib/domains/hostname";

/**
 * Attaches custom domains to the Forma project on Vercel so they get HTTPS.
 * Server-only. Needs VERCEL_API_TOKEN and VERCEL_PROJECT_ID (and VERCEL_TEAM_ID
 * for team projects). Without them, domains are saved and the DNS steps are
 * shown, but nothing is attached or checked.
 */
const API = "https://api.vercel.com";

export function vercelConfigured(): boolean {
  return Boolean(process.env.VERCEL_API_TOKEN && process.env.VERCEL_PROJECT_ID);
}

async function call<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T | null }> {
  const team = process.env.VERCEL_TEAM_ID;
  const url = `${API}${path}${team ? `${path.includes("?") ? "&" : "?"}teamId=${encodeURIComponent(team)}` : ""}`;
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`, "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  const data = (await res.json().catch(() => null)) as T | null;
  return { ok: res.ok, status: res.status, data };
}

const project = () => encodeURIComponent(process.env.VERCEL_PROJECT_ID ?? "");

type ProjectDomain = {
  name: string;
  verified: boolean;
  verification?: { type: string; domain: string; value: string }[];
  error?: { code: string; message: string };
};

export async function attachDomain(host: string): Promise<{ ok: boolean; message?: string }> {
  if (!vercelConfigured()) return { ok: true };
  const res = await call<ProjectDomain>(`/v10/projects/${project()}/domains`, { method: "POST", body: JSON.stringify({ name: host }) });
  if (res.ok) return { ok: true };
  const code = res.data?.error?.code;
  // Already on this project: fine.
  if (code === "domain_already_in_use" || res.status === 409) {
    const existing = await call<ProjectDomain>(`/v9/projects/${project()}/domains/${encodeURIComponent(host)}`);
    if (existing.ok) return { ok: true };
    return { ok: false, message: "That domain is connected to another site. Remove it there first." };
  }
  return { ok: false, message: "Couldn't connect that domain right now. Try again in a minute." };
}

export async function detachDomain(host: string): Promise<void> {
  if (!vercelConfigured()) return;
  await call(`/v9/projects/${project()}/domains/${encodeURIComponent(host)}`, { method: "DELETE" }).catch(() => undefined);
}

export type DomainCheck = {
  /** "active": HTTPS works; "pending": waiting on DNS; "unchecked": Vercel not configured. */
  state: "active" | "pending" | "unchecked";
  records: DnsRecord[];
};

export async function checkDomain(host: string): Promise<DomainCheck> {
  const routing = routingRecord(host);
  if (!vercelConfigured()) return { state: "unchecked", records: [routing] };

  const [domain, config] = await Promise.all([
    call<ProjectDomain>(`/v9/projects/${project()}/domains/${encodeURIComponent(host)}`),
    call<{ misconfigured: boolean }>(`/v6/domains/${encodeURIComponent(host)}/config`),
  ]);

  let verified = domain.data?.verified ?? false;
  if (domain.ok && !verified) {
    const retry = await call<ProjectDomain>(`/v9/projects/${project()}/domains/${encodeURIComponent(host)}/verify`, { method: "POST" });
    verified = retry.data?.verified ?? false;
  }

  const txt: DnsRecord[] = (domain.data?.verification ?? [])
    .filter((v) => v.type === "TXT")
    .map((v) => ({ type: "TXT", name: v.domain.replace(new RegExp(`\\.?${host.replace(/\./g, "\\.")}$`), "") || "@", value: v.value }));

  const active = verified && config.ok && config.data?.misconfigured === false;
  return { state: active ? "active" : "pending", records: [routing, ...(verified ? [] : txt)] };
}
