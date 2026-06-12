-- Studio OS platform subdomains and customer custom domains.
-- Additive compatibility migration. Review and apply manually; do not run against other products.

create table if not exists public.site_domains (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  domain text,
  hostname text,
  domain_type text not null default 'custom_domain',
  status text not null default 'pending',
  verification_status text not null default 'pending',
  ssl_status text not null default 'pending',
  verification_token text,
  verification_method text,
  verification_details jsonb not null default '{}'::jsonb,
  provider_domain_id text,
  last_checked_at timestamptz,
  is_primary boolean not null default false,
  redirect_to_primary boolean not null default true,
  verified_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_domains add column if not exists hostname text;
alter table public.site_domains add column if not exists provider_domain_id text;
alter table public.site_domains add column if not exists last_checked_at timestamptz;
alter table public.site_domains add column if not exists verification_details jsonb not null default '{}'::jsonb;
alter table public.site_domains add column if not exists redirect_to_primary boolean not null default true;
alter table public.site_domains add column if not exists is_primary boolean not null default false;

update public.site_domains
set hostname = coalesce(nullif(hostname, ''), domain)
where hostname is null or hostname = '';

alter table public.site_domains alter column hostname set not null;
alter table public.site_domains alter column domain set default null;

alter table public.site_domains drop constraint if exists site_domains_domain_type_check;
alter table public.site_domains add constraint site_domains_domain_type_check
check (domain_type in ('temporary_path', 'platform_path', 'platform_subdomain', 'custom_domain'));

alter table public.site_domains drop constraint if exists site_domains_status_check;
alter table public.site_domains add constraint site_domains_status_check
check (status in ('pending', 'waiting_dns', 'verifying', 'active', 'failed', 'removed'));

alter table public.site_domains drop constraint if exists site_domains_verification_status_check;
alter table public.site_domains add constraint site_domains_verification_status_check
check (verification_status in ('pending', 'waiting_dns', 'verifying', 'verified', 'failed'));

alter table public.site_domains drop constraint if exists site_domains_ssl_status_check;
alter table public.site_domains add constraint site_domains_ssl_status_check
check (ssl_status in ('pending', 'active', 'failed'));

create unique index if not exists site_domains_hostname_unique_idx
on public.site_domains(lower(hostname))
where status <> 'removed';

create index if not exists site_domains_site_status_idx on public.site_domains(site_id, status);
create index if not exists site_domains_org_status_idx on public.site_domains(organization_id, status);
create unique index if not exists site_domains_one_primary_idx
on public.site_domains(site_id)
where is_primary = true and status <> 'removed';

drop trigger if exists set_site_domains_updated_at on public.site_domains;
create trigger set_site_domains_updated_at
before update on public.site_domains
for each row execute function public.set_updated_at();

alter table public.site_domains enable row level security;

drop policy if exists "Public can resolve active domains" on public.site_domains;
create policy "Public can resolve active domains" on public.site_domains
for select using (status = 'active');

drop policy if exists "Site members can view domain settings" on public.site_domains;
create policy "Site members can view domain settings" on public.site_domains
for select to authenticated
using (public.can_read_site(site_id) or public.is_platform_admin());

drop policy if exists "Owners admins and editors can update Studio OS address records" on public.site_domains;
create policy "Owners admins and editors can update Studio OS address records" on public.site_domains
for all to authenticated
using (
  domain_type in ('temporary_path', 'platform_path', 'platform_subdomain')
  and (public.has_site_permission(site_id, 'edit_content') or public.is_platform_admin())
)
with check (
  domain_type in ('temporary_path', 'platform_path', 'platform_subdomain')
  and (public.has_site_permission(site_id, 'edit_content') or public.is_platform_admin())
);

drop policy if exists "Owners and admins manage customer domains" on public.site_domains;
create policy "Owners and admins manage customer domains" on public.site_domains
for all to authenticated
using (
  domain_type = 'custom_domain'
  and (public.has_site_permission(site_id, 'manage_domains') or public.is_platform_admin())
)
with check (
  domain_type = 'custom_domain'
  and (public.has_site_permission(site_id, 'manage_domains') or public.is_platform_admin())
);
