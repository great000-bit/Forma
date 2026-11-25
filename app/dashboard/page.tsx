import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NICHES } from "@/lib/niches";
import { portfolioSchema } from "@/lib/portfolio/schema";
import { currentUser, supabaseServer } from "@/lib/supabase/auth-server";
import { getTemplate } from "@/templates/catalog";
import { SOURCE_LABEL, type Source } from "@/lib/analytics/source";

type Row = { id: string; niche: string; template_id: string; data: unknown; status: string; slug: string | null; updated_at: string };

export default async function DashboardPage() {
  const user = await currentUser();
  const supabase = await supabaseServer();
  const { data, error } = supabase
    ? await supabase.from("portfolios").select("id, niche, template_id, data, status, slug, updated_at").order("updated_at", { ascending: false })
    : { data: null, error: null };
  const rows = (data ?? []) as Row[];

  // Views in the last 30 days, per portfolio, with the top source.
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
  const { data: viewRows } = supabase && rows.length
    ? await supabase.from("page_views").select("portfolio_id, source, views").gte("day", since)
    : { data: null };
  const stats = new Map<string, { total: number; bySource: Map<Source, number> }>();
  for (const v of (viewRows ?? []) as { portfolio_id: string; source: Source; views: number }[]) {
    const s = stats.get(v.portfolio_id) ?? { total: 0, bySource: new Map() };
    s.total += v.views;
    s.bySource.set(v.source, (s.bySource.get(v.source) ?? 0) + v.views);
    stats.set(v.portfolio_id, s);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-h2-m md:text-h2">Hello{user?.email ? `, ${user.email.split("@")[0]}` : ""}</h1>
        <p className="mt-2 text-body text-text-soft">Your portfolios live here.</p>
      </div>

      {error ? (
        <p role="alert" className="text-body-sm text-error">{"We couldn't load your portfolios. Refresh to try again."}</p>
      ) : null}

      {rows.length === 0 && !error ? (
        <Card className="flex flex-col items-center py-16 text-center">
          <span className="flex size-[72px] items-center justify-center rounded-full bg-accent-soft">
            <Sparkles className="size-8 text-accent" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <h2 className="mt-6 text-h3">Create your portfolio</h2>
          <p className="mt-2 max-w-[360px] text-body-sm text-text-soft">Answer a few questions and watch Forma build it. About ten minutes.</p>
          <Button asChild className="mt-6">
            <Link href="/builder">Start talking</Link>
          </Button>
        </Card>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {rows.map((row) => {
          const parsed = portfolioSchema.safeParse(row.data);
          const name = parsed.success ? parsed.data.sections.profile.name : "";
          const niche = NICHES.find((n) => n.slug === row.niche)?.label ?? "Portfolio";
          return (
            <Card key={row.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-h4">{name || "Untitled portfolio"}</h2>
                  <p className="mt-1 text-body-sm text-text-muted">{niche} · {getTemplate(row.template_id).name}</p>
                </div>
                <Badge variant={row.status === "published" ? "success" : "neutral"}>{row.status === "published" ? "Published" : "Draft"}</Badge>
              </div>
              {row.status === "published" ? <ViewsLine stat={stats.get(row.id)} /> : null}
              <p className="text-caption text-text-muted tabular-nums">
                Updated {new Date(row.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              <div className="flex gap-3">
                <Button asChild size="sm">
                  <Link href={`/editor/${row.id}`}>Edit</Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ViewsLine({ stat }: { stat?: { total: number; bySource: Map<Source, number> } }) {
  if (!stat || stat.total === 0) return <p className="text-body-sm text-text-soft">No views yet. Share your link to get some.</p>;
  const top = [...stat.bySource.entries()].sort((a, b) => b[1] - a[1])[0];
  return (
    <p className="text-body-sm text-text-soft">
      <span className="text-text tabular-nums">{stat.total.toLocaleString("en-NG")}</span> {stat.total === 1 ? "view" : "views"} in 30 days
      {top ? <> · most from {SOURCE_LABEL[top[0]]}</> : null}
    </p>
  );
}
