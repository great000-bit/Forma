-- Phase 6: anyone can read published portfolios (and only those).
drop policy if exists "Read published portfolios" on public.portfolios;
create policy "Read published portfolios" on public.portfolios
  for select to anon, authenticated
  using (status = 'published');

-- Reserved names that can never be a portfolio link.
alter table public.portfolios drop constraint if exists portfolios_slug_reserved;
alter table public.portfolios add constraint portfolios_slug_reserved
  check (slug is null or slug not in ('www', 'app', 'api', 'admin', 'dashboard', 'editor', 'builder', 'login', 'mail', 'help', 'support', 'blog', 'docs', 'status', 'forma'));
