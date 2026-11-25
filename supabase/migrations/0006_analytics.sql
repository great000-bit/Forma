-- Phase 10: simple, private portfolio analytics. Daily counts per source,
-- no cookies, no IPs, nothing that identifies a visitor.
create table if not exists public.page_views (
  portfolio_id uuid not null references public.portfolios (id) on delete cascade,
  day date not null,
  source text not null check (source in ('direct', 'whatsapp', 'linkedin', 'x', 'instagram', 'facebook', 'google', 'other')),
  views integer not null default 0,
  primary key (portfolio_id, day, source)
);

alter table public.page_views enable row level security;

-- Owners read their own numbers.
drop policy if exists "Owners read views" on public.page_views;
create policy "Owners read views" on public.page_views
  for select to authenticated
  using (exists (select 1 from public.portfolios p where p.id = portfolio_id and p.user_id = auth.uid()));

-- Visitors can only add one view to a published portfolio, through this function.
create or replace function public.record_view(p_portfolio uuid, p_source text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_source not in ('direct', 'whatsapp', 'linkedin', 'x', 'instagram', 'facebook', 'google', 'other') then
    p_source := 'other';
  end if;
  if not exists (select 1 from public.portfolios where id = p_portfolio and status = 'published') then
    return;
  end if;
  insert into public.page_views (portfolio_id, day, source, views)
  values (p_portfolio, (now() at time zone 'Africa/Lagos')::date, p_source, 1)
  on conflict (portfolio_id, day, source) do update set views = public.page_views.views + 1;
end $$;

revoke all on function public.record_view(uuid, text) from public;
grant execute on function public.record_view(uuid, text) to anon, authenticated;
