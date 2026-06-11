-- Phase 7: Controlled AI assistance.
-- Run this only in the dedicated Supabase project SQL editor.

create table if not exists public.ai_site_profiles (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null unique references public.sites(id) on delete cascade,
  business_name text,
  business_type text,
  industry text,
  target_audience text,
  primary_location text,
  service_areas jsonb not null default '[]'::jsonb,
  services jsonb not null default '[]'::jsonb,
  unique_selling_points jsonb not null default '[]'::jsonb,
  tone text,
  preferred_language text,
  additional_languages jsonb not null default '[]'::jsonb,
  primary_goal text,
  cta_preference text,
  contact_preference text,
  special_notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_generation_requests (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete cascade,
  request_type text not null check (request_type in (
    'full_site_content',
    'section_content',
    'rewrite',
    'shorten',
    'grammar_fix',
    'seo_suggestion',
    'translation',
    'section_recommendation',
    'image_requirements'
  )),
  provider text,
  model text,
  input_snapshot jsonb not null default '{}'::jsonb,
  output_snapshot jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'cancelled')),
  error_code text,
  error_summary text,
  tokens_input integer not null default 0 check (tokens_input >= 0),
  tokens_output integer not null default 0 check (tokens_output >= 0),
  estimated_cost numeric(12, 6) not null default 0 check (estimated_cost >= 0),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.ai_content_suggestions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  request_id uuid references public.ai_generation_requests(id) on delete set null,
  section_key text,
  field_key text not null,
  suggestion_type text not null,
  language text not null default 'English',
  original_value jsonb,
  suggested_value jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'applied', 'expired')),
  applied_by uuid references auth.users(id) on delete set null,
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_usage_limits (
  id uuid primary key default gen_random_uuid(),
  scope_type text not null check (scope_type in ('user', 'organization', 'agency', 'site')),
  scope_id uuid not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  request_limit integer not null default 50 check (request_limit >= 0),
  request_count integer not null default 0 check (request_count >= 0),
  token_limit integer not null default 100000 check (token_limit >= 0),
  token_count integer not null default 0 check (token_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (scope_type, scope_id, period_start, period_end)
);

create table if not exists public.ai_prompt_versions (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  version integer not null,
  purpose text not null,
  prompt_template text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (key, version)
);

create index if not exists ai_generation_requests_site_status_idx
  on public.ai_generation_requests(site_id, status, created_at desc);
create index if not exists ai_generation_requests_type_idx
  on public.ai_generation_requests(request_type, created_at desc);
create index if not exists ai_content_suggestions_site_status_idx
  on public.ai_content_suggestions(site_id, status, created_at desc);
create index if not exists ai_usage_limits_scope_idx
  on public.ai_usage_limits(scope_type, scope_id, period_start, period_end);
create index if not exists ai_prompt_versions_key_active_idx
  on public.ai_prompt_versions(key, is_active);

drop trigger if exists set_ai_site_profiles_updated_at on public.ai_site_profiles;
create trigger set_ai_site_profiles_updated_at
before update on public.ai_site_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_ai_content_suggestions_updated_at on public.ai_content_suggestions;
create trigger set_ai_content_suggestions_updated_at
before update on public.ai_content_suggestions
for each row execute function public.set_updated_at();

drop trigger if exists set_ai_usage_limits_updated_at on public.ai_usage_limits;
create trigger set_ai_usage_limits_updated_at
before update on public.ai_usage_limits
for each row execute function public.set_updated_at();

drop trigger if exists set_ai_prompt_versions_updated_at on public.ai_prompt_versions;
create trigger set_ai_prompt_versions_updated_at
before update on public.ai_prompt_versions
for each row execute function public.set_updated_at();

alter table public.ai_site_profiles enable row level security;
alter table public.ai_generation_requests enable row level security;
alter table public.ai_content_suggestions enable row level security;
alter table public.ai_usage_limits enable row level security;
alter table public.ai_prompt_versions enable row level security;

drop policy if exists "AI profiles are readable by site readers" on public.ai_site_profiles;
create policy "AI profiles are readable by site readers"
on public.ai_site_profiles for select
using (public.can_read_site(site_id) or public.is_platform_admin());

drop policy if exists "AI profiles are editable by site editors" on public.ai_site_profiles;
create policy "AI profiles are editable by site editors"
on public.ai_site_profiles for all
using (public.has_site_permission(site_id, 'edit_content') or public.is_platform_admin())
with check (public.has_site_permission(site_id, 'edit_content') or public.is_platform_admin());

drop policy if exists "AI requests are readable by site readers" on public.ai_generation_requests;
create policy "AI requests are readable by site readers"
on public.ai_generation_requests for select
using (public.can_read_site(site_id) or public.is_platform_admin());

drop policy if exists "AI requests are created by site editors" on public.ai_generation_requests;
create policy "AI requests are created by site editors"
on public.ai_generation_requests for insert
with check (
  requested_by = auth.uid()
  and (public.has_site_permission(site_id, 'edit_content') or public.is_platform_admin())
);

drop policy if exists "AI requests are updated by site editors" on public.ai_generation_requests;
create policy "AI requests are updated by site editors"
on public.ai_generation_requests for update
using (public.has_site_permission(site_id, 'edit_content') or public.is_platform_admin())
with check (public.has_site_permission(site_id, 'edit_content') or public.is_platform_admin());

drop policy if exists "AI suggestions are readable by site readers" on public.ai_content_suggestions;
create policy "AI suggestions are readable by site readers"
on public.ai_content_suggestions for select
using (public.can_read_site(site_id) or public.is_platform_admin());

drop policy if exists "AI suggestions are created by site editors" on public.ai_content_suggestions;
create policy "AI suggestions are created by site editors"
on public.ai_content_suggestions for insert
with check (public.has_site_permission(site_id, 'edit_content') or public.is_platform_admin());

drop policy if exists "AI suggestions are moderated by site editors" on public.ai_content_suggestions;
create policy "AI suggestions are moderated by site editors"
on public.ai_content_suggestions for update
using (public.has_site_permission(site_id, 'edit_content') or public.is_platform_admin())
with check (public.has_site_permission(site_id, 'edit_content') or public.is_platform_admin());

drop policy if exists "AI usage limits admin management" on public.ai_usage_limits;
create policy "AI usage limits admin management"
on public.ai_usage_limits for all
using (public.is_platform_admin())
with check (public.is_platform_admin());

drop policy if exists "AI usage limits visible to related users" on public.ai_usage_limits;
create policy "AI usage limits visible to related users"
on public.ai_usage_limits for select
using (
  public.is_platform_admin()
  or (scope_type = 'user' and scope_id = auth.uid())
  or (scope_type = 'site' and public.can_read_site(scope_id))
  or (
    scope_type = 'organization'
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = scope_id and om.user_id = auth.uid()
    )
  )
  or (scope_type = 'agency' and public.is_agency_member(scope_id))
);

