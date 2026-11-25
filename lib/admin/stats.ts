import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type AdminStats = {
  waitlist: number;
  portfolios: number;
  published: number;
  pro: number;
  views7d: number;
  byNiche: { niche: string; count: number }[];
  recentWaitlist: { name: string; email: string; niche: string; created_at: string }[];
};

function since(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}

/** Totals for the founder view. Null when the service role key is not set. */
export async function adminStats(): Promise<AdminStats | null> {
  const db = supabaseAdmin();
  if (!db) return null;

  const [waitlist, portfolios, published, pro, views, niches, recent] = await Promise.all([
    db.from("waitlist").select("*", { count: "exact", head: true }),
    db.from("portfolios").select("*", { count: "exact", head: true }),
    db.from("portfolios").select("*", { count: "exact", head: true }).eq("status", "published"),
    db.from("subscriptions").select("*", { count: "exact", head: true }).eq("plan", "pro").in("status", ["active", "non_renewing"]),
    db.from("page_views").select("views").gte("day", since(7)),
    db.from("portfolios").select("niche"),
    db.from("waitlist").select("name, email, niche, created_at").order("created_at", { ascending: false }).limit(20),
  ]);

  const tally = new Map<string, number>();
  for (const row of (niches.data ?? []) as { niche: string }[]) tally.set(row.niche, (tally.get(row.niche) ?? 0) + 1);

  return {
    waitlist: waitlist.count ?? 0,
    portfolios: portfolios.count ?? 0,
    published: published.count ?? 0,
    pro: pro.count ?? 0,
    views7d: ((views.data ?? []) as { views: number }[]).reduce((s, r) => s + r.views, 0),
    byNiche: [...tally].map(([niche, c]) => ({ niche, count: c })).sort((a, b) => b.count - a.count),
    recentWaitlist: (recent.data ?? []) as AdminStats["recentWaitlist"],
  };
}
