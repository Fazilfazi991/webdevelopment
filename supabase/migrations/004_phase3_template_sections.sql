-- Phase 3 reusable template renderer for the dedicated Website Builder project only.
-- Target: https://caaacypgmlbkmmgobsdc.supabase.co
-- Do not apply this file to Plumlet or any other product database.

create table if not exists public.section_variants (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  section_type text not null check (section_type in ('header', 'hero', 'services', 'about', 'gallery', 'testimonials', 'faq', 'contact', 'footer', 'floating_action')),
  description text,
  schema_version integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.template_sections (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates(id) on delete cascade,
  section_variant_id uuid not null references public.section_variants(id) on delete restrict,
  page_slug text not null,
  section_key text not null,
  display_order integer not null default 0,
  is_required boolean not null default false,
  is_active boolean not null default true,
  default_content jsonb not null default '{}'::jsonb,
  default_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (template_id, page_slug, section_key)
);

create table if not exists public.template_theme_presets (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates(id) on delete cascade,
  name text not null,
  key text not null,
  is_default boolean not null default false,
  theme_tokens jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (template_id, key)
);

create unique index if not exists template_theme_presets_one_default_idx
on public.template_theme_presets(template_id)
where is_default = true;

create index if not exists template_sections_template_page_idx on public.template_sections(template_id, page_slug, display_order);
create index if not exists template_sections_variant_id_idx on public.template_sections(section_variant_id);
create index if not exists template_theme_presets_template_id_idx on public.template_theme_presets(template_id);

drop trigger if exists set_section_variants_updated_at on public.section_variants;
create trigger set_section_variants_updated_at
before update on public.section_variants
for each row execute function public.set_updated_at();

drop trigger if exists set_template_sections_updated_at on public.template_sections;
create trigger set_template_sections_updated_at
before update on public.template_sections
for each row execute function public.set_updated_at();

drop trigger if exists set_template_theme_presets_updated_at on public.template_theme_presets;
create trigger set_template_theme_presets_updated_at
before update on public.template_theme_presets
for each row execute function public.set_updated_at();

alter table public.section_variants enable row level security;
alter table public.template_sections enable row level security;
alter table public.template_theme_presets enable row level security;

-- Authenticated users may read active coded section metadata needed for previews.
drop policy if exists "Authenticated users can read active section variants" on public.section_variants;
create policy "Authenticated users can read active section variants"
on public.section_variants for select
using ((auth.uid() is not null and is_active = true) or public.is_platform_admin());

-- Only platform admins may create, update, or deactivate section variant metadata.
drop policy if exists "Platform admins can manage section variants" on public.section_variants;
create policy "Platform admins can manage section variants"
on public.section_variants for all
using (public.is_platform_admin())
with check (public.is_platform_admin());

-- Authenticated users may read active template sections for active templates and active variants.
drop policy if exists "Authenticated users can read active template sections" on public.template_sections;
create policy "Authenticated users can read active template sections"
on public.template_sections for select
using (
  public.is_platform_admin()
  or (
    auth.uid() is not null
    and is_active = true
    and exists (
      select 1
      from public.templates
      join public.section_variants on section_variants.id = template_sections.section_variant_id
      where templates.id = template_sections.template_id
        and templates.is_active = true
        and section_variants.is_active = true
    )
  )
);

-- Only platform admins may create, update, reorder, or deactivate template sections.
drop policy if exists "Platform admins can manage template sections" on public.template_sections;
create policy "Platform admins can manage template sections"
on public.template_sections for all
using (public.is_platform_admin())
with check (public.is_platform_admin());

-- Authenticated users may read theme presets for active templates used in previews.
drop policy if exists "Authenticated users can read template theme presets" on public.template_theme_presets;
create policy "Authenticated users can read template theme presets"
on public.template_theme_presets for select
using (
  public.is_platform_admin()
  or (
    auth.uid() is not null
    and exists (
      select 1
      from public.templates
      where templates.id = template_theme_presets.template_id
        and templates.is_active = true
    )
  )
);

-- Only platform admins may manage template theme presets.
drop policy if exists "Platform admins can manage template theme presets" on public.template_theme_presets;
create policy "Platform admins can manage template theme presets"
on public.template_theme_presets for all
using (public.is_platform_admin())
with check (public.is_platform_admin());

insert into public.section_variants (key, name, section_type, description, schema_version, is_active)
values
  ('header-topbar-standard', 'Header with Top Bar', 'header', 'Primary navigation with a compact contact top bar.', 1, true),
  ('header-clean', 'Clean Header', 'header', 'Simple brand and navigation header.', 1, true),
  ('hero-split-image', 'Split Image Hero', 'hero', 'Hero with copy, actions, proof points, and a stable image panel.', 1, true),
  ('hero-background-overlay', 'Background Overlay Hero', 'hero', 'Compact page hero over an image with readable overlay.', 1, true),
  ('hero-minimal-services', 'Minimal Services Hero', 'hero', 'Focused hero for service and contact pages.', 1, true),
  ('service-highlights-row', 'Service Highlights Row', 'services', 'A short row of high-priority services.', 1, true),
  ('about-image-left', 'About Image Left', 'about', 'About section with image on the left and text on the right.', 1, true),
  ('about-image-right', 'About Image Right', 'about', 'About section with text on the left and image on the right.', 1, true),
  ('services-card-grid', 'Services Card Grid', 'services', 'Responsive service cards with images and short descriptions.', 1, true),
  ('services-icon-grid', 'Services Icon Grid', 'services', 'Compact icon-led service grid.', 1, true),
  ('services-alternating-rows', 'Services Alternating Rows', 'services', 'Detailed service rows with alternating media.', 1, true),
  ('why-choose-us-grid', 'Why Choose Us Grid', 'about', 'Trust and process points in a balanced grid.', 1, true),
  ('project-gallery-grid', 'Project Gallery Grid', 'gallery', 'Responsive project gallery cards.', 1, true),
  ('testimonials-cards', 'Testimonials Cards', 'testimonials', 'Clearly marked sample testimonial cards.', 1, true),
  ('faq-accordion', 'FAQ Accordion', 'faq', 'Accessible frequently asked questions.', 1, true),
  ('contact-cta-banner', 'Contact CTA Banner', 'contact', 'High-contrast contact call-to-action.', 1, true),
  ('contact-map-form', 'Contact Map and Form', 'contact', 'Contact details and non-submitting enquiry form layout.', 1, true),
  ('footer-standard', 'Standard Footer', 'footer', 'Structured footer with navigation and contact details.', 1, true),
  ('floating-whatsapp', 'Floating WhatsApp Action', 'floating_action', 'Mobile-friendly floating WhatsApp contact action.', 1, true)
on conflict (key) do update
set name = excluded.name,
    section_type = excluded.section_type,
    description = excluded.description,
    schema_version = excluded.schema_version,
    is_active = excluded.is_active,
    updated_at = now();

with target_template as (
  select id from public.templates where slug = 'technical-services-modern'
),
page_seed(page_name, page_slug, display_order, is_default) as (
  values
    ('Home', 'home', 10, true),
    ('About', 'about', 20, false),
    ('Services', 'services', 30, false),
    ('Projects', 'projects', 40, false),
    ('Contact', 'contact', 50, false)
)
insert into public.template_pages (template_id, page_name, page_slug, display_order, is_default)
select target_template.id, page_seed.page_name, page_seed.page_slug, page_seed.display_order, page_seed.is_default
from target_template, page_seed
on conflict (template_id, page_slug) do update
set page_name = excluded.page_name,
    display_order = excluded.display_order,
    is_default = excluded.is_default;

with target_template as (
  select id from public.templates where slug = 'technical-services-modern'
)
insert into public.template_theme_presets (template_id, name, key, is_default, theme_tokens)
select
  target_template.id,
  'Modern Corporate',
  'modern-corporate',
  true,
  '{
    "colors": {
      "primary": "#0f766e",
      "primaryDark": "#134e4a",
      "secondary": "#d8c3a5",
      "background": "#ffffff",
      "surface": "#f7f5f0",
      "ink": "#111827",
      "muted": "#4b5563",
      "border": "#e5e1d8"
    },
    "fonts": {
      "heading": "Inter, Arial, sans-serif",
      "body": "Inter, Arial, sans-serif"
    },
    "radius": {
      "card": "8px",
      "button": "6px"
    },
    "shadow": "0 14px 34px rgba(17, 24, 39, 0.10)",
    "buttonStyle": "solid",
    "spacing": "comfortable"
  }'::jsonb
