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
- **Phase 5:** manual editor done (sections, design panel, undo, AI command bar, autosave).
- **Phase 6:** publish to /p/<name> or <name>.<PORTFOLIO_ROOT_DOMAIN>, share dialog, QR, JSON-LD (migration 0003).
- **Phase 7:** 520 templates (20 per niche) generated from docs/research by scripts/build-template-library.mjs; /templates gallery and previews.
- **Redesign (25 Nov):** black and blue, glass surfaces, scroll-linked hero stage. App is dark-only; light portfolios use a .light root.
- **Phase 8:** custom domains (migration 0004). Connect in the share dialog; DNS helper with live checks. Needs VERCEL_API_TOKEN and VERCEL_PROJECT_ID to attach domains for HTTPS. Pro-only gate arrives with payments (Phase 9).
- **Phase 9:** Paystack billing built (migration 0005, docs/PRICING.md). Prices are a proposal awaiting sign-off; Pro gates switch on once Paystack keys are set.
- **Phase 10 (part 1):** private view counts per portfolio and source (migration 0006), shown on the dashboard. Admin panel next.
- **Phase 10 (part 2):** founder /admin page (ADMIN_EMAILS env, service-role totals, waitlist, niches).
