-- Phase 4 private site-media bucket and tenant-scoped storage policies.
-- Run manually in the dedicated Website Builder Supabase project only.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

-- Users may read objects only when the path belongs to one of their organisations.
drop policy if exists "Members can read own site media objects" on storage.objects;
create policy "Members can read own site media objects"
on storage.objects for select
using (
  bucket_id = 'site-media'
  and split_part(name, '/', 1) = 'organizations'
  and public.is_org_member((split_part(name, '/', 2))::uuid)
);

-- Owners, admins, and editors may upload media into their organisation-scoped path.
drop policy if exists "Editors can upload own site media objects" on storage.objects;
create policy "Editors can upload own site media objects"
on storage.objects for insert
with check (
  bucket_id = 'site-media'
  and split_part(name, '/', 1) = 'organizations'
  and split_part(name, '/', 3) = 'sites'
  and public.has_org_role((split_part(name, '/', 2))::uuid, array['owner', 'admin', 'editor'])
);

-- Owners, admins, and editors may replace media inside their organisation-scoped path.
drop policy if exists "Editors can update own site media objects" on storage.objects;
create policy "Editors can update own site media objects"
on storage.objects for update
using (
  bucket_id = 'site-media'
  and split_part(name, '/', 1) = 'organizations'
  and public.has_org_role((split_part(name, '/', 2))::uuid, array['owner', 'admin', 'editor'])
)
with check (
  bucket_id = 'site-media'
  and split_part(name, '/', 1) = 'organizations'
  and public.has_org_role((split_part(name, '/', 2))::uuid, array['owner', 'admin', 'editor'])
);

-- Owners, admins, and editors may remove media inside their organisation-scoped path.
drop policy if exists "Editors can delete own site media objects" on storage.objects;
create policy "Editors can delete own site media objects"
on storage.objects for delete
using (
  bucket_id = 'site-media'
  and split_part(name, '/', 1) = 'organizations'
  and public.has_org_role((split_part(name, '/', 2))::uuid, array['owner', 'admin', 'editor'])
);
