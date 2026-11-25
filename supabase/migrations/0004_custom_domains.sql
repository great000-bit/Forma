-- Phase 8: one custom domain per portfolio.
-- The hostname lives on the portfolio row so the public "published" read
-- policy already covers lookups by domain.
alter table public.portfolios
  add column if not exists custom_domain text unique,
  add column if not exists domain_status text not null default 'none';

alter table public.portfolios drop constraint if exists portfolios_custom_domain_format;
alter table public.portfolios add constraint portfolios_custom_domain_format
  check (
    custom_domain is null
    or (
      length(custom_domain) between 4 and 253
      and custom_domain ~ '^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$'
    )
  );

alter table public.portfolios drop constraint if exists portfolios_domain_status_check;
alter table public.portfolios add constraint portfolios_domain_status_check
  check (domain_status in ('none', 'pending', 'active'));
