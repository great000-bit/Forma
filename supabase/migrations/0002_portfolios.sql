-- Phase 2: saved portfolios and interview transcripts, owner-only.

create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  niche text not null,
  template_id text not null,
  data jsonb not null,
  slug text unique check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$'),
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolios_user_idx on public.portfolios (user_id);

create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  portfolio_id uuid references public.portfolios (id) on delete cascade,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists interviews_user_idx on public.interviews (user_id);

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists portfolios_touch on public.portfolios;
create trigger portfolios_touch before update on public.portfolios
  for each row execute function public.touch_updated_at();

alter table public.portfolios enable row level security;
alter table public.interviews enable row level security;

-- Owners can do everything with their own rows. Nobody else can see drafts.
drop policy if exists "Own portfolios" on public.portfolios;
create policy "Own portfolios" on public.portfolios
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Own interviews" on public.interviews;
create policy "Own interviews" on public.interviews
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
