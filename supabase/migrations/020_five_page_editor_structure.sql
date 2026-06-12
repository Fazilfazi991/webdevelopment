-- Studio OS five-page editor structure.
-- Additive only: preserves site profiles, media, overrides, leads, domains, and published snapshots.
-- Review and apply manually to the dedicated Website Builder project.

alter table public.template_pages add column if not exists navigation_label text;
alter table public.template_pages add column if not exists is_enabled boolean not null default true;
alter table public.template_pages add column if not exists is_required boolean not null default false;
alter table public.template_pages add column if not exists seo_title text;
alter table public.template_pages add column if not exists seo_description text;

with page_defaults(page_name, page_slug, navigation_label, display_order, is_default, is_enabled, is_required, seo_title, seo_description) as (
  values
    ('Home', 'home', 'Home', 1, true, true, true, 'Home', 'A clear overview of the business, services, proof, and contact options.'),
    ('About', 'about', 'About', 2, false, true, false, 'About', 'Business background, experience, service approach, and trust signals.'),
    ('Services', 'services', 'Services', 3, false, true, false, 'Services', 'Detailed services, service areas, process, and quote request options.'),
    ('Projects', 'projects', 'Projects', 4, false, true, false, 'Projects', 'Project photos, examples, featured work, and customer proof.'),
    ('Contact', 'contact', 'Contact', 5, false, true, false, 'Contact', 'Contact details, WhatsApp and phone actions, map, hours, and enquiry form.')
)
insert into public.template_pages (
  template_id,
  page_name,
  page_slug,
  navigation_label,
  display_order,
  is_default,
  is_enabled,
  is_required,
  seo_title,
  seo_description
)
select
  t.id,
  p.page_name,
  p.page_slug,
  p.navigation_label,
  p.display_order,
  p.is_default,
  p.is_enabled,
  p.is_required,
  p.seo_title,
  p.seo_description
from public.templates t
cross join page_defaults p
where t.slug in ('technical-services-modern', 'service-modern', 'service-minimal', 'service-bold')
on conflict (template_id, page_slug) do update set
  page_name = excluded.page_name,
  navigation_label = excluded.navigation_label,
  display_order = excluded.display_order,
  is_default = excluded.is_default,
  is_enabled = excluded.is_enabled,
  is_required = excluded.is_required,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description;

-- Keep the approved service recipes structurally complete by cloning any missing
-- canonical page sections from Technical Services. Existing section overrides
-- and published snapshots are not changed.
insert into public.template_sections (
  template_id,
  section_variant_id,
  page_slug,
  section_key,
  display_order,
  is_required,
  is_active,
  default_content,
  default_settings
)
select
  target.id,
  source.section_variant_id,
  source.page_slug,
  source.section_key,
  source.display_order,
  source.is_required,
  source.is_active,
  source.default_content,
  source.default_settings
from public.template_sections source
join public.templates base on base.id = source.template_id and base.slug = 'technical-services-modern'
cross join public.templates target
where target.slug in ('service-modern', 'service-minimal', 'service-bold')
  and source.page_slug in ('home', 'about', 'services', 'projects', 'contact')
on conflict (template_id, page_slug, section_key) do nothing;

-- Home should have one customer-facing Contact Preview in the editor. The full
-- enquiry form remains on the Contact page, and existing published versions
-- remain untouched.
update public.template_sections ts
set is_active = false,
    is_required = false,
    updated_at = now()
from public.templates t
where ts.template_id = t.id
  and t.slug in ('technical-services-modern', 'service-modern', 'service-minimal', 'service-bold')
  and ts.page_slug = 'home'
  and ts.section_key = 'contact-map-form'
  and exists (
    select 1
    from public.template_sections cta
    where cta.template_id = ts.template_id
      and cta.page_slug = 'home'
      and cta.section_key = 'contact-cta-banner'
      and cta.is_active = true
  );

create index if not exists template_pages_template_enabled_idx
on public.template_pages(template_id, is_enabled, display_order);
