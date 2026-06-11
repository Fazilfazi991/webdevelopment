-- Migration 017: Fix RLS policies for site template selections and site media storage.
-- Target: dedicated Website Builder project only.
-- Do not apply this file to Plumlet or any other product database.

-- Redefine public.can_read_site to support published sites for anonymous visitors
create or replace function public.can_read_site(target_site_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select public.is_platform_admin()
    or exists (
      select 1 from public.sites
      where sites.id = target_site_id
        and (
          public.is_org_member(sites.organization_id)
          or (sites.publication_status = 'published' and sites.status <> 'suspended')
        )
    )
    or exists (
      select 1 from public.site_access_members
      where site_id = target_site_id and user_id = auth.uid()
    );
$$;

-- 1. site_template_selections Policies
drop policy if exists "Members can view site template selections" on public.site_template_selections;
create policy "Members can view site template selections" on public.site_template_selections for select
using (
  public.is_platform_admin()
  or public.can_read_site(site_id)
);

drop policy if exists "Editors can create site template selections" on public.site_template_selections;
create policy "Editors can create site template selections" on public.site_template_selections for insert
with check (
  selected_by = auth.uid()
  and exists (
    select 1
    from public.sites
    join public.industries on industries.id = site_template_selections.industry_id
    left join public.business_categories on business_categories.id = site_template_selections.business_category_id
    left join public.templates on templates.id = site_template_selections.template_id
    left join public.template_categories on template_categories.template_id = templates.id
      and template_categories.business_category_id = business_categories.id
    where sites.id = site_template_selections.site_id
      and industries.is_active = true
      and (business_categories.id is null or (business_categories.industry_id = site_template_selections.industry_id and business_categories.is_active = true))
      and (templates.id is null or (templates.is_active = true and template_categories.id is not null))
      and (
        public.has_org_role(sites.organization_id, array['owner', 'admin', 'editor'])
        or public.has_site_permission(sites.id, 'edit_content')
      )
  )
);

drop policy if exists "Editors can update site template selections" on public.site_template_selections;
create policy "Editors can update site template selections" on public.site_template_selections for update
using (
  public.is_platform_admin()
  or public.has_org_role(
    (select organization_id from public.sites where id = site_template_selections.site_id),
    array['owner', 'admin', 'editor']
  )
  or public.has_site_permission(site_id, 'edit_content')
)
with check (
  public.is_platform_admin()
  or (
    selected_by = auth.uid()
    and exists (
      select 1
      from public.sites
      join public.industries on industries.id = site_template_selections.industry_id
      left join public.business_categories on business_categories.id = site_template_selections.business_category_id
      left join public.templates on templates.id = site_template_selections.template_id
      left join public.template_categories on template_categories.template_id = templates.id
        and template_categories.business_category_id = business_categories.id
      where sites.id = site_template_selections.site_id
        and industries.is_active = true
        and (business_categories.id is null or (business_categories.industry_id = site_template_selections.industry_id and business_categories.is_active = true))
        and (templates.id is null or (templates.is_active = true and template_categories.id is not null))
        and (
          public.has_org_role(sites.organization_id, array['owner', 'admin', 'editor'])
          or public.has_site_permission(sites.id, 'edit_content')
        )
    )
  )
);

drop policy if exists "Editors can delete site template selections" on public.site_template_selections;
create policy "Editors can delete site template selections" on public.site_template_selections for delete
using (
  public.is_platform_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = site_template_selections.site_id
      and (
        public.has_org_role(sites.organization_id, array['owner', 'admin', 'editor'])
        or public.has_site_permission(sites.id, 'edit_content')
      )
  )
);


-- 2. storage.objects Policies (Site Access members support)
drop policy if exists "Members can read own site media objects" on storage.objects;
create policy "Members can read own site media objects"
on storage.objects for select
using (
  bucket_id = 'site-media'
  and split_part(name, '/', 1) = 'organizations'
  and (
    public.is_org_member((split_part(name, '/', 2))::uuid)
    or (
      split_part(name, '/', 3) = 'sites'
      and public.can_read_site((split_part(name, '/', 4))::uuid)
    )
  )
);

drop policy if exists "Editors can upload own site media objects" on storage.objects;
create policy "Editors can upload own site media objects"
on storage.objects for insert
with check (
  bucket_id = 'site-media'
  and split_part(name, '/', 1) = 'organizations'
  and (
    (
      split_part(name, '/', 3) = 'sites'
      and public.has_org_role((split_part(name, '/', 2))::uuid, array['owner', 'admin', 'editor'])
    )
    or (
      split_part(name, '/', 3) = 'sites'
      and public.has_site_permission((split_part(name, '/', 4))::uuid, 'upload_media')
    )
  )
);

drop policy if exists "Editors can update own site media objects" on storage.objects;
create policy "Editors can update own site media objects"
on storage.objects for update
using (
  bucket_id = 'site-media'
  and split_part(name, '/', 1) = 'organizations'
  and (
    public.has_org_role((split_part(name, '/', 2))::uuid, array['owner', 'admin', 'editor'])
    or (
      split_part(name, '/', 3) = 'sites'
      and public.has_site_permission((split_part(name, '/', 4))::uuid, 'upload_media')
    )
  )
)
with check (
  bucket_id = 'site-media'
  and split_part(name, '/', 1) = 'organizations'
  and (
    public.has_org_role((split_part(name, '/', 2))::uuid, array['owner', 'admin', 'editor'])
    or (
      split_part(name, '/', 3) = 'sites'
      and public.has_site_permission((split_part(name, '/', 4))::uuid, 'upload_media')
    )
  )
);

drop policy if exists "Editors can delete own site media objects" on storage.objects;
create policy "Editors can delete own site media objects"
on storage.objects for delete
using (
  bucket_id = 'site-media'
  and split_part(name, '/', 1) = 'organizations'
  and (
    public.has_org_role((split_part(name, '/', 2))::uuid, array['owner', 'admin', 'editor'])
    or (
      split_part(name, '/', 3) = 'sites'
      and public.has_site_permission((split_part(name, '/', 4))::uuid, 'upload_media')
    )
  )
);
