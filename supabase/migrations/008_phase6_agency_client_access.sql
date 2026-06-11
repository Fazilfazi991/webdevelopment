-- Phase 6 agency, client access, and handover workflows.
-- Target: dedicated Website Builder project only.
-- Do not apply this file to Plumlet or any unrelated database.

create table if not exists public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  country_code text not null,
  website text,
  logo_url text,
  support_email text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agency_members (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'developer', 'viewer')),
  invited_by uuid references auth.users(id) on delete set null,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agency_id, user_id)
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  name text not null,
  company_name text,
  email text,
  phone text,
  country_code text,
  notes text,
  status text not null default 'active' check (status in ('active', 'invited', 'inactive', 'archived')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_access_members (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  access_role text not null check (access_role in ('agency_owner', 'agency_admin', 'developer', 'client_owner', 'client_editor', 'client_viewer')),
  permissions jsonb not null default '{}'::jsonb,
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, user_id)
);

create table if not exists public.client_invitations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete cascade,
  email text not null,
  invitation_token text not null unique,
  invitation_status text not null default 'pending' check (invitation_status in ('pending', 'accepted', 'expired', 'cancelled')),
  access_role text not null check (access_role in ('client_owner', 'client_editor', 'client_viewer')),
  expires_at timestamptz not null,
  invited_by uuid not null references auth.users(id) on delete restrict,
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_ownership (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null unique references public.sites(id) on delete cascade,
  ownership_type text not null check (ownership_type in ('organization', 'agency', 'client')),
  owner_organization_id uuid references public.organizations(id) on delete set null,
  owner_agency_id uuid references public.agencies(id) on delete set null,
  owner_client_user_id uuid references auth.users(id) on delete set null,
  transferred_by uuid references auth.users(id) on delete set null,
  transferred_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (ownership_type = 'organization' and owner_organization_id is not null)
    or (ownership_type = 'agency' and owner_agency_id is not null)
    or (ownership_type = 'client' and owner_client_user_id is not null)
  )
);

create table if not exists public.site_ownership_transfers (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  from_ownership_type text not null,
  to_ownership_type text not null,
  from_owner_reference text,
  to_owner_reference text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'cancelled', 'completed')),
  requested_by uuid not null references auth.users(id) on delete restrict,
  approved_by uuid references auth.users(id) on delete set null,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.site_activity_log (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action_type text not null,
  action_summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists agency_members_user_id_idx on public.agency_members(user_id);
create index if not exists clients_agency_id_idx on public.clients(agency_id);
create index if not exists client_invitations_site_id_idx on public.client_invitations(site_id);
create index if not exists client_invitations_email_idx on public.client_invitations(email);
create index if not exists site_access_members_user_id_idx on public.site_access_members(user_id);
create index if not exists site_access_members_site_id_idx on public.site_access_members(site_id);
create index if not exists site_activity_log_site_id_created_at_idx on public.site_activity_log(site_id, created_at desc);

drop trigger if exists set_agencies_updated_at on public.agencies;
create trigger set_agencies_updated_at before update on public.agencies for each row execute function public.set_updated_at();
drop trigger if exists set_agency_members_updated_at on public.agency_members;
create trigger set_agency_members_updated_at before update on public.agency_members for each row execute function public.set_updated_at();
drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at before update on public.clients for each row execute function public.set_updated_at();
drop trigger if exists set_client_invitations_updated_at on public.client_invitations;
create trigger set_client_invitations_updated_at before update on public.client_invitations for each row execute function public.set_updated_at();
drop trigger if exists set_site_access_members_updated_at on public.site_access_members;
create trigger set_site_access_members_updated_at before update on public.site_access_members for each row execute function public.set_updated_at();
drop trigger if exists set_site_ownership_updated_at on public.site_ownership;
create trigger set_site_ownership_updated_at before update on public.site_ownership for each row execute function public.set_updated_at();

create or replace function public.is_agency_member(target_agency_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.agency_members
    where agency_id = target_agency_id and user_id = auth.uid()
  ) or public.is_platform_admin();
$$;

create or replace function public.has_agency_role(target_agency_id uuid, allowed_roles text[])
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.agency_members
    where agency_id = target_agency_id and user_id = auth.uid() and role = any(allowed_roles)
  ) or public.is_platform_admin();
$$;

