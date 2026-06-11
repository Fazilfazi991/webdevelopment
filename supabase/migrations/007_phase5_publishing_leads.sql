-- Phase 5 public publishing, domains, SEO, and lead collection.
-- Target: dedicated Website Builder project only.
-- Do not apply this file to Plumlet or any unrelated database.

alter table public.sites
add column if not exists published_at timestamptz,
add column if not exists published_by uuid references auth.users(id) on delete set null,
add column if not exists publication_status text not null default 'draft',
add column if not exists primary_subdomain text,
add column if not exists seo_title text,
add column if not exists seo_description text,
add column if not exists seo_keywords text,
add column if not exists og_title text,
add column if not exists og_description text,
add column if not exists og_image_media_id uuid references public.site_media(id) on delete set null,
add column if not exists robots_index boolean not null default true,
add column if not exists robots_follow boolean not null default true,
add column if not exists last_published_version_id uuid references public.site_versions(id) on delete set null;

alter table public.sites
drop constraint if exists sites_publication_status_check;

alter table public.sites
add constraint sites_publication_status_check
check (publication_status in ('draft', 'published', 'unpublished', 'suspended'));

alter table public.sites
drop constraint if exists sites_primary_subdomain_format_check;

alter table public.sites
add constraint sites_primary_subdomain_format_check
check (
  primary_subdomain is null
  or (
    primary_subdomain ~ '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$'
    and primary_subdomain not in ('www','admin','dashboard','api','auth','app','mail','support','help','status','assets','static','cdn','blog')
  )
);

create unique index if not exists sites_primary_subdomain_unique_idx
on public.sites(primary_subdomain)
where primary_subdomain is not null;

-- Public visitors can discover only published, non-suspended site shells by subdomain.
drop policy if exists "Public visitors can read published sites" on public.sites;
create policy "Public visitors can read published sites"
on public.sites for select
using (publication_status = 'published' and status <> 'suspended');

create table if not exists public.site_domains (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  domain text not null,
  domain_type text not null check (domain_type in ('platform_subdomain', 'custom_domain')),
  status text not null default 'pending' check (status in ('pending', 'verified', 'active', 'failed', 'removed')),
  verification_token text,
  verification_method text,
  verification_details jsonb not null default '{}'::jsonb,
  is_primary boolean not null default false,
  verified_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (domain)
);

create unique index if not exists site_domains_one_primary_idx
on public.site_domains(site_id)
where is_primary = true and status in ('verified', 'active');

