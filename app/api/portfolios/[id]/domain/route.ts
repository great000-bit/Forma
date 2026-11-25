import { NextResponse } from "next/server";
import { z } from "zod";
import { hostnameProblem, normalizeHostname } from "@/lib/domains/hostname";
import { attachDomain, checkDomain, detachDomain } from "@/lib/domains/vercel";
import { hasProAccess } from "@/lib/billing/entitlements";
import { supabaseServer } from "@/lib/supabase/auth-server";

type Ctx = { params: Promise<{ id: string }> };
const body = z.object({ hostname: z.string().max(300) });

async function load(id: string) {
  const supabase = await supabaseServer();
  if (!supabase) return { error: NextResponse.json({ error: "Domains aren't set up yet." }, { status: 503 }) } as const;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: NextResponse.json({ error: "Sign in again." }, { status: 401 }) } as const;
  // RLS limits this to the owner's own rows.
  const { data: row } = await supabase.from("portfolios").select("id, status, custom_domain, domain_status").eq("id", id).maybeSingle();
  if (!row) return { error: NextResponse.json({ error: "Portfolio not found." }, { status: 404 }) } as const;
  return { supabase, row } as const;
}

/** Current domain and the DNS records still needed. Marks it active once DNS checks out. */
export async function GET(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const found = await load(id);
  if ("error" in found) return found.error;
  const { supabase, row } = found;
  if (!row.custom_domain) return NextResponse.json({ hostname: null });

  const check = await checkDomain(row.custom_domain);
  const status = check.state === "active" ? "active" : "pending";
  if (status !== row.domain_status) await supabase.from("portfolios").update({ domain_status: status }).eq("id", id);
  return NextResponse.json({ hostname: row.custom_domain, state: check.state, records: check.records });
}

/** Connect a domain (replaces any previous one). */
export async function POST(request: Request, { params }: Ctx) {
  const { id } = await params;
  const found = await load(id);
  if ("error" in found) return found.error;
  const { supabase, row } = found;
  if (row.status !== "published") return NextResponse.json({ error: "Publish your portfolio first." }, { status: 400 });
  if (!(await hasProAccess(supabase))) {
    return NextResponse.json({ error: "Custom domains come with Pro.", upgrade: true }, { status: 402 });
  }

  const parsed = body.safeParse(await request.json().catch(() => null));
  const host = parsed.success ? normalizeHostname(parsed.data.hostname) : null;
  const problem = hostnameProblem(host);
  if (problem || !host) return NextResponse.json({ error: problem ?? "Enter a domain." }, { status: 400 });

  const attached = await attachDomain(host);
  if (!attached.ok) return NextResponse.json({ error: attached.message }, { status: 409 });

  const { error } = await supabase.from("portfolios").update({ custom_domain: host, domain_status: "pending" }).eq("id", id);
  if (error?.code === "23505") {
    return NextResponse.json({ error: "That domain is already connected to another portfolio." }, { status: 409 });
  }
  if (error) return NextResponse.json({ error: "Couldn't save that domain. Try again." }, { status: 500 });

  if (row.custom_domain && row.custom_domain !== host) await detachDomain(row.custom_domain);
  const check = await checkDomain(host);
  if (check.state === "active") await supabase.from("portfolios").update({ domain_status: "active" }).eq("id", id);
  return NextResponse.json({ hostname: host, state: check.state, records: check.records });
}

/** Disconnect. The forma link keeps working. */
export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const found = await load(id);
  if ("error" in found) return found.error;
  const { supabase, row } = found;
  if (row.custom_domain) await detachDomain(row.custom_domain);
  const { error } = await supabase.from("portfolios").update({ custom_domain: null, domain_status: "none" }).eq("id", id);
  if (error) return NextResponse.json({ error: "Couldn't remove the domain." }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
