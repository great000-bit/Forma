import "server-only";
import type { Interval } from "@/lib/billing/plans";

/**
 * Paystack (naira, card and direct debit). Server-only. Needs
 * PAYSTACK_SECRET_KEY plus PAYSTACK_PLAN_MONTHLY / PAYSTACK_PLAN_YEARLY
 * (plan codes created in the Paystack dashboard).
 */
const API = "https://api.paystack.co";

export function paystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY && process.env.PAYSTACK_PLAN_MONTHLY && process.env.PAYSTACK_PLAN_YEARLY);
}

export function planCode(interval: Interval): string | undefined {
  return interval === "yearly" ? process.env.PAYSTACK_PLAN_YEARLY : process.env.PAYSTACK_PLAN_MONTHLY;
}

async function call<T>(path: string, init?: RequestInit): Promise<T | null> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const json = (await res.json().catch(() => null)) as { status?: boolean; data?: T } | null;
  return res.ok && json?.status ? (json.data ?? null) : null;
}

/** Starts checkout. The plan code makes Paystack create the subscription after the first charge. */
export async function startCheckout(opts: { email: string; userId: string; interval: Interval; callbackUrl: string }) {
  const plan = planCode(opts.interval);
  if (!plan) return null;
  return call<{ authorization_url: string; reference: string }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: opts.email,
      // Paystack requires an amount; the plan's own amount overrides it.
      amount: 100,
      plan,
      callback_url: opts.callbackUrl,
      metadata: { user_id: opts.userId, interval: opts.interval },
    }),
  });
}

/** Hosted page where people update their card or cancel. */
export async function manageLink(subscriptionCode: string): Promise<string | null> {
  const data = await call<{ link: string }>(`/subscription/${encodeURIComponent(subscriptionCode)}/manage/link`);
  return data?.link ?? null;
}

export { verifySignature } from "@/lib/billing/signature";
