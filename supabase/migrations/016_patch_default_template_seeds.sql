-- Patch migration: seed default_template_id for all technical-services
-- category slugs that are still NULL.  Safe to run multiple times.
-- Run locally with: supabase db push

-- Business categories → technical-services-modern
update public.business_categories
set default_template_id = (
  select id from public.templates where slug = 'technical-services-modern' limit 1
)
where
  slug in (
    'technical-services',
    'technical-services-general',
    'ac-maintenance',
    'mep-services',
    'electrical-plumbing',
    'electrical-services',
    'plumbing-services',
    'painting-services',
    'general-maintenance',
    'facility-management'
  )
  and default_template_id is null
  and exists (
    select 1 from public.templates
    where slug = 'technical-services-modern' and is_active = true
  );

-- Industry fallback → technical-services-modern
update public.industries
set default_template_id = (
  select id from public.templates where slug = 'technical-services-modern' limit 1
)
where
  slug in (
    'construction-technical-services',
    'technical-services',
    'home-services',
    'maintenance-services'
  )
  and default_template_id is null
  and exists (
    select 1 from public.templates
    where slug = 'technical-services-modern' and is_active = true
  );
