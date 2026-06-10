-- Phase 2 template discovery for the dedicated Website Builder project only.
-- Target: https://caaacypgmlbkmmgobsdc.supabase.co
-- Do not apply this file to Plumlet or any other product database.

alter table public.sites
add column if not exists setup_step text not null default 'website_type'
check (setup_step in ('website_type', 'industry', 'business_category', 'template', 'template_selected'));

alter table public.sites
add column if not exists setup_completed_at timestamptz;

create table if not exists public.industries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon_name text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_categories (
  id uuid primary key default gen_random_uuid(),
  industry_id uuid not null references public.industries(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  icon_name text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (industry_id, slug)
);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  long_description text,
  style_label text,
  thumbnail_url text,
  desktop_preview_url text,
  mobile_preview_url text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.template_categories (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates(id) on delete cascade,
  business_category_id uuid not null references public.business_categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (template_id, business_category_id)
);

create table if not exists public.template_pages (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates(id) on delete cascade,
  page_name text not null,
  page_slug text not null,
  display_order integer not null default 0,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (template_id, page_slug)
);

create table if not exists public.site_template_selections (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null unique references public.sites(id) on delete cascade,
  industry_id uuid not null references public.industries(id) on delete restrict,
  business_category_id uuid references public.business_categories(id) on delete restrict,
  template_id uuid references public.templates(id) on delete restrict,
  selected_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_categories_industry_id_idx on public.business_categories(industry_id);
create index if not exists template_categories_template_id_idx on public.template_categories(template_id);
create index if not exists template_categories_category_id_idx on public.template_categories(business_category_id);
create index if not exists template_pages_template_id_idx on public.template_pages(template_id);
create index if not exists site_template_selections_site_id_idx on public.site_template_selections(site_id);

drop trigger if exists set_industries_updated_at on public.industries;
create trigger set_industries_updated_at
before update on public.industries
for each row execute function public.set_updated_at();

drop trigger if exists set_business_categories_updated_at on public.business_categories;
create trigger set_business_categories_updated_at
before update on public.business_categories
for each row execute function public.set_updated_at();

drop trigger if exists set_templates_updated_at on public.templates;
create trigger set_templates_updated_at
before update on public.templates
for each row execute function public.set_updated_at();

drop trigger if exists set_site_template_selections_updated_at on public.site_template_selections;
create trigger set_site_template_selections_updated_at
before update on public.site_template_selections
for each row execute function public.set_updated_at();

alter table public.industries enable row level security;
alter table public.business_categories enable row level security;
alter table public.templates enable row level security;
alter table public.template_categories enable row level security;
alter table public.template_pages enable row level security;
alter table public.site_template_selections enable row level security;

-- Authenticated users may read active reference data. Platform admins may read all records.
drop policy if exists "Authenticated users can read industries" on public.industries;
create policy "Authenticated users can read industries"
on public.industries for select
using ((auth.uid() is not null and is_active = true) or public.is_platform_admin());

drop policy if exists "Platform admins can manage industries" on public.industries;
create policy "Platform admins can manage industries"
on public.industries for all
using (public.is_platform_admin())
with check (public.is_platform_admin());

drop policy if exists "Authenticated users can read categories" on public.business_categories;
create policy "Authenticated users can read categories"
on public.business_categories for select
using ((auth.uid() is not null and is_active = true) or public.is_platform_admin());

drop policy if exists "Platform admins can manage categories" on public.business_categories;
create policy "Platform admins can manage categories"
on public.business_categories for all
using (public.is_platform_admin())
with check (public.is_platform_admin());

drop policy if exists "Authenticated users can read templates" on public.templates;
create policy "Authenticated users can read templates"
on public.templates for select
using ((auth.uid() is not null and is_active = true) or public.is_platform_admin());

drop policy if exists "Platform admins can manage templates" on public.templates;
create policy "Platform admins can manage templates"
on public.templates for all
using (public.is_platform_admin())
with check (public.is_platform_admin());

drop policy if exists "Authenticated users can read template categories" on public.template_categories;
create policy "Authenticated users can read template categories"
on public.template_categories for select
using (auth.uid() is not null or public.is_platform_admin());

drop policy if exists "Platform admins can manage template categories" on public.template_categories;
create policy "Platform admins can manage template categories"
on public.template_categories for all
using (public.is_platform_admin())
with check (public.is_platform_admin());

drop policy if exists "Authenticated users can read template pages" on public.template_pages;
create policy "Authenticated users can read template pages"
on public.template_pages for select
using (auth.uid() is not null or public.is_platform_admin());

drop policy if exists "Platform admins can manage template pages" on public.template_pages;
create policy "Platform admins can manage template pages"
on public.template_pages for all
using (public.is_platform_admin())
with check (public.is_platform_admin());

-- Organisation members may view template selections for their own sites.
drop policy if exists "Members can view site template selections" on public.site_template_selections;
create policy "Members can view site template selections"
on public.site_template_selections for select
using (
  public.is_platform_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = site_template_selections.site_id
      and public.is_org_member(sites.organization_id)
  )
);

-- Owners, organisation admins, and editors may create a selection for their own sites.
drop policy if exists "Editors can create site template selections" on public.site_template_selections;
create policy "Editors can create site template selections"
on public.site_template_selections for insert
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
      and sites.organization_id is not null
      and industries.is_active = true
      and (business_categories.id is null or (business_categories.industry_id = site_template_selections.industry_id and business_categories.is_active = true))
      and (templates.id is null or (templates.is_active = true and template_categories.id is not null))
      and public.has_org_role(sites.organization_id, array['owner', 'admin', 'editor'])
  )
);

