-- Follow-up RLS tightening for the dedicated Website Builder project only.
-- Target: https://caaacypgmlbkmmgobsdc.supabase.co
-- Apply manually if 001_phase1_foundation.sql was already executed before this file existed.

drop policy if exists "Members can view organizations" on public.organizations;
create policy "Members can view organizations"
on public.organizations for select
using (public.is_org_member(id) or public.is_platform_admin());
