-- Waitlist for the Phase 1 landing page.
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  email text not null check (char_length(email) between 3 and 254),
  niche text not null check (char_length(niche) between 1 and 64),
  created_at timestamptz not null default now()
);

-- One signup per email, case-insensitive. Duplicate inserts fail with 23505.
create unique index if not exists waitlist_email_unique on public.waitlist (lower(email));

alter table public.waitlist enable row level security;

-- Visitors can join. Nobody can read, update or delete through the public API.
drop policy if exists "Anyone can join the waitlist" on public.waitlist;
create policy "Anyone can join the waitlist"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (true);