-- Owners, organisation admins, and editors may change the selection. Viewers cannot.
drop policy if exists "Editors can update site template selections" on public.site_template_selections;
create policy "Editors can update site template selections"
on public.site_template_selections for update
using (
  public.is_platform_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = site_template_selections.site_id
      and public.has_org_role(sites.organization_id, array['owner', 'admin', 'editor'])
  )
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
        and public.has_org_role(sites.organization_id, array['owner', 'admin', 'editor'])
    )
  )
);

drop policy if exists "Editors can delete site template selections" on public.site_template_selections;
create policy "Editors can delete site template selections"
on public.site_template_selections for delete
using (
  public.is_platform_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = site_template_selections.site_id
      and public.has_org_role(sites.organization_id, array['owner', 'admin', 'editor'])
  )
);

-- Seed active and inactive industries.
insert into public.industries (name, slug, description, icon_name, display_order, is_active)
values
  ('Construction & Technical Services', 'construction-technical-services', 'Building, maintenance, fit-out, and trade-service businesses.', 'hard-hat', 10, true),
  ('Restaurants & Cafes', 'restaurants-cafes', 'Food, beverage, hospitality, bakery, and catering businesses.', 'utensils', 20, true),
  ('Business & Professional Services', 'business-professional-services', 'Consultancies, agencies, legal, accounting, and B2B service firms.', 'briefcase-business', 30, true),
  ('Real Estate', 'real-estate', 'Property sales, rentals, brokerage, and advisory services.', 'building-2', 100, false),
  ('Automotive', 'automotive', 'Garages, detailing, parts, rentals, and automotive services.', 'car', 110, false),
  ('Health & Beauty', 'health-beauty', 'Clinics, salons, spas, wellness, and personal-care businesses.', 'sparkles', 120, false),
  ('Tourism', 'tourism', 'Travel, tours, activities, and destination services.', 'map', 130, false),
  ('Home Services', 'home-services', 'Residential repair, care, cleaning, and maintenance services.', 'home', 140, false)
on conflict (slug) do update
set description = excluded.description,
    icon_name = excluded.icon_name,
    display_order = excluded.display_order,
    is_active = excluded.is_active,
    updated_at = now();

