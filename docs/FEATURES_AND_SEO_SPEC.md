# FORMA: DIFFERENTIATORS, AI SEO ENGINE AND EXTRA FEATURES (UI/UX + PRODUCT SPEC)

This extends `/docs/PRD.md` and `/docs/DESIGN_SYSTEM.md`. All UI follows the design system exactly: premium, clean, generous spacing, 8px grid, semantic tokens, Inter, Signal accent used sparingly, Lucide icons, soft shadows, ease-out motion, light and dark mode. Do not build anything here before the phases it belongs to (see Section 9).

---

## 1. WHAT MAKES FORMA DIFFERENT

Competitors (Wix, Squarespace, Framer, Webflow, Hocoos, Durable, Wegic, Lovable, Contra) are strong builders, but:

1. They make the user do the work. Most AI builders ask business questions or expect a good prompt.
2. They treat SEO as settings the user must understand and fill in. Several do include SEO tools (for example, Framer lists built-in SEO on paid plans), but the user still has to know what to write and what to fix.
3. They do not know the user's niche in depth. A data scientist, a motion designer and a cybersecurity analyst need very different portfolios.
4. They price in dollars, with no local payment focus for Nigeria and Africa.

**Forma's edge, in one line:** you talk, Forma builds the portfolio, and Forma also handles the SEO for you so people can actually find it.

**Core differentiators**
1. Voice-first AI interview that knows each niche
2. Live build animation (the AI constructing the site in front of you)
3. 20 original templates per niche
4. **AI SEO engine that does the SEO for the user** (premium)
5. One link, WhatsApp-first sharing, built for Nigeria and Africa (Paystack, naira pricing, light pages for weak networks)
6. AI portfolio coach that keeps improving the portfolio after launch

---

## 2. THE AI SEO ENGINE (PREMIUM FEATURE)

### 2.1 Principle
The user never sees jargon. Forma does the SEO work and shows plain-language results. The user's job is only to approve.

### 2.2 Free plan (baseline, ships with Phase 6 publish pipeline)
Every published portfolio gets correct technical basics automatically, so Lighthouse SEO stays 90+:
- Title and meta description (auto-written from the portfolio content)
- Clean semantic HTML, one h1, logical heading order
- Open Graph and Twitter card tags with an auto-generated share image
- Auto sitemap.xml and robots.txt
- Canonical URL, mobile friendly, fast loading
- Image alt text (auto-generated)

### 2.3 Premium: the Forma SEO engine (ships as Phase 11)
1. **SEO Score:** a 0 to 100 score per portfolio with a plain-English checklist.
2. **Fix it for me:** one button applies every recommended fix. The user can review each change and undo it.
3. **Niche keyword intelligence:** the AI knows what recruiters and clients search in each niche (for example "UI/UX designer in Lagos", "data analyst portfolio") and weaves relevant terms naturally into titles, headings, about text and project descriptions. No keyword stuffing, copy must stay human.
4. **Name SEO ("Google yourself"):** optimizes so searching the user's name and role returns their portfolio. Includes a Person schema and consistent name usage.
5. **Structured data (JSON-LD):** auto-generated Person, ProfilePage, CreativeWork, and breadcrumb schema for projects, validated before publish.
6. **Project page SEO:** each project gets its own title, description, slug, social image and schema.
7. **Image optimization and alt text:** AI describes every image, compresses it (AVIF/WebP) and adds proper dimensions.
8. **Performance and Core Web Vitals monitor:** alerts if the site gets slow, with one-click fixes.
9. **Google Search Console connection:** connect once, then Forma submits the sitemap, requests indexing for new pages and shows impressions, clicks, queries and average position in the dashboard.
10. **Local SEO:** location and "open to work in" targeting (Port Harcourt, Lagos, Abuja, remote, etc.).
11. **Social share previews:** live preview of how the link looks on WhatsApp, LinkedIn, X and Google, with custom share image generation.
12. **Weekly SEO report email:** short, human summary ("Your portfolio appeared in 128 searches this week. Top query: ...") with one suggested action.
13. **AI competitor peek:** compare the user's SEO score against anonymized averages for their niche.
14. **Redirects and custom 404:** manage old links and avoid dead pages.

### 2.4 SEO rules for the AI
- Never invent facts, awards, clients or numbers.
- Never keyword stuff. Copy must read like a human wrote it.
- Titles under about 60 characters, descriptions under about 155 characters, unique per page.
- Every SEO change is logged and reversible (version history).
- Show the user why each change matters in one short sentence.
- Do not promise rankings. Say "improves your chances of being found".

