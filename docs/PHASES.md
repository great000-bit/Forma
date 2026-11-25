# Forma: Phases

1. Landing page and waitlist
2. Auth and dashboard shell
3. AI interview (voice and chat)
4. AI builder with live build animation
5. Template engine and manual editor
6. Publish pipeline and subdomains (one shareable link)
7. Template library (20 per niche)
8. Custom domains
9. Payments and plans
10. Analytics, admin panel, SEO, launch polish
11. Forma SEO engine (Pro): score, Fix it for me, schema, Search Console, weekly reports, previews
12. AI portfolio coach, tailored links, testimonials, booking, live sync, multilingual

Each phase ends with a working, deployed, tested slice. Do not start the next phase until the current one passes lint, type and build checks.

## Additions from FEATURES_AND_SEO_SPEC.md

- **Phase 6 (publish):** baseline SEO, sitemap, robots, OG images, share and QR dialog, WhatsApp contact, contact form and inbox.
- **Phase 7 to 8:** CV import, version history, template switch, tailored links groundwork.
- **Phase 9 (payments):** naira and USD pricing, Paystack and Stripe, plan gates. Research local willingness to pay and propose tiers first.
- **Phase 10:** analytics, admin, launch polish.

Do not build Phase 11 or 12 features early. Prepare only the SEO data model hooks (spec section 2.5) when convenient.

## Status (25 Nov 2026)

- **CI:** GitHub Actions runs install, type check, lint, tests and build on every push (`.github/workflows/ci.yml`). Green as of commit d63af78.
- **Phase 1:** done and live on Vercel. Waitlist needs Supabase env vars and migration 0001.
- **Phase 2:** auth (email/password, Google), proxy session refresh, dashboard shell, saved portfolios (migration 0002). Needs Supabase env vars in Vercel and the Google provider enabled in Supabase.
- **Phases 3 to 5 (partial):** AI interview, live builder, AI edits, template engine (5 presets, full UI/UX catalog). Needs `ANTHROPIC_API_KEY` in Vercel; `/api/ai/health` reports the setup.
- **Research:** see `docs/research/niches.md` for which niches still need verified portfolio lists.
- **Not started:** manual editor UI (5), publishing and subdomains (6), remaining template catalogs (7), domains (8), payments (9), analytics/admin (10).
