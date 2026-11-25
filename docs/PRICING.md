# Pricing proposal (needs founder sign-off)

Status: proposal, 25 Nov 2026. The numbers live in `lib/billing/plans.ts` (display) and in the Paystack dashboard (what is actually charged). Change both together.

## Proposal

| Plan | Price | What you get |
|---|---|---|
| Free | ₦0 | One portfolio on a forma link, all templates, SEO basics, WhatsApp button, QR code, 20 AI edits a month, small Forma badge |
| Pro monthly | ₦3,500 a month (about $4 for people paying from abroad) | Custom domain, no badge, unlimited AI edits, up to 5 portfolios |
| Pro yearly | ₦30,000 a year (about $36) | Same as monthly, roughly two months free |

## Why these numbers

- **Anchor:** Canva Pro in Nigeria moved from ₦2,800 to ₦5,500 a month in early 2026, and the move was widely reported as a big jump for freelancers. Pro should sit clearly under that.
- **Price is the main barrier:** surveys of Nigerian creatives put subscription cost as the top reason they don't pay for AI tools, ahead of skills or internet.
- **Free first:** local SaaS founders report that free-first products spread much faster, and a small paid layer added later converts better than paywalls up front.
- **Naira billing:** paying in naira avoids the card limits and FX charges that people hit with dollar-billed tools.
- **Exchange rate:** the official rate was about ₦1,350 to ₦1,360 per dollar in mid November 2026, with the parallel market around ₦1,440. The dollar prices round from that.
- **Fees:** Paystack charges 1.5% plus ₦100 per local payment (₦100 waived under ₦2,500, capped at ₦2,000). On ₦3,500 that is about ₦152, roughly 4%.

## Options to consider before launch

1. **Weekly pass (₦1,000):** Canva added daily and weekly passes in Nigeria. Useful for "I have an interview on Friday". Paystack plans support weekly intervals.
2. **Launch price for the waitlist:** for example ₦2,500 a month locked in for the first year.
3. **Student price:** half price with a school email.

## How billing works (built in Phase 9)

- Checkout: `/api/billing/checkout` starts a Paystack payment with the plan code. Paystack creates the subscription after the first charge.
- Webhook: `/api/billing/webhook` checks Paystack's signature, records each event once (`payment_events`), and updates `subscriptions`.
- Pro unlocks custom domains and removes the badge. Before Paystack keys are set, everything stays unlocked.
- People change card or cancel on Paystack's own page (`/api/billing/manage`).

## Setup steps (founder)

1. In Paystack, create two plans: monthly ₦3,500 and annually ₦30,000. Copy their plan codes.
2. In Vercel, add `PAYSTACK_SECRET_KEY`, `PAYSTACK_PLAN_MONTHLY`, `PAYSTACK_PLAN_YEARLY` and `SUPABASE_SERVICE_ROLE_KEY`.
3. In Paystack settings, set the webhook URL to `https://<your domain>/api/billing/webhook`.
4. Run `supabase/migrations/0005_billing.sql`.