### 2.5 SEO data model additions
`seo_settings` (portfolio_id, title, description, og_image, keywords, schema_json, canonical, indexable), `seo_scores` (portfolio_id, score, checks_json, created_at), `seo_changes` (portfolio_id, field, old_value, new_value, applied_by, created_at), `search_console_connections` (user_id, site_url, tokens_encrypted), `search_metrics` (portfolio_id, date, impressions, clicks, ctr, position, top_queries_json).
Store third-party tokens encrypted. Never expose them to the client.

### 2.6 SEO UI/UX

**Entry points:** an "SEO" item in the dashboard sidebar and an "SEO" tab inside the editor. Free users see the baseline status and a clear, quiet upgrade card (Signal accent, no pressure).

**SEO dashboard**
- Top: large score ring (Signal stroke, 0 to 100) with a one-line verdict ("Good. 3 quick wins left") and the primary button **Fix it for me**.
- Below: checklist cards grouped by Content, Technical, Images, Social and Search. Each item has a status icon (check, warning, x), a one-line plain explanation, and a "Fix" button.
- Search performance card (premium): impressions, clicks, average position, and a clean line chart (Signal line, soft area fill).
- Top queries list and a "pages found by Google" list.
- Previews panel: tabs for Google, WhatsApp, LinkedIn, X showing live link previews.

**Fix it for me flow**
1. Button opens a sheet listing each proposed change (before and after, side by side).
2. User toggles any change off, then confirms.
3. Changes apply with the build-style animation (items check off one by one).
4. Success toast with an Undo action for 10 seconds, plus full history in a "Changes" tab.

**Search Console connect:** a short two-step dialog (Connect Google, choose site), with a loading state and a friendly empty state while data arrives ("Google needs a few days to show data").

**Locked state for Free users:** show the real dashboard blurred slightly behind a clean upgrade card listing three benefits. Never block the baseline SEO.

**Copy tone:** short and human. Example: "Your about section is great. Adding your city could help people nearby find you."

---

## 3. MORE FEATURES TO STAND OUT

Each feature lists plan and UX notes. Build in the phases from Section 9.

### 3.1 AI and building
1. **CV and profile import (Free).** Upload a PDF CV or paste LinkedIn, GitHub, Behance or Dribbble links. The AI pre-fills the interview so the user only confirms. UX: drag and drop zone in the interview start screen, "or just talk to Forma" as an equal option.
2. **AI case study writer (Free limited, Pro unlimited).** The user explains a project in 60 seconds by voice. The AI writes a structured case study (problem, process, result) and asks for missing facts instead of inventing them.
3. **AI edit by voice or text (Free limited, Pro unlimited).** "Make my bio shorter", "add a testimonials section", "change to a darker look". The result appears with the same build animation and a Keep and Undo bar.
4. **AI portfolio coach (Pro).** Reviews the portfolio like a senior hiring manager: what is strong, what is weak, what to add. Shows a score and three improvements. Weekly nudge email.
5. **Version history and restore (Free 5 versions, Pro unlimited).** Timeline panel with before and after preview.
6. **Tailored links (Pro).** Create variants of the portfolio for a specific job or client (for example "Acme Studio") with a custom intro and highlighted projects, each with its own link and analytics. UX: "Create tailored version" button, pick projects, AI rewrites the intro.

### 3.2 Sharing and contact (Nigeria and Africa first)
7. **WhatsApp-first contact (Free).** Floating contact button with WhatsApp, email, call and LinkedIn. One-tap "Share to WhatsApp" with a good link preview.
8. **QR code and share card (Free).** After publishing: QR code, copy link, and a downloadable share image sized for Instagram and WhatsApp status.
9. **Contact form with inbox (Free).** Messages land in the Forma dashboard and the user's email, with spam protection. UX: simple inbox list, unread badge, reply by email.
10. **Open to work badge (Free).** A toggle that shows "Available for work" with a small green dot on the portfolio. Optional hire-me button.
11. **Testimonial request link (Pro).** The user sends a link, a past client fills a short form, and the testimonial appears on the portfolio after approval.
12. **Booking embed (Pro).** Connect Cal.com or Calendly for a "Book a call" button.
13. **Recruiter-ready CV export (Free).** One-click PDF CV generated from the portfolio data, in clean A4 layout.

### 3.3 Design and templates
14. **Template switch without losing content (Free).** Content stays, template changes, with live preview before confirming.
15. **Brand controls (Free basic, Pro advanced).** Accent color, font pairing from a curated set, light or dark default. Guardrails keep designs looking premium (the AI will not allow low contrast).
16. **Visitor dark mode toggle (Free).**
17. **Accessibility checker (Free).** Contrast, alt text, keyboard focus. Fix suggestions in plain language.
18. **Multilingual portfolios (Pro).** AI translates the whole portfolio, with language switch on the page. Start with English plus French, Hausa, Yoruba and Igbo as options to evaluate.

