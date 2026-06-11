-- Phase 4 guided website editor for the dedicated Website Builder project only.
-- Target: https://caaacypgmlbkmmgobsdc.supabase.co
-- Do not apply this file to Plumlet or any other product database.

alter table public.sites
drop constraint if exists sites_setup_step_check;

alter table public.sites
add constraint sites_setup_step_check
check (setup_step in ('website_type', 'industry', 'business_category', 'template', 'template_selected', 'content'));

create table if not exists public.site_business_profiles (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null unique references public.sites(id) on delete cascade,
  company_name text,
  tagline text,
  short_description text,
  full_description text,
  phone text,
  whatsapp text,
  email text,
  address_line_1 text,
  address_line_2 text,
  city text,
  state_region text,
  country_code text,
  postal_code text,
  map_embed_url text,
  working_hours jsonb not null default '[]'::jsonb,
  social_links jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_section_overrides (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  template_section_id uuid not null references public.template_sections(id) on delete cascade,
  is_enabled boolean not null default true,
  display_order integer,
  content_override jsonb not null default '{}'::jsonb,
  settings_override jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, template_section_id)
);

create table if not exists public.site_theme_overrides (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null unique references public.sites(id) on delete cascade,
  theme_preset_id uuid references public.template_theme_presets(id) on delete set null,
  primary_color text,
  secondary_color text,
  accent_color text,
  font_preset text check (font_preset is null or font_preset in ('professional_sans', 'modern_clean', 'classic_corporate', 'friendly_local')),
  button_style text check (button_style is null or button_style in ('square', 'soft_rounded', 'pill')),
  radius_preset text check (radius_preset is null or radius_preset in ('minimal', 'balanced', 'rounded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (primary_color is null or primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  check (secondary_color is null or secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  check (accent_color is null or accent_color ~ '^#[0-9A-Fa-f]{6}$')
);

create table if not exists public.site_media (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/svg+xml')),
  file_size bigint not null check (file_size > 0 and file_size <= 5242880),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  alt_text text,
  usage_type text not null check (usage_type in ('logo', 'hero', 'service', 'gallery', 'about', 'favicon', 'general')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_versions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  version_number integer not null,
  snapshot jsonb not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (site_id, version_number)
);

create index if not exists site_section_overrides_site_id_idx on public.site_section_overrides(site_id);
create index if not exists site_media_site_id_idx on public.site_media(site_id);
create index if not exists site_media_organization_id_idx on public.site_media(organization_id);
create index if not exists site_versions_site_id_idx on public.site_versions(site_id);

drop trigger if exists set_site_business_profiles_updated_at on public.site_business_profiles;
create trigger set_site_business_profiles_updated_at
before update on public.site_business_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_site_section_overrides_updated_at on public.site_section_overrides;
create trigger set_site_section_overrides_updated_at
before update on public.site_section_overrides
for each row execute function public.set_updated_at();

drop trigger if exists set_site_theme_overrides_updated_at on public.site_theme_overrides;
create trigger set_site_theme_overrides_updated_at
before update on public.site_theme_overrides
for each row execute function public.set_updated_at();

drop trigger if exists set_site_media_updated_at on public.site_media;
create trigger set_site_media_updated_at
before update on public.site_media
for each row execute function public.set_updated_at();

alter table public.site_business_profiles enable row level security;
alter table public.site_section_overrides enable row level security;
alter table public.site_theme_overrides enable row level security;
alter table public.site_media enable row level security;
alter table public.site_versions enable row level security;

-- Organisation members may read the business profile for their own sites.
drop policy if exists "Members can read site business profiles" on public.site_business_profiles;
create policy "Members can read site business profiles"
on public.site_business_profiles for select
using (
  public.is_platform_admin()
  or exists (
    select 1 from public.sites
    where sites.id = site_business_profiles.site_id
      and public.is_org_member(sites.organization_id)
  )
);

-- Owners, organisation admins, and editors may create or update business profiles.
drop policy if exists "Editors can manage site business profiles" on public.site_business_profiles;
create policy "Editors can manage site business profiles"
on public.site_business_profiles for all
using (
  public.is_platform_admin()
  or exists (
    select 1 from public.sites
    where sites.id = site_business_profiles.site_id
      and public.has_org_role(sites.organization_id, array['owner', 'admin', 'editor'])
  )
)
with check (
  public.is_platform_admin()
  or exists (
    select 1 from public.sites
    where sites.id = site_business_profiles.site_id
      and public.has_org_role(sites.organization_id, array['owner', 'admin', 'editor'])
  )
);

-- Organisation members may read section overrides for their own sites.
drop policy if exists "Members can read site section overrides" on public.site_section_overrides;
create policy "Members can read site section overrides"
on public.site_section_overrides for select
using (
  public.is_platform_admin()
  or exists (
    select 1 from public.sites
    where sites.id = site_section_overrides.site_id
      and public.is_org_member(sites.organization_id)
  )
);

-- Editors may manage section overrides, but required template sections cannot be disabled.
drop policy if exists "Editors can manage site section overrides" on public.site_section_overrides;
create policy "Editors can manage site section overrides"
on public.site_section_overrides for all
using (
  public.is_platform_admin()
  or exists (
    select 1 from public.sites
    where sites.id = site_section_overrides.site_id
      and public.has_org_role(sites.organization_id, array['owner', 'admin', 'editor'])
  )
)
with check (
  created_by = auth.uid()
  and exists (
    select 1
    from public.sites
    join public.template_sections on template_sections.id = site_section_overrides.template_section_id
    where sites.id = site_section_overrides.site_id
      and public.has_org_role(sites.organization_id, array['owner', 'admin', 'editor'])
      and (site_section_overrides.is_enabled = true or template_sections.is_required = false)
  )
);

-- Organisation members may read design overrides for their own sites.
drop policy if exists "Members can read site theme overrides" on public.site_theme_overrides;
create policy "Members can read site theme overrides"
on public.site_theme_overrides for select
using (
  public.is_platform_admin()
  or exists (
    select 1 from public.sites
    where sites.id = site_theme_overrides.site_id
      and public.is_org_member(sites.organization_id)
  )
);

-- Editors may manage approved design overrides for their own sites.
drop policy if exists "Editors can manage site theme overrides" on public.site_theme_overrides;
create policy "Editors can manage site theme overrides"
on public.site_theme_overrides for all
using (
  public.is_platform_admin()
  or exists (
    select 1 from public.sites
    where sites.id = site_theme_overrides.site_id
      and public.has_org_role(sites.organization_id, array['owner', 'admin', 'editor'])
  )
)
with check (
  public.is_platform_admin()
  or exists (
    select 1 from public.sites
    where sites.id = site_theme_overrides.site_id
      and public.has_org_role(sites.organization_id, array['owner', 'admin', 'editor'])
  )
);

-- Organisation members may read media metadata for their own sites.
drop policy if exists "Members can read site media" on public.site_media;
create policy "Members can read site media"
on public.site_media for select
using (public.is_org_member(organization_id) or public.is_platform_admin());

-- Editors may manage media metadata for their own sites and organisation.
drop policy if exists "Editors can manage site media" on public.site_media;
create policy "Editors can manage site media"
on public.site_media for all
using (public.has_org_role(organization_id, array['owner', 'admin', 'editor']) or public.is_platform_admin())
with check (
  created_by = auth.uid()
  and public.has_org_role(organization_id, array['owner', 'admin', 'editor'])
  and exists (
    select 1 from public.sites
    where sites.id = site_media.site_id
      and sites.organization_id = site_media.organization_id
  )
);

-- Organisation members may read recovery versions for their own sites.
drop policy if exists "Members can read site versions" on public.site_versions;
create policy "Members can read site versions"
on public.site_versions for select
using (
  public.is_platform_admin()
  or exists (
    select 1 from public.sites
    where sites.id = site_versions.site_id
      and public.is_org_member(sites.organization_id)
  )
);

-- Editors may create manual recovery versions for their own sites.
drop policy if exists "Editors can create site versions" on public.site_versions;
create policy "Editors can create site versions"
on public.site_versions for insert
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.sites
    where sites.id = site_versions.site_id
      and public.has_org_role(sites.organization_id, array['owner', 'admin', 'editor'])
  )
);