create table if not exists public.contact_leads (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  whatsapp text,
  subject text,
  message text not null,
  source_page text,
  source_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed', 'spam')),
  is_read boolean not null default false,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_notification_settings (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null unique references public.sites(id) on delete cascade,
  notification_email text,
  send_email_notifications boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_publish_history (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  site_version_id uuid references public.site_versions(id) on delete set null,
  action text not null check (action in ('published', 'republished', 'unpublished')),
  performed_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists site_domains_site_id_idx on public.site_domains(site_id);
create index if not exists site_domains_organization_id_idx on public.site_domains(organization_id);
create index if not exists contact_leads_site_id_idx on public.contact_leads(site_id);
create index if not exists contact_leads_organization_id_idx on public.contact_leads(organization_id);
create index if not exists contact_leads_submitted_at_idx on public.contact_leads(submitted_at desc);
create index if not exists site_publish_history_site_id_idx on public.site_publish_history(site_id);

drop trigger if exists set_site_domains_updated_at on public.site_domains;
create trigger set_site_domains_updated_at
before update on public.site_domains
for each row execute function public.set_updated_at();

drop trigger if exists set_contact_leads_updated_at on public.contact_leads;
create trigger set_contact_leads_updated_at
before update on public.contact_leads
for each row execute function public.set_updated_at();

drop trigger if exists set_lead_notification_settings_updated_at on public.lead_notification_settings;
create trigger set_lead_notification_settings_updated_at
before update on public.lead_notification_settings
for each row execute function public.set_updated_at();

alter table public.site_domains enable row level security;
alter table public.contact_leads enable row level security;
alter table public.lead_notification_settings enable row level security;
alter table public.site_publish_history enable row level security;

-- Public pages render from the exact version approved at publish time.
drop policy if exists "Public visitors can read published site versions" on public.site_versions;
create policy "Public visitors can read published site versions"
on public.site_versions for select
using (
  exists (
    select 1 from public.sites
    where sites.id = site_versions.site_id
      and sites.last_published_version_id = site_versions.id
      and sites.publication_status = 'published'
      and sites.status <> 'suspended'
  )
);

-- Members can read domain status for their own organisation.
drop policy if exists "Members can read own site domains" on public.site_domains;
create policy "Members can read own site domains"
on public.site_domains for select
using (public.is_org_member(organization_id) or public.is_platform_admin());

-- Only owners and organisation admins can manage domains.
drop policy if exists "Owners and admins can manage site domains" on public.site_domains;
create policy "Owners and admins can manage site domains"
on public.site_domains for all
using (public.has_org_role(organization_id, array['owner', 'admin']) or public.is_platform_admin())
with check (
  created_by = auth.uid()
  and public.has_org_role(organization_id, array['owner', 'admin'])
  and exists (
    select 1 from public.sites
    where sites.id = site_domains.site_id
      and sites.organization_id = site_domains.organization_id
  )
);

-- Public visitors may submit leads only for published active sites.
drop policy if exists "Public visitors can submit published site leads" on public.contact_leads;
create policy "Public visitors can submit published site leads"
on public.contact_leads for insert
with check (
  exists (
    select 1 from public.sites
    where sites.id = contact_leads.site_id
      and sites.organization_id = contact_leads.organization_id
      and sites.publication_status = 'published'
      and sites.status <> 'suspended'
  )
);

-- Organisation members can read their own leads; public visitors cannot read leads.
drop policy if exists "Members can read own contact leads" on public.contact_leads;
create policy "Members can read own contact leads"
on public.contact_leads for select
using (public.is_org_member(organization_id) or public.is_platform_admin());

-- Owners, admins, and editors can update lead state and read status.
drop policy if exists "Editors can update own contact leads" on public.contact_leads;
create policy "Editors can update own contact leads"
on public.contact_leads for update
using (public.has_org_role(organization_id, array['owner', 'admin', 'editor']) or public.is_platform_admin())
with check (public.has_org_role(organization_id, array['owner', 'admin', 'editor']) or public.is_platform_admin());

-- Members can read notification settings for their own sites.
drop policy if exists "Members can read lead notification settings" on public.lead_notification_settings;
create policy "Members can read lead notification settings"
on public.lead_notification_settings for select
using (
  public.is_platform_admin()
  or exists (
    select 1 from public.sites
    where sites.id = lead_notification_settings.site_id
      and public.is_org_member(sites.organization_id)
  )
);

-- Only owners and organisation admins can update lead notification settings.
drop policy if exists "Owners and admins can manage lead notification settings" on public.lead_notification_settings;
create policy "Owners and admins can manage lead notification settings"
on public.lead_notification_settings for all
using (
  public.is_platform_admin()
  or exists (
    select 1 from public.sites
    where sites.id = lead_notification_settings.site_id
      and public.has_org_role(sites.organization_id, array['owner', 'admin'])
  )
)
with check (
  public.is_platform_admin()
  or exists (
    select 1 from public.sites
    where sites.id = lead_notification_settings.site_id
      and public.has_org_role(sites.organization_id, array['owner', 'admin'])
  )
);

-- Members can read publish history for their own sites.
drop policy if exists "Members can read site publish history" on public.site_publish_history;
create policy "Members can read site publish history"
on public.site_publish_history for select
using (
  public.is_platform_admin()
  or exists (
    select 1 from public.sites
    where sites.id = site_publish_history.site_id
      and public.is_org_member(sites.organization_id)
  )
);

-- Owners, admins, and editors can create publish history records through publish actions.
drop policy if exists "Editors can create site publish history" on public.site_publish_history;
create policy "Editors can create site publish history"
on public.site_publish_history for insert
with check (
  performed_by = auth.uid()
  and exists (
    select 1 from public.sites
    where sites.id = site_publish_history.site_id
      and public.has_org_role(sites.organization_id, array['owner', 'admin', 'editor'])
  )
);