### 3.4 Growth and trust
19. **Analytics (Free basic, Pro full).** Views, unique visitors, link clicks, contact clicks, top sources, and country or city. Clean cards, one line chart.
20. **Monthly Wrapped-style summary (Free).** A shareable card ("Your portfolio got 340 views this month, top project: ..."), which also markets Forma.
21. **"Built with Forma" badge (Free only).** Subtle, links back to Forma. Removed on Pro.
22. **Custom domain and domain purchase inside Forma (Pro).** Connect an existing domain or buy one, with Paystack and Stripe. UX: step-by-step DNS helper with live verification status.
23. **Password-protected projects (Pro).** For NDA work.
24. **Live sync (Pro).** Pull latest repos, Behance or Dribbble shots and Medium posts automatically.
25. **Referral program (Free).** Invite friends, both get a month of Pro. Share link inside the dashboard.
26. **Local pricing and payment (all).** Naira pricing, Paystack for cards, bank transfer and USSD where supported, Stripe for the rest. Clearly show price in local currency.
27. **Lightweight pages for low data (all).** Published portfolios are fast, lazy load images, small bundles, work well on weak mobile networks.

---

## 4. PLANS (UPDATED)

**Free:** 1 portfolio, forma subdomain, Forma badge, baseline SEO, basic analytics, contact form, WhatsApp button, QR and share card, CV import, limited AI edits and case studies, 5 versions.

**Pro:** everything in Free plus the **Forma SEO engine**, custom domain, no badge, unlimited AI edits and case studies, AI portfolio coach, full analytics, tailored links, testimonials, booking embed, password-protected projects, live sync, multilingual, unlimited versions, priority support.

Pricing is open. Research local willingness to pay and propose naira and USD tiers before Phase 9.

---

## 5. UI/UX RULES FOR ALL NEW FEATURES

- Every feature uses existing design tokens and components. No new colors, radii or fonts.
- Every screen has loading (skeleton), empty, error and success states.
- Upgrade prompts are calm: an accent-soft card with a clear benefit, a primary button, and a dismiss. Never a blocking wall for baseline features.
- AI actions always show progress, always show what changed, and always offer Undo.
- Explain in one plain sentence, no jargon (say "help people find you on Google", not "improve your SERP ranking").
- Mobile first. The SEO dashboard, inbox and analytics must work well at 375px.
- Voice features always have a text alternative.
- Keep motion minimal and consistent with the build animation language (fade and rise, ease-out).

---

## 6. NEW SCREENS TO DESIGN

1. SEO dashboard (score ring, checklist, search performance, previews)
2. Fix it for me review sheet
3. Search Console connect dialog
4. Contact inbox
5. Tailored links manager
6. Version history panel
7. Portfolio coach report
8. Share and QR dialog after publish
9. Import (CV, links) start screen
10. Testimonial request and approval screen
11. Domain connect and purchase flow
12. Upgrade and billing screen (naira and USD)
13. Monthly summary share card

---

## 7. SUCCESS METRICS

- Share of published portfolios with SEO score above 80
- Free to Pro conversion after the first SEO report
- Portfolios appearing in Google search within 30 days
- Interview completion rate
- Share link visits per portfolio
- Retention after 30 days (users who edit or check analytics)

---

## 8. RISKS AND RULES

- SEO results are never guaranteed. Do not promise rankings in the UI or marketing.
- Google API quotas and policy: follow Search Console API terms, handle token expiry and revoked access gracefully.
- AI copy must never invent achievements, clients or numbers. Missing info means ask the user.
- Privacy: encrypt tokens, let users delete interview transcripts, imported CV data and analytics.
- Fair use and cost: cap AI calls per plan, cache results, and queue heavy jobs.
- Originality: templates and generated copy must stay original.

---

## 9. WHERE THIS FITS IN THE PHASES

Phases 1 to 10 remain as defined in the PRD. Add:

- **Phase 6 (publish):** baseline SEO, sitemap, robots, OG images, share and QR dialog, WhatsApp contact, contact form and inbox.
- **Phase 7 to 8:** CV import, version history, template switch, tailored links groundwork.
- **Phase 9 (payments):** naira and USD pricing, Paystack and Stripe, plan gates.
- **Phase 10:** analytics, admin, launch polish.
- **Phase 11 (new): Forma SEO engine (Pro).** Score, Fix it for me, schema, Search Console, weekly reports, previews.
- **Phase 12 (new): AI portfolio coach, tailored links, testimonials, booking, live sync, multilingual.**

Do not build Phase 11 or 12 features early. Prepare only the data model hooks listed in Section 2.5 when convenient.

---

## 10. WORKING RULES (UNCHANGED)

`git pull` at session start, read the codebase first, commit after each discrete change, run lint, type and build checks before every commit, flag problems immediately, never commit secrets, keep replies short.