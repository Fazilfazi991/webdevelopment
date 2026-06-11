-- Phase 6 hardening patch for client associations, invitation permissions, and transfer completion.
-- Apply after 008_phase6_agency_client_access.sql in the dedicated Website Builder Supabase project.

alter table public.client_invitations
add column if not exists permissions jsonb not null default '{}'::jsonb,
add column if not exists keep_developer_access boolean not null default true;

create table if not exists public.agency_site_clients (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  site_id uuid not null unique references public.sites(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agency_id, client_id, site_id)
);

create index if not exists agency_site_clients_agency_id_idx on public.agency_site_clients(agency_id);
create index if not exists agency_site_clients_client_id_idx on public.agency_site_clients(client_id);

drop trigger if exists set_agency_site_clients_updated_at on public.agency_site_clients;
create trigger set_agency_site_clients_updated_at
before update on public.agency_site_clients
for each row execute function public.set_updated_at();

alter table public.agency_site_clients enable row level security;

drop policy if exists "Agency members can read agency site clients" on public.agency_site_clients;
create policy "Agency members can read agency site clients"
on public.agency_site_clients for select
using (public.is_agency_member(agency_id) or public.can_read_site(site_id));

drop policy if exists "Agency workers can manage agency site clients" on public.agency_site_clients;
create policy "Agency workers can manage agency site clients"
on public.agency_site_clients for all
using (public.has_agency_role(agency_id, array['owner','admin','developer']))
with check (
  created_by = auth.uid()
  and public.has_agency_role(agency_id, array['owner','admin','developer'])
  and exists (
    select 1 from public.clients
    where clients.id = agency_site_clients.client_id
      and clients.agency_id = agency_site_clients.agency_id
  )
);

drop policy if exists "Invite managers can manage invitations" on public.client_invitations;
create policy "Invite managers can manage invitations"
on public.client_invitations for all
using (public.has_site_permission(site_id, 'invite_users'))
with check (
  invited_by = auth.uid()
  and public.has_site_permission(site_id, 'invite_users')
  and exists (
    select 1
    from public.agency_site_clients
    where agency_site_clients.client_id = client_invitations.client_id
      and agency_site_clients.site_id = client_invitations.site_id
  )
);

drop policy if exists "Transfer managers can manage ownership transfers" on public.site_ownership_transfers;

drop policy if exists "Transfer managers can create ownership transfers" on public.site_ownership_transfers;
create policy "Transfer managers can create ownership transfers"
on public.site_ownership_transfers for insert
with check (requested_by = auth.uid() and public.has_site_permission(site_id, 'transfer_ownership'));

drop policy if exists "Transfer managers can update ownership transfers" on public.site_ownership_transfers;
create policy "Transfer managers can update ownership transfers"
on public.site_ownership_transfers for update
using (public.has_site_permission(site_id, 'transfer_ownership'))
with check (public.has_site_permission(site_id, 'transfer_ownership'));
