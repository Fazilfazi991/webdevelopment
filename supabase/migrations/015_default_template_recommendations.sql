-- Store default template recommendations so onboarding can prepare a website
-- before asking customers to browse the full template marketplace.

alter table public.industries
add column if not exists default_template_id uuid references public.templates(id) on delete set null;

alter table public.business_categories
add column if not exists default_template_id uuid references public.templates(id) on delete set null;

create index if not exists industries_default_template_id_idx
on public.industries(default_template_id);

create index if not exists business_categories_default_template_id_idx
on public.business_categories(default_template_id);

update public.business_categories
set default_template_id = (select id from public.templates where slug = 'technical-services-modern')
where slug in (
  'technical-services',
  'ac-maintenance',
  'mep-services',
  'electrical-plumbing',
  'electrical-services',
  'plumbing-services',
  'painting-services'
)
and exists (select 1 from public.templates where slug = 'technical-services-modern');

update public.industries
set default_template_id = (select id from public.templates where slug = 'technical-services-modern')
where slug = 'construction-technical-services'
and exists (select 1 from public.templates where slug = 'technical-services-modern');
