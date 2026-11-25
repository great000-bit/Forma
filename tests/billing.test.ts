import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { isPro, limitsFor } from "@/lib/billing/plans";
import { verifySignature } from "@/lib/billing/signature";

describe("plans", () => {
  const future = new Date(Date.now() + 86_400_000).toISOString();
  const past = new Date(Date.now() - 86_400_000).toISOString();

  it("treats paid-up Pro as Pro", () => {
    expect(isPro({ plan: "pro", status: "active", current_period_end: future })).toBe(true);
    expect(isPro({ plan: "pro", status: "non_renewing", current_period_end: future })).toBe(true);
    expect(isPro({ plan: "pro", status: "attention", current_period_end: future })).toBe(true);
  });

  it("drops Pro when it lapses or is cancelled", () => {
    expect(isPro({ plan: "pro", status: "active", current_period_end: past })).toBe(false);
    expect(isPro({ plan: "pro", status: "cancelled", current_period_end: future })).toBe(false);
    expect(isPro({ plan: "free", status: "active", current_period_end: null })).toBe(false);
    expect(isPro(null)).toBe(false);
  });

  it("gives the right limits", () => {
    expect(limitsFor(null).customDomain).toBe(false);
    expect(limitsFor({ plan: "pro", status: "active", current_period_end: future }).badge).toBe(false);
  });
});

describe("paystack signature", () => {
  const body = JSON.stringify({ event: "charge.success", data: { id: 1 } });
  const sign = (b: string, k: string) => createHmac("sha512", k).update(b).digest("hex");

  it("accepts a correct signature", () => {
    expect(verifySignature(body, sign(body, "sk_test_x"), "sk_test_x")).toBe(true);
  });

  it("rejects tampering, wrong keys and junk", () => {
    expect(verifySignature(body + " ", sign(body, "sk_test_x"), "sk_test_x")).toBe(false);
    expect(verifySignature(body, sign(body, "other"), "sk_test_x")).toBe(false);
    expect(verifySignature(body, "zz", "sk_test_x")).toBe(false);
    expect(verifySignature(body, null, "sk_test_x")).toBe(false);
    expect(verifySignature(body, sign(body, "sk_test_x"), undefined)).toBe(false);
  });
});
