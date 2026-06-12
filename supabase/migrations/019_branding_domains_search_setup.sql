-- Branding, domain lifecycle, search verification, and developer-only custom code.

alter table public.site_media drop constraint if exists site_media_usage_type_check;
alter table public.site_media add constraint site_media_usage_type_check check (usage_type in (
  'logo','logo-dark','hero','about','service','service:ac-maintenance','service:electrical',
  'service:plumbing','service:painting','service:interior-repairs','service:preventive-maintenance',
  'gallery','gallery:project-01','gallery:project-02','gallery:project-03','gallery:project-04',
  'favicon','social-share','general'
));

create table if not exists public.site_branding_settings (
  site_id uuid primary key references public.sites(id) on delete cascade,
  use_logo_colors boolean not null default false,
  show_business_name_fallback boolean not null default true,
  logo_alignment text not null default 'left' check (logo_alignment in ('left','center')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sites add column if not exists google_verification_token text;

alter table public.site_domains add column if not exists verification_status text not null default 'pending';
alter table public.site_domains add column if not exists ssl_status text not null default 'pending';
alter table public.site_domains add column if not exists redirect_to_primary boolean not null default true;

alter table public.site_domains drop constraint if exists site_domains_domain_type_check;
alter table public.site_domains add constraint site_domains_domain_type_check check (domain_type in ('platform_path','platform_subdomain','custom_domain'));
alter table public.site_domains drop constraint if exists site_domains_status_check;
alter table public.site_domains add constraint site_domains_status_check check (status in ('pending','verifying','verified','active','failed','removed'));
alter table public.site_domains drop constraint if exists site_domains_verification_status_check;
alter table public.site_domains add constraint site_domains_verification_status_check check (verification_status in ('pending','verifying','verified','failed'));
alter table public.site_domains drop constraint if exists site_domains_ssl_status_check;
alter table public.site_domains add constraint site_domains_ssl_status_check check (ssl_status in ('pending','active','failed'));

create table if not exists public.site_developer_settings (
  site_id uuid primary key references public.sites(id) on delete cascade,
  custom_header_code text,
  custom_footer_code text,
  version_number integer not null default 1,
  updated_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_developer_setting_versions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  version_number integer not null,
  custom_header_code text,
  custom_footer_code text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (site_id, version_number)
);

drop trigger if exists set_site_branding_settings_updated_at on public.site_branding_settings;
create trigger set_site_branding_settings_updated_at before update on public.site_branding_settings for each row execute function public.set_updated_at();
drop trigger if exists set_site_developer_settings_updated_at on public.site_developer_settings;
create trigger set_site_developer_settings_updated_at before update on public.site_developer_settings for each row execute function public.set_updated_at();

alter table public.site_branding_settings enable row level security;
alter table public.site_developer_settings enable row level security;
alter table public.site_developer_setting_versions enable row level security;

drop policy if exists "Members can read site branding" on public.site_branding_settings;
create policy "Members can read site branding" on public.site_branding_settings for select
using (exists (select 1 from public.sites where sites.id = site_id and public.is_org_member(sites.organization_id)));
drop policy if exists "Editors can manage site branding" on public.site_branding_settings;
create policy "Editors can manage site branding" on public.site_branding_settings for all
using (exists (select 1 from public.sites where sites.id = site_id and public.has_org_role(sites.organization_id, array['owner','admin','editor'])))
with check (created_by = auth.uid() and exists (select 1 from public.sites where sites.id = site_id and public.has_org_role(sites.organization_id, array['owner','admin','editor'])));
drop policy if exists "Admins can read developer settings" on public.site_developer_settings;
create policy "Admins can read developer settings" on public.site_developer_settings for select
using (exists (select 1 from public.sites where sites.id = site_id and (public.has_org_role(sites.organization_id, array['owner','admin']) or public.has_site_permission(sites.id, 'edit_design'))));
drop policy if exists "Admins can manage developer settings" on public.site_developer_settings;
create policy "Admins can manage developer settings" on public.site_developer_settings for all
using (exists (select 1 from public.sites where sites.id = site_id and (public.has_org_role(sites.organization_id, array['owner','admin']) or public.has_site_permission(sites.id, 'edit_design'))))
with check (updated_by = auth.uid() and exists (select 1 from public.sites where sites.id = site_id and (public.has_org_role(sites.organization_id, array['owner','admin']) or public.has_site_permission(sites.id, 'edit_design'))));
drop policy if exists "Admins can read developer setting versions" on public.site_developer_setting_versions;
create policy "Admins can read developer setting versions" on public.site_developer_setting_versions for select
using (exists (select 1 from public.sites where sites.id = site_id and (public.has_org_role(sites.organization_id, array['owner','admin']) or public.has_site_permission(sites.id, 'edit_design'))));
drop policy if exists "Admins can create developer setting versions" on public.site_developer_setting_versions;
create policy "Admins can create developer setting versions" on public.site_developer_setting_versions for insert
with check (created_by = auth.uid() and exists (select 1 from public.sites where sites.id = site_id and (public.has_org_role(sites.organization_id, array['owner','admin']) or public.has_site_permission(sites.id, 'edit_design'))));
drop policy if exists "Public can resolve active domains" on public.site_domains;
create policy "Public can resolve active domains" on public.site_domains for select using (status = 'active');