create or replace function public.has_site_permission(target_site_id uuid, permission_key text)
returns boolean language sql security definer set search_path = public stable as $$
  select public.is_platform_admin()
    or exists (
      select 1
      from public.sites
      where sites.id = target_site_id
        and public.has_org_role(sites.organization_id, array['owner','admin','editor'])
    )
    or exists (
      select 1
      from public.site_access_members
      where site_id = target_site_id
        and user_id = auth.uid()
        and (
          coalesce((permissions ->> permission_key)::boolean, false) = true
          or access_role in ('agency_owner','agency_admin','client_owner')
        )
    );
$$;

create or replace function public.can_read_site(target_site_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select public.is_platform_admin()
    or exists (
      select 1 from public.sites
      where sites.id = target_site_id and public.is_org_member(sites.organization_id)
    )
    or exists (
      select 1 from public.site_access_members
      where site_id = target_site_id and user_id = auth.uid()
    );
$$;

insert into public.site_ownership (site_id, ownership_type, owner_organization_id)
select id, 'organization', organization_id
from public.sites
on conflict (site_id) do nothing;

alter table public.agencies enable row level security;
alter table public.agency_members enable row level security;
alter table public.clients enable row level security;
alter table public.client_invitations enable row level security;
alter table public.site_access_members enable row level security;
alter table public.site_ownership enable row level security;
alter table public.site_ownership_transfers enable row level security;
alter table public.site_activity_log enable row level security;

drop policy if exists "Agency members can read agencies" on public.agencies;
create policy "Agency members can read agencies" on public.agencies for select
using (public.is_agency_member(id));

drop policy if exists "Users can create agencies" on public.agencies;
create policy "Users can create agencies" on public.agencies for insert
with check (created_by = auth.uid());

drop policy if exists "Agency owners and admins can update agencies" on public.agencies;
create policy "Agency owners and admins can update agencies" on public.agencies for update
using (public.has_agency_role(id, array['owner','admin']))
with check (public.has_agency_role(id, array['owner','admin']));

drop policy if exists "Agency members can read agency members" on public.agency_members;
create policy "Agency members can read agency members" on public.agency_members for select
using (public.is_agency_member(agency_id));

drop policy if exists "Agency owners and admins manage members" on public.agency_members;
create policy "Agency owners and admins manage members" on public.agency_members for all
using (public.has_agency_role(agency_id, array['owner','admin']))
with check (public.has_agency_role(agency_id, array['owner','admin']) or user_id = auth.uid());

drop policy if exists "Agency members can read clients" on public.clients;
create policy "Agency members can read clients" on public.clients for select
using (public.is_agency_member(agency_id));

drop policy if exists "Agency owners admins developers manage clients" on public.clients;
create policy "Agency owners admins developers manage clients" on public.clients for all
using (public.has_agency_role(agency_id, array['owner','admin','developer']))
with check (created_by = auth.uid() and public.has_agency_role(agency_id, array['owner','admin','developer']));

drop policy if exists "Permitted users can read invitations" on public.client_invitations;
create policy "Permitted users can read invitations" on public.client_invitations for select
using (
  public.can_read_site(site_id)
  or lower(email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
);

drop policy if exists "Invite managers can manage invitations" on public.client_invitations;
create policy "Invite managers can manage invitations" on public.client_invitations for all
using (public.has_site_permission(site_id, 'invite_users'))
with check (invited_by = auth.uid() and public.has_site_permission(site_id, 'invite_users'));

drop policy if exists "Invited users can accept their invitation" on public.client_invitations;
create policy "Invited users can accept their invitation" on public.client_invitations for update
using (lower(email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
with check (lower(email) = lower(coalesce((auth.jwt() ->> 'email'), '')));

drop policy if exists "Site readers can read access members" on public.site_access_members;
create policy "Site readers can read access members" on public.site_access_members for select
using (public.can_read_site(site_id));

drop policy if exists "Invite managers can manage access members" on public.site_access_members;
create policy "Invite managers can manage access members" on public.site_access_members for all
using (public.has_site_permission(site_id, 'invite_users'))
with check (public.has_site_permission(site_id, 'invite_users'));

drop policy if exists "Users can insert accepted own access" on public.site_access_members;
create policy "Users can insert accepted own access" on public.site_access_members for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.client_invitations
    where client_invitations.site_id = site_access_members.site_id
      and client_invitations.access_role = site_access_members.access_role
      and client_invitations.invitation_status = 'pending'
      and client_invitations.expires_at > now()
      and lower(client_invitations.email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
  )
);

drop policy if exists "Site readers can read ownership" on public.site_ownership;
create policy "Site readers can read ownership" on public.site_ownership for select
using (public.can_read_site(site_id));

drop policy if exists "Transfer managers can update ownership" on public.site_ownership;
create policy "Transfer managers can update ownership" on public.site_ownership for update
using (public.has_site_permission(site_id, 'transfer_ownership'))
with check (public.has_site_permission(site_id, 'transfer_ownership'));

drop policy if exists "Site readers can read ownership transfers" on public.site_ownership_transfers;
create policy "Site readers can read ownership transfers" on public.site_ownership_transfers for select
using (public.can_read_site(site_id));

drop policy if exists "Transfer managers can manage ownership transfers" on public.site_ownership_transfers;
create policy "Transfer managers can manage ownership transfers" on public.site_ownership_transfers for all
using (public.has_site_permission(site_id, 'transfer_ownership'))
with check (requested_by = auth.uid() and public.has_site_permission(site_id, 'transfer_ownership'));

drop policy if exists "Site readers can read activity" on public.site_activity_log;
create policy "Site readers can read activity" on public.site_activity_log for select
using (public.can_read_site(site_id));

drop policy if exists "Permitted users can create activity" on public.site_activity_log;
create policy "Permitted users can create activity" on public.site_activity_log for insert
with check (actor_user_id = auth.uid() and public.can_read_site(site_id));

drop policy if exists "Site access members can view sites" on public.sites;
create policy "Site access members can view sites" on public.sites for select
using (public.can_read_site(id));

drop policy if exists "Site access editors can update sites" on public.sites;
create policy "Site access editors can update sites" on public.sites for update
using (
  public.has_site_permission(id, 'edit_content')
  or public.has_site_permission(id, 'publish_site')
  or public.has_site_permission(id, 'manage_domains')
)
with check (
  public.has_site_permission(id, 'edit_content')
  or public.has_site_permission(id, 'publish_site')
  or public.has_site_permission(id, 'manage_domains')
);

drop policy if exists "Site access can read business profiles" on public.site_business_profiles;
create policy "Site access can read business profiles" on public.site_business_profiles for select
using (public.can_read_site(site_id));

drop policy if exists "Site access can manage business profiles" on public.site_business_profiles;
create policy "Site access can manage business profiles" on public.site_business_profiles for all
using (public.has_site_permission(site_id, 'edit_content'))
with check (public.has_site_permission(site_id, 'edit_content'));

drop policy if exists "Site access can read section overrides" on public.site_section_overrides;
create policy "Site access can read section overrides" on public.site_section_overrides for select
using (public.can_read_site(site_id));

drop policy if exists "Site access can manage section overrides" on public.site_section_overrides;
create policy "Site access can manage section overrides" on public.site_section_overrides for all
using (public.has_site_permission(site_id, 'edit_content') or public.has_site_permission(site_id, 'manage_sections'))
with check (public.has_site_permission(site_id, 'edit_content') or public.has_site_permission(site_id, 'manage_sections'));

drop policy if exists "Site access can read theme overrides" on public.site_theme_overrides;
create policy "Site access can read theme overrides" on public.site_theme_overrides for select
using (public.can_read_site(site_id));

drop policy if exists "Site access can manage theme overrides" on public.site_theme_overrides;
create policy "Site access can manage theme overrides" on public.site_theme_overrides for all
using (public.has_site_permission(site_id, 'edit_design'))
with check (public.has_site_permission(site_id, 'edit_design'));

drop policy if exists "Site access can read media" on public.site_media;
create policy "Site access can read media" on public.site_media for select
using (public.can_read_site(site_id));

drop policy if exists "Site access can manage media" on public.site_media;
create policy "Site access can manage media" on public.site_media for all
using (public.has_site_permission(site_id, 'upload_media'))
with check (public.has_site_permission(site_id, 'upload_media'));

drop policy if exists "Site access can read leads" on public.contact_leads;
create policy "Site access can read leads" on public.contact_leads for select
using (public.has_site_permission(site_id, 'view_leads'));

drop policy if exists "Site access can update leads" on public.contact_leads;
create policy "Site access can update leads" on public.contact_leads for update
using (public.has_site_permission(site_id, 'update_leads'))
with check (public.has_site_permission(site_id, 'update_leads'));
