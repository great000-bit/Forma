-- Phase 9: plans. Rows are written only by the server (service role) from
-- verified payment webhooks. Users can read their own row.
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'inactive' check (status in ('active', 'non_renewing', 'attention', 'cancelled', 'inactive')),
  provider text check (provider in ('paystack', 'stripe')),
  customer_code text,
  subscription_code text unique,
  email_token text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
drop policy if exists "Read own subscription" on public.subscriptions;
create policy "Read own subscription" on public.subscriptions
  for select to authenticated using (user_id = auth.uid());

-- Webhook events, so a retried delivery is handled once. Server only.
create table if not exists public.payment_events (
  id text primary key,
  provider text not null,
  type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.payment_events enable row level security;

-- Visitors to a published portfolio need to know one thing: does its owner
-- have Pro (no badge)? Answers only for published portfolios.
create or replace function public.portfolio_owner_has_pro(p_portfolio uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.portfolios p
    join public.subscriptions s on s.user_id = p.user_id
    where p.id = p_portfolio
      and p.status = 'published'
      and s.plan = 'pro'
      and s.status in ('active', 'non_renewing', 'attention')
      and (s.current_period_end is null or s.current_period_end > now())
  );
$$;
revoke all on function public.portfolio_owner_has_pro(uuid) from public;
grant execute on function public.portfolio_owner_has_pro(uuid) to anon, authenticated;
