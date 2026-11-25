import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NICHES } from "@/lib/niches";
import { portfolioSchema } from "@/lib/portfolio/schema";
import { currentUser, supabaseServer } from "@/lib/supabase/auth-server";
import { getTemplate } from "@/templates/catalog";

type Row = { id: string; niche: string; template_id: string; data: unknown; status: string; slug: string | null; updated_at: string };

export default async function DashboardPage() {
  const user = await currentUser();
  const supabase = await supabaseServer();
  const { data, error } = supabase
    ? await supabase.from("portfolios").select("id, niche, template_id, data, status, slug, updated_at").order("updated_at", { ascending: false })
    : { data: null, error: null };
  const rows = (data ?? []) as Row[];

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
              <p className="text-caption text-text-muted tabular-nums">
                Updated {new Date(row.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              <p className="text-body-sm text-text-soft">Editing and publishing to your own link come next.</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
