-- Phase 6 handover hardening.
-- Apply after 009_phase6_access_hardening.sql in the dedicated Website Builder Supabase project.

alter table public.site_ownership_transfers
add column if not exists preserve_developer_access boolean not null default true;