with industry_seed as (
  select id, slug from public.industries
),
category_seed(industry_slug, name, slug, description, icon_name, display_order) as (
  values
    ('construction-technical-services', 'General Construction', 'general-construction', 'Commercial and residential construction companies.', 'hard-hat', 10),
    ('construction-technical-services', 'Technical Services', 'technical-services', 'Maintenance and technical support providers.', 'wrench', 20),
    ('construction-technical-services', 'AC Maintenance', 'ac-maintenance', 'Air-conditioning service and maintenance firms.', 'fan', 30),
    ('construction-technical-services', 'MEP Services', 'mep-services', 'Mechanical, electrical, and plumbing service companies.', 'settings', 40),
    ('construction-technical-services', 'Electrical & Plumbing', 'electrical-plumbing', 'Electrical and plumbing specialists.', 'plug', 50),
    ('construction-technical-services', 'Interior Fit-Out', 'interior-fit-out', 'Interior contracting and fit-out teams.', 'paintbrush', 60),
    ('construction-technical-services', 'Cleaning Services', 'cleaning-services', 'Commercial and residential cleaning companies.', 'sparkles', 70),
    ('construction-technical-services', 'Renovation Services', 'renovation-services', 'Renovation, repair, and improvement businesses.', 'hammer', 80),
    ('construction-technical-services', 'Landscaping', 'landscaping', 'Landscape design and maintenance companies.', 'leaf', 90),
    ('restaurants-cafes', 'Restaurant', 'restaurant', 'Full-service restaurant businesses.', 'utensils', 10),
    ('restaurants-cafes', 'Cafe', 'cafe', 'Coffee shops and casual cafe brands.', 'coffee', 20),
    ('restaurants-cafes', 'Cloud Kitchen', 'cloud-kitchen', 'Delivery-first food businesses.', 'chef-hat', 30),
    ('restaurants-cafes', 'Catering Service', 'catering-service', 'Catering and events food providers.', 'cloche', 40),
    ('restaurants-cafes', 'Bakery', 'bakery', 'Bakery and baked-goods shops.', 'wheat', 50),
    ('restaurants-cafes', 'Dessert Shop', 'dessert-shop', 'Dessert, pastry, sweets, and ice-cream shops.', 'cake', 60),
    ('restaurants-cafes', 'Fast Food', 'fast-food', 'Quick-service restaurants and snack concepts.', 'sandwich', 70),
    ('restaurants-cafes', 'Fine Dining', 'fine-dining', 'Premium dining and hospitality experiences.', 'wine', 80),
    ('business-professional-services', 'Business Setup', 'business-setup', 'Company formation and setup consultants.', 'briefcase-business', 10),
    ('business-professional-services', 'Management Consultancy', 'management-consultancy', 'Consulting, strategy, and advisory firms.', 'chart-line', 20),
    ('business-professional-services', 'Accounting & Bookkeeping', 'accounting-bookkeeping', 'Accounting, tax, and bookkeeping firms.', 'calculator', 30),
    ('business-professional-services', 'Recruitment', 'recruitment', 'Staffing and recruitment companies.', 'users', 40),
    ('business-professional-services', 'Legal Services', 'legal-services', 'Legal advisors and law offices.', 'scale', 50),
    ('business-professional-services', 'Marketing Agency', 'marketing-agency', 'Digital, creative, and media agencies.', 'megaphone', 60),
    ('business-professional-services', 'IT Services', 'it-services', 'Technology support and IT service providers.', 'monitor', 70),
    ('business-professional-services', 'Logistics Company', 'logistics-company', 'Logistics, freight, and delivery companies.', 'truck', 80)
)
insert into public.business_categories (industry_id, name, slug, description, icon_name, display_order, is_active)
select industry_seed.id, category_seed.name, category_seed.slug, category_seed.description, category_seed.icon_name, category_seed.display_order, true
from category_seed
join industry_seed on industry_seed.slug = category_seed.industry_slug
on conflict (industry_id, slug) do update
set name = excluded.name,
    description = excluded.description,
    icon_name = excluded.icon_name,
    display_order = excluded.display_order,
    is_active = excluded.is_active,
    updated_at = now();

insert into public.templates (name, slug, short_description, long_description, style_label, is_featured, is_active, display_order)
values
  ('Technical Services Modern', 'technical-services-modern', 'A clear, service-led design for maintenance and technical teams.', 'Preview concept for technical-service companies that need trust, service coverage, and enquiry clarity.', 'Modern Service', true, true, 10),
  ('Industrial Corporate', 'industrial-corporate', 'A strong corporate layout for construction and industrial firms.', 'Preview concept for companies that want a confident industrial presence with project and capability sections.', 'Corporate', false, true, 20),
  ('Clean Service Pro', 'clean-service-pro', 'A tidy operational design for cleaning and maintenance providers.', 'Preview concept focused on repeat service bookings, proof points, and fast contact actions.', 'Clean Minimal', false, true, 30),
  ('Restaurant Modern', 'restaurant-modern', 'A polished restaurant concept for menus, location, and enquiries.', 'Preview concept for restaurants that need a tasteful brand presence and customer actions.', 'Modern Hospitality', true, true, 40),
  ('Cafe Minimal', 'cafe-minimal', 'A warm, simple layout for cafes and casual food brands.', 'Preview concept for cafes, bakeries, and dessert shops with menu and visit-focused content.', 'Minimal Warm', false, true, 50),
  ('Hospitality Elegant', 'hospitality-elegant', 'A refined design for dining and hospitality businesses.', 'Preview concept for premium dining and catering businesses that need an elegant first impression.', 'Elegant', false, true, 60),
  ('Consultancy Professional', 'consultancy-professional', 'A trust-first template for consultants and advisory firms.', 'Preview concept for consultancies that need positioning, services, and lead capture.', 'Professional', true, true, 70),
  ('Corporate Minimal', 'corporate-minimal', 'A restrained corporate design for B2B service companies.', 'Preview concept for agencies, IT providers, and professional firms.', 'Minimal Corporate', false, true, 80),
  ('Business Growth', 'business-growth', 'A confident growth-focused layout for service firms.', 'Preview concept for companies that want to communicate outcomes, process, and credibility.', 'Growth', false, true, 90)
on conflict (slug) do update
set short_description = excluded.short_description,
    long_description = excluded.long_description,
    style_label = excluded.style_label,
    is_featured = excluded.is_featured,
    is_active = excluded.is_active,
    display_order = excluded.display_order,
    updated_at = now();

