import type { Metadata } from "next";
import { Check } from "lucide-react";
import { ManageButton, UpgradeButtons } from "@/components/billing/upgrade-buttons";
import { Card } from "@/components/ui/card";
import { billingLive, mySubscription } from "@/lib/billing/entitlements";
import { isPro, PRICES, formatNaira } from "@/lib/billing/plans";
import { supabaseServer } from "@/lib/supabase/auth-server";

export const metadata: Metadata = { title: "Plan" };

const PRO_FEATURES = [
  "Your own domain, like amara.com",
  "No Forma badge on your site",
  "Unlimited AI edits",
  "Up to 5 portfolios",
];

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ paid?: string }> }) {
  const { paid } = await searchParams;
  const supabase = await supabaseServer();
  const sub = supabase ? await mySubscription(supabase) : null;
  const pro = isPro(sub);
  const live = billingLive();
  const ends = sub?.current_period_end ? new Date(sub.current_period_end).toLocaleDateString("en-NG", { dateStyle: "medium" }) : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-h2-m md:text-h2">Plan</h1>
        <p className="mt-2 text-body text-text-soft">{pro ? "You're on Pro." : "You're on the Free plan."}</p>
      </div>

      {paid && !pro ? (
        <p role="status" className="rounded-control border border-border bg-accent-soft px-4 py-3 text-body-sm text-text">
          {"Payment received. Your plan updates in a minute or two. Refresh this page if it doesn't."}
        </p>
      ) : null}

      <Card className="flex flex-col gap-6">
        <div>
          <h2 className="text-h3">Pro</h2>
          <p className="mt-1 text-body-sm text-text-soft">
            {formatNaira(PRICES.monthly.ngn)} a month, or {formatNaira(PRICES.yearly.ngn)} a year. Paid in naira with Paystack.
          </p>
        </div>
        <ul className="flex flex-col gap-3">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-3 text-body-sm text-text">
              <Check className="size-4 text-accent" aria-hidden="true" /> {f}
            </li>
          ))}
        </ul>
        {pro ? (
          <div className="flex flex-col gap-3">
            <p className="text-body-sm text-text-soft">
              {sub?.status === "non_renewing" && ends
                ? `Pro stays on until ${ends}. It won't renew.`
                : sub?.status === "attention"
                  ? "Your last payment didn't go through. Update your card to keep Pro."
                  : ends
                    ? `Renews around ${ends}.`
                    : "Active."}
            </p>
            <ManageButton />
          </div>
        ) : (
          <UpgradeButtons live={live} />
        )}
      </Card>
    </div>
  );
}
