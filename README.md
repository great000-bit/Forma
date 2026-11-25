# Forma

Talk. Watch it build. Forma interviews you by voice or chat, builds your portfolio live, and gives you one link to share.

Docs: [PRD](docs/PRD.md) · [Design system](docs/DESIGN_SYSTEM.md) · [Features and SEO spec](docs/FEATURES_AND_SEO_SPEC.md) · [Phases](docs/PHASES.md)

## Stack

Next.js 16 (App Router) · TypeScript strict · Tailwind CSS v4 · shadcn-style components on Radix · Framer Motion · Supabase · Zod · Vitest

## Run it

```bash
npm install
cp .env.example .env.local   # fill in Supabase URL and anon key
npm run dev
```

Before every commit:

```bash
npm run check   # lint, typecheck, tests, build
```

## Supabase

Run `supabase/migrations/0001_waitlist.sql` in the SQL editor (or `supabase db push`). It creates the `waitlist` table, a case-insensitive unique index on email, and an insert-only RLS policy. Nobody can read the list through the public API; view signups in the Supabase dashboard.

## Deploy (Vercel)

Import the repo, set `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, deploy. No other config needed for Phase 1.

## AI builder (`/builder`)

Set `ANTHROPIC_API_KEY` in `.env.local`, then open `/builder`.

- **Interview agent** (`/api/ai/interview`): one question at a time, adapts to answers, covers the niche's required topics (`lib/portfolio/niche-config.ts`). Voice via the Web Speech API with a typing fallback. Falls back to fixed questions if the AI is down or not configured.
- **Builder agent** (`/api/ai/build`): streams the portfolio section by section as NDJSON, validates every section with Zod, retries missing sections once, and leaves anything still invalid empty.
- **Edit agent** (`/api/ai/edit`): returns only a diff (ops). The server checks the ops produce a valid portfolio before replying; the client applies the same ops, with undo.
- All AI calls are server-side; the key never reaches the browser. Rate limits are in-memory for now (per instance).

## Template engine

- `lib/portfolio/schema.ts`: the one portfolio schema every template renders.
- `components/sections/sections.tsx`: shared, server-safe sections.
- `components/portfolio/portfolio-view.tsx`: renders any portfolio with any template preset.
- `templates/catalog.ts`: templates are data (preset + theme). Adding a template needs no editor or builder code.