drop policy if exists "AI prompts platform admin select" on public.ai_prompt_versions;
create policy "AI prompts platform admin select"
on public.ai_prompt_versions for select
using (public.is_platform_admin());

drop policy if exists "AI prompts platform admin management" on public.ai_prompt_versions;
create policy "AI prompts platform admin management"
on public.ai_prompt_versions for all
using (public.is_platform_admin())
with check (public.is_platform_admin());

insert into public.ai_prompt_versions (key, version, purpose, prompt_template, is_active)
values
  ('full_site_content', 1, 'Generate structured website content suggestions only.', 'Return JSON matching the approved site content schema. Do not include HTML, CSS, scripts, unsupported sections, publishing actions, domains, invitations, ownership, billing, or permission changes.', true),
  ('section_content', 1, 'Generate content for one approved section.', 'Return JSON for approved fields in the requested section only. Respect field limits and keep output reviewable.', true),
  ('rewrite', 1, 'Improve one existing text field.', 'Return a concise JSON suggestion for the supplied field. Preserve meaning and never overwrite content directly.', true),
  ('shorten', 1, 'Shorten one existing text field.', 'Return a shorter JSON suggestion that respects the field limit and keeps the original intent.', true),
  ('grammar_fix', 1, 'Fix grammar for one existing text field.', 'Return a corrected JSON suggestion without changing facts, offers, domains, permissions, or publishing state.', true),
  ('seo_suggestion', 1, 'Suggest SEO metadata.', 'Return JSON for SEO title, description, Open Graph fields, and keywords without ranking promises or keyword stuffing.', true),
  ('translation', 1, 'Translate structured content fields.', 'Return translated JSON fields only. Preserve source language and prepare RTL metadata for Arabic.', true),
  ('section_recommendation', 1, 'Recommend approved section variants.', 'Return only section keys from the approved registry, with short reasons. Do not enable or reorder sections automatically.', true),
  ('image_requirements', 1, 'Create media upload checklist.', 'Return practical image requirements for enabled approved sections. Do not generate images or invent stock photo claims.', true)
on conflict (key, version) do update
set purpose = excluded.purpose,
    prompt_template = excluded.prompt_template,
    is_active = excluded.is_active,
    updated_at = now();

-- RLS notes:
-- 1. AI profile, request, suggestion, and usage data are tenant scoped through can_read_site/has_site_permission.
-- 2. Viewers can read profile/request/suggestion data only when they have preview access; they cannot create or update AI data.
-- 3. Public visitors have no table access because every policy requires auth-backed helpers or platform admin status.
-- 4. Prompt templates and usage-limit management are platform-admin only.
-- 5. AI tables never bypass existing editor, publishing, invitation, ownership, or domain policies.
