import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isPro, type Subscription } from "@/lib/billing/plans";
import { paystackConfigured } from "@/lib/billing/paystack";

/** The signed-in user's subscription (RLS: own row only). */
export async function mySubscription(supabase: SupabaseClient): Promise<Subscription | null> {
  const { data } = await supabase.from("subscriptions").select("plan, status, current_period_end").maybeSingle();
  return (data as Subscription | null) ?? null;
}

/**
 * Pro features are only locked once payments are live. Before that, everyone
 * can try everything (and nobody is stuck behind a button that can't work).
 */
export function billingLive(): boolean {
  return paystackConfigured();
}

export async function hasProAccess(supabase: SupabaseClient): Promise<boolean> {
  if (!billingLive()) return true;
  return isPro(await mySubscription(supabase));
}
