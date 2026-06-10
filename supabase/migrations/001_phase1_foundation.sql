-- Phase 1 foundation for the dedicated Website Builder project only.
-- Target: https://caaacypgmlbkmmgobsdc.supabase.co
-- Do not apply this file to Plumlet or any other product database.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  country_code text,
  preferred_language text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  country_code text not null,
  default_currency text not null,
  timezone text not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  website_type text not null check (website_type in ('business_website')),
  status text not null default 'draft' check (status in ('draft', 'published', 'suspended', 'archived')),
  country_code text not null,
  default_language text not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.platform_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.media_library (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  site_id uuid references public.sites(id) on delete set null,
  file_name text not null,
  file_path text not null,
  file_type text not null,
  file_size bigint not null,
  alt_text text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists organization_members_user_id_idx on public.organization_members(user_id);
create index if not exists organization_members_organization_id_idx on public.organization_members(organization_id);
create index if not exists sites_organization_id_idx on public.sites(organization_id);
create index if not exists media_library_organization_id_idx on public.media_library(organization_id);
create index if not exists media_library_site_id_idx on public.media_library(site_id);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_organizations_updated_at on public.organizations;
create trigger set_organizations_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

drop trigger if exists set_sites_updated_at on public.sites;
create trigger set_sites_updated_at
before update on public.sites
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, country_code, preferred_language)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    coalesce(new.raw_user_meta_data->>'country_code', 'IN'),
    coalesce(new.raw_user_meta_data->>'preferred_language', 'en')
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email,
    country_code = excluded.country_code,
    preferred_language = excluded.preferred_language,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = org_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.has_org_role(org_id uuid, allowed_roles text[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = org_id
      and user_id = auth.uid()
      and role = any(allowed_roles)
  );
$$;

create or replace function public.is_org_creator(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.organizations
    where id = org_id
      and created_by = auth.uid()
  );
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.platform_admins
    where user_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.sites enable row level security;
alter table public.platform_admins enable row level security;
alter table public.media_library enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles for select
using (id = auth.uid() or public.is_platform_admin());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
with check (id = auth.uid());

drop policy if exists "Members can view organizations" on public.organizations;
create policy "Members can view organizations"
on public.organizations for select
using (public.is_org_member(id) or public.is_platform_admin());

drop policy if exists "Authenticated users can create organizations" on public.organizations;
create policy "Authenticated users can create organizations"
on public.organizations for insert
with check (created_by = auth.uid());

drop policy if exists "Owners and admins can update organizations" on public.organizations;
create policy "Owners and admins can update organizations"
on public.organizations for update
using (public.has_org_role(id, array['owner', 'admin']) or public.is_platform_admin())
with check (public.has_org_role(id, array['owner', 'admin']) or public.is_platform_admin());

drop policy if exists "Members can view organization memberships" on public.organization_members;
create policy "Members can view organization memberships"
on public.organization_members for select
using (public.is_org_member(organization_id) or public.is_platform_admin());

drop policy if exists "Creators can add themselves as owner" on public.organization_members;
create policy "Creators can add themselves as owner"
on public.organization_members for insert
with check (
  user_id = auth.uid()
  and role = 'owner'
  and public.is_org_creator(organization_id)
);

drop policy if exists "Owners and admins can manage organization memberships" on public.organization_members;
create policy "Owners and admins can manage organization memberships"
on public.organization_members for update
using (public.has_org_role(organization_id, array['owner', 'admin']) or public.is_platform_admin())
with check (public.has_org_role(organization_id, array['owner', 'admin']) or public.is_platform_admin());

drop policy if exists "Members can view sites" on public.sites;
create policy "Members can view sites"
on public.sites for select
using (public.is_org_member(organization_id) or public.is_platform_admin());

drop policy if exists "Owners admins and editors can create sites" on public.sites;
create policy "Owners admins and editors can create sites"
on public.sites for insert
with check (
  created_by = auth.uid()
  and status = 'draft'
  and public.has_org_role(organization_id, array['owner', 'admin', 'editor'])
);

drop policy if exists "Owners admins and editors can update sites" on public.sites;
create policy "Owners admins and editors can update sites"
on public.sites for update
using (public.has_org_role(organization_id, array['owner', 'admin', 'editor']) or public.is_platform_admin())
with check (public.has_org_role(organization_id, array['owner', 'admin', 'editor']) or public.is_platform_admin());

drop policy if exists "Platform admins can view platform admins" on public.platform_admins;
create policy "Platform admins can view platform admins"
on public.platform_admins for select
using (public.is_platform_admin());

drop policy if exists "Members can view media" on public.media_library;
create policy "Members can view media"
on public.media_library for select
using (public.is_org_member(organization_id) or public.is_platform_admin());

drop policy if exists "Owners admins and editors can create media" on public.media_library;
create policy "Owners admins and editors can create media"
on public.media_library for insert
with check (
  created_by = auth.uid()
  and public.has_org_role(organization_id, array['owner', 'admin', 'editor'])
);

drop policy if exists "Owners admins and editors can update media" on public.media_library;
create policy "Owners admins and editors can update media"
on public.media_library for update
using (public.has_org_role(organization_id, array['owner', 'admin', 'editor']) or public.is_platform_admin())
with check (public.has_org_role(organization_id, array['owner', 'admin', 'editor']) or public.is_platform_admin());
