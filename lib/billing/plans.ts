/**
 * Plans and what they unlock. Prices are a proposal until the founders sign
 * off (docs/PRICING.md); the Paystack plan codes come from env so prices can
 * change in the Paystack dashboard without a deploy.
 */
export type PlanId = "free" | "pro";
export type Interval = "monthly" | "yearly";

export type Subscription = {
  plan: PlanId;
  status: "active" | "non_renewing" | "attention" | "cancelled" | "inactive";
  current_period_end: string | null;
};

export const PRICES: Record<Interval, { ngn: number; usd: number; label: string }> = {
  monthly: { ngn: 3_500, usd: 4, label: "per month" },
  yearly: { ngn: 30_000, usd: 36, label: "per year" },
};

export const LIMITS = {
  free: { portfolios: 1, aiEditsPerMonth: 20, customDomain: false, badge: true },
  pro: { portfolios: 5, aiEditsPerMonth: Infinity, customDomain: true, badge: false },
} as const;

/** Pro while paid up. "non_renewing" and "attention" keep Pro until the period ends. */
export function isPro(sub: Subscription | null | undefined, now = new Date()): boolean {
  if (!sub || sub.plan !== "pro") return false;
  if (!["active", "non_renewing", "attention"].includes(sub.status)) return false;
  return !sub.current_period_end || new Date(sub.current_period_end) > now;
}

export function limitsFor(sub: Subscription | null | undefined) {
  return isPro(sub) ? LIMITS.pro : LIMITS.free;
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}