from target_template
on conflict (template_id, key) do update
set name = excluded.name,
    is_default = excluded.is_default,
    theme_tokens = excluded.theme_tokens,
    updated_at = now();

with target_template as (
  select id from public.templates where slug = 'technical-services-modern'
),
section_seed(page_slug, variant_key, display_order, is_required) as (
  values
    ('home', 'header-topbar-standard', 10, true),
    ('home', 'hero-split-image', 20, true),
    ('home', 'service-highlights-row', 30, true),
    ('home', 'about-image-left', 40, true),
    ('home', 'services-card-grid', 50, true),
    ('home', 'why-choose-us-grid', 60, false),
    ('home', 'project-gallery-grid', 70, false),
    ('home', 'testimonials-cards', 80, false),
    ('home', 'faq-accordion', 90, false),
    ('home', 'contact-cta-banner', 100, true),
    ('home', 'contact-map-form', 110, true),
    ('home', 'footer-standard', 120, true),
    ('home', 'floating-whatsapp', 130, false),
    ('about', 'header-topbar-standard', 10, true),
    ('about', 'hero-background-overlay', 20, true),
    ('about', 'about-image-right', 30, true),
    ('about', 'why-choose-us-grid', 40, false),
    ('about', 'testimonials-cards', 50, false),
    ('about', 'contact-cta-banner', 60, true),
    ('about', 'footer-standard', 70, true),
    ('about', 'floating-whatsapp', 80, false),
    ('services', 'header-topbar-standard', 10, true),
    ('services', 'hero-background-overlay', 20, true),
    ('services', 'services-alternating-rows', 30, true),
    ('services', 'why-choose-us-grid', 40, false),
    ('services', 'faq-accordion', 50, false),
    ('services', 'contact-cta-banner', 60, true),
    ('services', 'footer-standard', 70, true),
    ('services', 'floating-whatsapp', 80, false),
    ('projects', 'header-topbar-standard', 10, true),
    ('projects', 'hero-background-overlay', 20, true),
    ('projects', 'project-gallery-grid', 30, true),
    ('projects', 'testimonials-cards', 40, false),
    ('projects', 'contact-cta-banner', 50, true),
    ('projects', 'footer-standard', 60, true),
    ('projects', 'floating-whatsapp', 70, false),
    ('contact', 'header-topbar-standard', 10, true),
    ('contact', 'hero-minimal-services', 20, true),
    ('contact', 'contact-map-form', 30, true),
    ('contact', 'faq-accordion', 40, false),
    ('contact', 'footer-standard', 50, true),
    ('contact', 'floating-whatsapp', 60, false)
),
content as (
  select
    section_seed.*,
    section_variants.id as section_variant_id,
    case section_seed.variant_key
      when 'header-topbar-standard' then '{
        "companyName": "Horizon Technical Services",
        "tagline": "Reliable maintenance and technical support for homes and businesses",
        "phone": "+971 50 123 4567",
        "email": "hello@horizontechnical.example",
        "location": "Dubai, United Arab Emirates",
        "nav": [
          {"label": "Home", "href": "/"},
          {"label": "About", "href": "/about"},
          {"label": "Services", "href": "/services"},
          {"label": "Projects", "href": "/projects"},
          {"label": "Contact", "href": "/contact"}
        ],
        "primaryAction": {"label": "Request a quote", "href": "/contact"}
      }'::jsonb
      when 'hero-split-image' then '{
        "eyebrow": "Technical services in Dubai",
        "title": "Reliable maintenance and technical support for homes and businesses",
        "body": "Horizon Technical Services helps property owners and businesses keep essential systems running with clear communication, careful workmanship, and scheduled maintenance support.",
        "primaryAction": {"label": "Request a quote", "href": "/contact"},
        "secondaryAction": {"label": "View services", "href": "/services"},
        "image": {"src": "/templates/technical-services-modern/hero.svg", "alt": "Technician preparing tools for a maintenance visit"},
        "proofPoints": ["AC, electrical, plumbing, and repairs", "Preventive maintenance plans", "Clear site visits and follow-up"]
      }'::jsonb
      when 'hero-background-overlay' then '{
        "eyebrow": "Horizon Technical Services",
        "title": "Practical support for property maintenance",
        "body": "Explore our approach, services, and recent sample project types for technical-service businesses.",
        "image": {"src": "/templates/technical-services-modern/hero.svg", "alt": "Technical maintenance workspace"}
      }'::jsonb
      when 'hero-minimal-services' then '{
        "eyebrow": "Contact our team",
        "title": "Tell us what needs attention",
        "body": "Share the service you need, your location, and a suitable time. The team will respond with next steps.",
        "services": ["AC maintenance", "Electrical services", "Plumbing solutions"]
      }'::jsonb
      when 'service-highlights-row' then '{
        "items": [
          {"title": "AC Maintenance", "body": "Inspection, cleaning, and service support for residential and light commercial cooling systems."},
          {"title": "Electrical Services", "body": "Troubleshooting, small installations, and maintenance checks handled with care."},
          {"title": "Plumbing Solutions", "body": "Leak checks, repairs, fixture support, and scheduled maintenance visits."}
        ]
      }'::jsonb
      when 'about-image-left' then '{
        "eyebrow": "About Horizon",
        "title": "A measured approach to everyday technical work",
        "body": "The template is designed for companies that need to communicate trust, service coverage, and practical response times without overpromising.",
        "image": {"src": "/templates/technical-services-modern/about.svg", "alt": "Organised maintenance tools and service checklist"},
        "bullets": ["Structured site visits", "Clear service recommendations", "Support for homes and small businesses"]
      }'::jsonb
      when 'about-image-right' then '{
        "eyebrow": "How we work",
        "title": "Simple coordination from request to completion",
        "body": "Use this section to explain how your team receives requests, inspects the issue, confirms the work, and follows up after completion.",
        "image": {"src": "/templates/technical-services-modern/about.svg", "alt": "Maintenance planning notes and tools"},
        "bullets": ["Assess the requirement", "Confirm the service scope", "Complete and document the visit"]
      }'::jsonb
      when 'services-card-grid' then '{
        "eyebrow": "Core services",
        "title": "Maintenance services customers can understand quickly",
        "items": [
          {"title": "AC Maintenance", "body": "Routine servicing and practical cooling-system support.", "image": {"src": "/templates/technical-services-modern/services/ac-maintenance.svg", "alt": "Air conditioning maintenance tools"}},
          {"title": "Electrical Services", "body": "Electrical checks, minor works, and safe troubleshooting.", "image": {"src": "/templates/technical-services-modern/services/electrical.svg", "alt": "Electrical service equipment"}},
          {"title": "Plumbing Solutions", "body": "Leak checks, fixture support, and plumbing repairs.", "image": {"src": "/templates/technical-services-modern/services/plumbing.svg", "alt": "Plumbing maintenance tools"}},
          {"title": "Painting Services", "body": "Interior touch-ups and planned repainting support.", "image": {"src": "/templates/technical-services-modern/services/painting.svg", "alt": "Painting service tools"}},
          {"title": "Interior Repairs", "body": "Small repair jobs that help properties stay ready to use.", "image": {"src": "/templates/technical-services-modern/services/interior-repairs.svg", "alt": "Interior repair tools"}},
          {"title": "Preventive Maintenance", "body": "Scheduled checks to reduce surprise maintenance issues.", "image": {"src": "/templates/technical-services-modern/services/preventive-maintenance.svg", "alt": "Preventive maintenance checklist"}}
        ]
      }'::jsonb
      when 'services-alternating-rows' then '{
        "eyebrow": "Services",
        "title": "Technical support arranged around real property needs",
        "items": [
          {"title": "AC Maintenance", "body": "Scheduled inspection and service support for cooling systems before small issues become disruptive.", "image": {"src": "/templates/technical-services-modern/services/ac-maintenance.svg", "alt": "AC maintenance placeholder"}},
          {"title": "Electrical Services", "body": "Careful checks and practical electrical maintenance for homes, offices, and small commercial spaces.", "image": {"src": "/templates/technical-services-modern/services/electrical.svg", "alt": "Electrical services placeholder"}},
          {"title": "Plumbing Solutions", "body": "Straightforward support for leaks, fixtures, and water-flow issues.", "image": {"src": "/templates/technical-services-modern/services/plumbing.svg", "alt": "Plumbing solutions placeholder"}},
          {"title": "Preventive Maintenance", "body": "Planned visits, clear notes, and follow-up recommendations for ongoing care.", "image": {"src": "/templates/technical-services-modern/services/preventive-maintenance.svg", "alt": "Maintenance checklist placeholder"}}
        ]
      }'::jsonb
      when 'why-choose-us-grid' then '{
        "eyebrow": "Why customers choose this service style",
        "title": "Clear, practical, and organised",
        "items": [
          {"title": "Straightforward communication", "body": "Customers understand what is being checked and what happens next."},
          {"title": "Service-focused layout", "body": "The page structure highlights services, response paths, and contact options."},
          {"title": "Built for repeat visits", "body": "Maintenance plans and recurring service needs are easy to explain."},
          {"title": "Balanced proof points", "body": "The design supports credibility without relying on exaggerated claims."}
        ]
      }'::jsonb
      when 'project-gallery-grid' then '{
        "eyebrow": "Sample project types",
        "title": "Show the kind of work your team handles",
        "items": [
          {"title": "Apartment AC service", "body": "Routine cooling-system maintenance for a residential unit.", "image": {"src": "/templates/technical-services-modern/projects/project-01.svg", "alt": "Residential AC service sample"}},
          {"title": "Office electrical checks", "body": "Small electrical checks and maintenance in a working office.", "image": {"src": "/templates/technical-services-modern/projects/project-02.svg", "alt": "Office electrical maintenance sample"}},
          {"title": "Villa plumbing support", "body": "Fixture and leak-support visit for a family home.", "image": {"src": "/templates/technical-services-modern/projects/project-03.svg", "alt": "Villa plumbing support sample"}},
          {"title": "Preventive maintenance visit", "body": "Scheduled inspection and notes for ongoing property care.", "image": {"src": "/templates/technical-services-modern/projects/project-04.svg", "alt": "Preventive maintenance sample"}}
        ]
      }'::jsonb
      when 'testimonials-cards' then '{
        "eyebrow": "Sample testimonials",
        "title": "How customer feedback can be presented",
        "items": [
          {"quote": "Sample testimonial: The visit was arranged clearly and the team explained the next maintenance steps.", "name": "Residential client", "context": "Dubai"},
          {"quote": "Sample testimonial: The service request was handled neatly and the follow-up notes were useful.", "name": "Office manager", "context": "Business Bay"}
        ]
      }'::jsonb
      when 'faq-accordion' then '{
        "eyebrow": "Common questions",
        "title": "Helpful answers before customers enquire",
        "items": [
          {"question": "What areas can this template support?", "answer": "Use this section to list the communities or business districts your team serves."},
          {"question": "Can customers request multiple services?", "answer": "Yes. The contact section can ask customers to describe the services they need in one request."},
          {"question": "Is this suitable for maintenance contracts?", "answer": "Yes. The services and CTA sections can explain planned maintenance visits and recurring support."}
        ]
      }'::jsonb
      when 'contact-cta-banner' then '{
        "title": "Ready to plan a maintenance visit?",
        "body": "Share your service requirement and preferred timing. The team can respond with clear next steps.",
        "primaryAction": {"label": "Request a quote", "href": "/contact"},
        "secondaryAction": {"label": "View services", "href": "/services"}
      }'::jsonb
      when 'contact-map-form' then '{
        "eyebrow": "Contact",
        "title": "Request technical support",
        "body": "Use this sample form layout to collect service requests, contact details, and preferred visit timing.",
        "phone": "+971 50 123 4567",
        "email": "hello@horizontechnical.example",
        "location": "Dubai, United Arab Emirates",
        "formTitle": "Send an enquiry"
      }'::jsonb
      when 'footer-standard' then '{
        "companyName": "Horizon Technical Services",
        "summary": "Reliable maintenance and technical support for homes and businesses in Dubai.",
        "phone": "+971 50 123 4567",
        "email": "hello@horizontechnical.example",
        "links": [
          {"label": "About", "href": "/about"},
          {"label": "Services", "href": "/services"},
          {"label": "Projects", "href": "/projects"},
          {"label": "Contact", "href": "/contact"}
        ]
      }'::jsonb
      when 'floating-whatsapp' then '{
        "label": "Chat on WhatsApp",
        "href": "https://wa.me/971501234567"
      }'::jsonb
      else '{}'::jsonb
    end as default_content
  from section_seed
  join public.section_variants on section_variants.key = section_seed.variant_key
)
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
  target_template.id,
  content.section_variant_id,
  content.page_slug,
  content.variant_key,
  content.display_order,
  content.is_required,
  true,
  content.default_content,
  '{}'::jsonb
from target_template, content
on conflict (template_id, page_slug, section_key) do update
set section_variant_id = excluded.section_variant_id,
    display_order = excluded.display_order,
    is_required = excluded.is_required,
    is_active = excluded.is_active,
    default_content = excluded.default_content,
    default_settings = excluded.default_settings,
    updated_at = now();

