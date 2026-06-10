-- PLACEHOLDER ONLY. DO NOT APPLY TO PLUMLET OR ANY EXISTING SUPABASE PROJECT.
-- This SQL documents the intended Phase 1 schema and RLS shape for a future,
-- separate Supabase project dedicated to this website-builder SaaS.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key,
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
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null,
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
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.platform_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
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
  created_by uuid not null,
  created_at timestamptz not null default now()
);

-- Intended RLS policy summary for the future separate Supabase project:
-- 1. Profiles: users can select/update their own profile row.
-- 2. Organizations: members can select; owner/admin members can update.
-- 3. Organization members: members can select members in their organization.
-- 4. Sites: organization members can select; owner/admin/editor can insert/update.
-- 5. Media library: organization members can select; owner/admin/editor can insert/update.
-- 6. Platform admins: platform admins can select admin-only summaries.
-- 7. Storage: future buckets should scope paths by organization_id and site_id.

-- Full RLS policies should be reviewed and applied only after creating the new
-- dedicated Supabase project for this product.