with page_seed(template_slug, page_name, page_slug, display_order, is_default) as (
  values
    ('technical-services-modern', 'Home', 'home', 10, true), ('technical-services-modern', 'Services', 'services', 20, false), ('technical-services-modern', 'Projects', 'projects', 30, false), ('technical-services-modern', 'Contact', 'contact', 40, false),
    ('industrial-corporate', 'Home', 'home', 10, true), ('industrial-corporate', 'Capabilities', 'capabilities', 20, false), ('industrial-corporate', 'Projects', 'projects', 30, false), ('industrial-corporate', 'Contact', 'contact', 40, false),
    ('clean-service-pro', 'Home', 'home', 10, true), ('clean-service-pro', 'Services', 'services', 20, false), ('clean-service-pro', 'Service Areas', 'service-areas', 30, false), ('clean-service-pro', 'Contact', 'contact', 40, false),
    ('restaurant-modern', 'Home', 'home', 10, true), ('restaurant-modern', 'Menu', 'menu', 20, false), ('restaurant-modern', 'Gallery', 'gallery', 30, false), ('restaurant-modern', 'Contact', 'contact', 40, false),
    ('cafe-minimal', 'Home', 'home', 10, true), ('cafe-minimal', 'Menu', 'menu', 20, false), ('cafe-minimal', 'Visit Us', 'visit-us', 30, false), ('cafe-minimal', 'Contact', 'contact', 40, false),
    ('hospitality-elegant', 'Home', 'home', 10, true), ('hospitality-elegant', 'Menu', 'menu', 20, false), ('hospitality-elegant', 'Events', 'events', 30, false), ('hospitality-elegant', 'Contact', 'contact', 40, false),
    ('consultancy-professional', 'Home', 'home', 10, true), ('consultancy-professional', 'Services', 'services', 20, false), ('consultancy-professional', 'About', 'about', 30, false), ('consultancy-professional', 'Contact', 'contact', 40, false),
    ('corporate-minimal', 'Home', 'home', 10, true), ('corporate-minimal', 'Solutions', 'solutions', 20, false), ('corporate-minimal', 'Case Studies', 'case-studies', 30, false), ('corporate-minimal', 'Contact', 'contact', 40, false),
    ('business-growth', 'Home', 'home', 10, true), ('business-growth', 'Services', 'services', 20, false), ('business-growth', 'Process', 'process', 30, false), ('business-growth', 'Contact', 'contact', 40, false)
)
insert into public.template_pages (template_id, page_name, page_slug, display_order, is_default)
select templates.id, page_seed.page_name, page_seed.page_slug, page_seed.display_order, page_seed.is_default
from page_seed
join public.templates on templates.slug = page_seed.template_slug
on conflict (template_id, page_slug) do update
set page_name = excluded.page_name,
    display_order = excluded.display_order,
    is_default = excluded.is_default;

with mapping_seed(template_slug, category_slug) as (
  values
    ('technical-services-modern', 'technical-services'), ('technical-services-modern', 'ac-maintenance'), ('technical-services-modern', 'mep-services'), ('technical-services-modern', 'electrical-plumbing'),
    ('industrial-corporate', 'general-construction'), ('industrial-corporate', 'mep-services'), ('industrial-corporate', 'interior-fit-out'), ('industrial-corporate', 'renovation-services'),
    ('clean-service-pro', 'cleaning-services'), ('clean-service-pro', 'renovation-services'), ('clean-service-pro', 'landscaping'), ('clean-service-pro', 'technical-services'),
    ('restaurant-modern', 'restaurant'), ('restaurant-modern', 'fast-food'), ('restaurant-modern', 'fine-dining'),
    ('cafe-minimal', 'cafe'), ('cafe-minimal', 'bakery'), ('cafe-minimal', 'dessert-shop'), ('cafe-minimal', 'cloud-kitchen'),
    ('hospitality-elegant', 'fine-dining'), ('hospitality-elegant', 'catering-service'), ('hospitality-elegant', 'restaurant'),
    ('consultancy-professional', 'management-consultancy'), ('consultancy-professional', 'business-setup'), ('consultancy-professional', 'legal-services'), ('consultancy-professional', 'accounting-bookkeeping'),
    ('corporate-minimal', 'it-services'), ('corporate-minimal', 'logistics-company'), ('corporate-minimal', 'marketing-agency'), ('corporate-minimal', 'recruitment'),
    ('business-growth', 'marketing-agency'), ('business-growth', 'business-setup'), ('business-growth', 'management-consultancy'), ('business-growth', 'it-services')
)
insert into public.template_categories (template_id, business_category_id)
select templates.id, business_categories.id
from mapping_seed
join public.templates on templates.slug = mapping_seed.template_slug
join public.business_categories on business_categories.slug = mapping_seed.category_slug
on conflict (template_id, business_category_id) do nothing;
