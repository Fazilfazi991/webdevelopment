-- Studio OS modular design system: Service Business family only.
-- Additive migration. Review and apply manually to the dedicated Website Builder project.

create table if not exists public.design_families (
  id text primary key,
  name text not null,
  description text,
  status text not null default 'draft' check (status in ('draft','internal_review','mobile_qa','desktop_qa','approved','published','archived')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.style_presets (
  id text primary key,
  name text not null,
  description text,
  theme_tokens jsonb not null,
  status text not null default 'draft' check (status in ('draft','internal_review','mobile_qa','desktop_qa','approved','published','archived')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.design_recipes (
  id text primary key,
  name text not null,
  slug text not null unique,
  family_id text not null references public.design_families(id) on delete restrict,
  description text,
  style_preset_id text not null references public.style_presets(id) on delete restrict,
  template_id uuid references public.templates(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','internal_review','mobile_qa','desktop_qa','approved','published','archived')),
  is_featured boolean not null default false,
  preview_asset text,
  mobile_preview_asset text,
  supported_languages text[] not null default array['en']::text[],
  supported_regions text[] not null default array['global']::text[],
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.design_recipe_sections (
  id uuid primary key default gen_random_uuid(),
  recipe_id text not null references public.design_recipes(id) on delete cascade,
  section_type text not null,
  section_variant_id uuid not null references public.section_variants(id) on delete restrict,
  display_order integer not null default 0,
  required boolean not null default false,
  enabled_by_default boolean not null default true,
  fallback_variant_id uuid references public.section_variants(id) on delete set null,
  unique (recipe_id, section_type)
);

create table if not exists public.design_category_mappings (
  id uuid primary key default gen_random_uuid(),
  business_category_id uuid not null references public.business_categories(id) on delete cascade,
  recipe_id text not null references public.design_recipes(id) on delete cascade,
  priority integer not null default 100,
  is_default boolean not null default false,
  unique (business_category_id, recipe_id)
);

create table if not exists public.variant_compatibility_rules (
  id uuid primary key default gen_random_uuid(),
  section_variant_id uuid not null unique references public.section_variants(id) on delete cascade,
  required_slots text[] not null default '{}', optional_slots text[] not null default '{}',
  minimum_item_count integer not null default 0, maximum_item_count integer not null default 12,
  minimum_image_count integer not null default 0,
  supported_families text[] not null default array['service-business']::text[],
  supported_style_presets text[] not null default '{}',
  fallback_variant_id uuid references public.section_variants(id) on delete set null,
  mobile_ready boolean not null default false, desktop_ready boolean not null default false
);

create table if not exists public.site_design_selections (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null unique references public.sites(id) on delete cascade,
  design_recipe_id text not null references public.design_recipes(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft','review','published')),
  selected_by uuid not null references auth.users(id) on delete restrict,
  review_recommended boolean not null default false,
  notice text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.site_section_design_overrides (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  section_type text not null,
  section_variant_id uuid references public.section_variants(id) on delete set null,
  is_enabled boolean not null default true,
  notice text,
  unique (site_id, section_type)
);

insert into public.design_families (id,name,description,status) values
('service-business','Service Businesses','Approved websites for local and technical service operators.','published')
on conflict (id) do update set name=excluded.name, description=excluded.description, status=excluded.status, updated_at=now();

insert into public.style_presets (id,name,description,status,theme_tokens) values
('modern-professional','Modern Professional','Balanced, polished and trust-led.','published','{"colors":{"primary":"#0f766e","primaryDark":"#134e4a","secondary":"#d8c3a5","background":"#ffffff","surface":"#f5f7f6","ink":"#10231f","muted":"#52635f","border":"#dce5e2"},"fonts":{"heading":"Inter, Arial, sans-serif","body":"Inter, Arial, sans-serif"},"radius":{"card":"14px","button":"8px"},"shadow":"0 16px 40px rgba(15,76,67,.10)","buttonStyle":"solid","spacing":"comfortable"}'::jsonb),
('clean-minimal','Clean Minimal','Quiet, light and text-first.','published','{"colors":{"primary":"#334155","primaryDark":"#0f172a","secondary":"#e2e8f0","background":"#ffffff","surface":"#f8fafc","ink":"#0f172a","muted":"#64748b","border":"#e2e8f0"},"fonts":{"heading":"Inter, Arial, sans-serif","body":"Inter, Arial, sans-serif"},"radius":{"card":"8px","button":"6px"},"shadow":"0 8px 24px rgba(15,23,42,.06)","buttonStyle":"outline","spacing":"compact"}'::jsonb),
('industrial-bold','Industrial Bold','High contrast, direct and project-led.','published','{"colors":{"primary":"#f97316","primaryDark":"#111827","secondary":"#fbbf24","background":"#ffffff","surface":"#f3f4f6","ink":"#111827","muted":"#4b5563","border":"#d1d5db"},"fonts":{"heading":"Arial, sans-serif","body":"Arial, sans-serif"},"radius":{"card":"2px","button":"2px"},"shadow":"0 18px 0 rgba(17,24,39,.10)","buttonStyle":"square","spacing":"generous"}'::jsonb),
('warm-local-business','Warm Local Business','Friendly and community-minded.','approved','{"colors":{"primary":"#b45309","primaryDark":"#78350f","secondary":"#fde68a","background":"#fffbeb","surface":"#fff7ed","ink":"#422006","muted":"#78716c","border":"#fed7aa"},"fonts":{"heading":"Georgia, serif","body":"Arial, sans-serif"},"radius":{"card":"18px","button":"999px"},"shadow":"0 14px 32px rgba(120,53,15,.10)","buttonStyle":"pill","spacing":"comfortable"}'::jsonb),
('elegant-premium','Elegant Premium','Refined typography and restrained detail.','approved','{"colors":{"primary":"#4338ca","primaryDark":"#1e1b4b","secondary":"#c4b5fd","background":"#ffffff","surface":"#f5f3ff","ink":"#1e1b4b","muted":"#6b7280","border":"#ddd6fe"},"fonts":{"heading":"Georgia, serif","body":"Inter, Arial, sans-serif"},"radius":{"card":"12px","button":"8px"},"shadow":"0 22px 50px rgba(49,46,129,.12)","buttonStyle":"soft","spacing":"generous"}'::jsonb)
on conflict (id) do update set name=excluded.name, description=excluded.description, status=excluded.status, theme_tokens=excluded.theme_tokens, updated_at=now();

insert into public.templates (name,slug,short_description,long_description,style_label,thumbnail_url,desktop_preview_url,mobile_preview_url,is_featured,is_active,display_order) values
('Service Modern','service-modern','Clean professional service-business design.','Split hero, structured service cards, trust signals and balanced whitespace.','Modern Professional','/designs/service-modern/thumbnail.webp','/designs/service-modern/preview-desktop.webp','/designs/service-modern/preview-mobile.webp',true,true,20),
('Service Minimal','service-minimal','Simple light service-business design.','Text-first hero, compact services and strong mobile readability.','Clean Minimal','/designs/service-minimal/thumbnail.webp','/designs/service-minimal/preview-desktop.webp','/designs/service-minimal/preview-mobile.webp',true,true,21),
('Service Bold','service-bold','Bold industrial service-business design.','Full-width hero, alternating service rows and stronger project proof.','Industrial Bold','/designs/service-bold/thumbnail.webp','/designs/service-bold/preview-desktop.webp','/designs/service-bold/preview-mobile.webp',true,true,22)
on conflict (slug) do update set name=excluded.name, short_description=excluded.short_description, long_description=excluded.long_description, style_label=excluded.style_label, thumbnail_url=excluded.thumbnail_url, desktop_preview_url=excluded.desktop_preview_url, mobile_preview_url=excluded.mobile_preview_url, is_featured=true, is_active=true, updated_at=now();

insert into public.template_pages (template_id,page_name,page_slug,display_order,is_default)
select t.id, p.name, p.slug, p.ord, p.is_default from public.templates t cross join (values ('Home','home',0,true),('About','about',1,false),('Services','services',2,false),('Projects','projects',3,false),('Contact','contact',4,false)) p(name,slug,ord,is_default)
where t.slug in ('service-modern','service-minimal','service-bold') on conflict (template_id,page_slug) do nothing;

insert into public.template_theme_presets (template_id,name,key,is_default,theme_tokens)
select t.id, s.name, s.id, true, s.theme_tokens from public.templates t join public.style_presets s on s.id = case t.slug when 'service-modern' then 'modern-professional' when 'service-minimal' then 'clean-minimal' else 'industrial-bold' end
where t.slug in ('service-modern','service-minimal','service-bold') on conflict (template_id,key) do update set name=excluded.name,is_default=true,theme_tokens=excluded.theme_tokens,updated_at=now();

-- Clone canonical content from the existing Technical Services template. Content remains editable and independent.
insert into public.template_sections (template_id,section_variant_id,page_slug,section_key,display_order,is_required,is_active,default_content,default_settings)
select target.id, source.section_variant_id, source.page_slug, source.section_key, source.display_order, source.is_required, source.is_active, source.default_content, source.default_settings
from public.template_sections source join public.templates base on base.id=source.template_id and base.slug='technical-services-modern'
cross join public.templates target where target.slug in ('service-modern','service-minimal','service-bold')
on conflict (template_id,page_slug,section_key) do nothing;

-- Structural differences between the three approved recipes.
update public.template_sections ts set section_variant_id=sv.id from public.templates t, public.section_variants sv where ts.template_id=t.id and t.slug='service-minimal' and ((ts.section_key like 'hero%' and sv.key='hero-minimal-services') or (ts.section_key like 'services%' and sv.key='services-icon-grid') or (ts.section_key like 'header%' and sv.key='header-clean'));
update public.template_sections ts set section_variant_id=sv.id from public.templates t, public.section_variants sv where ts.template_id=t.id and t.slug='service-bold' and ((ts.section_key like 'hero%' and sv.key='hero-background-overlay') or (ts.section_key like 'services%' and sv.key='services-alternating-rows') or (ts.section_key like 'about%' and sv.key='about-image-right'));

insert into public.design_recipes (id,name,slug,family_id,description,style_preset_id,template_id,status,is_featured,preview_asset,mobile_preview_asset,supported_languages,supported_regions)
select t.slug,t.name,t.slug,'service-business',t.long_description,case t.slug when 'service-modern' then 'modern-professional' when 'service-minimal' then 'clean-minimal' else 'industrial-bold' end,t.id,'published',true,t.desktop_preview_url,t.mobile_preview_url,array['en','ar'],array['global','gcc']
from public.templates t where t.slug in ('service-modern','service-minimal','service-bold')
on conflict (id) do update set name=excluded.name,description=excluded.description,style_preset_id=excluded.style_preset_id,template_id=excluded.template_id,status='published',preview_asset=excluded.preview_asset,mobile_preview_asset=excluded.mobile_preview_asset,updated_at=now();

insert into public.design_recipe_sections (recipe_id,section_type,section_variant_id,display_order,required,enabled_by_default,fallback_variant_id)
select r.id, sv.section_type, sv.id, min(ts.display_order), sv.section_type in ('header','hero','services','contact','footer'), true, null
from public.design_recipes r join public.template_sections ts on ts.template_id=r.template_id join public.section_variants sv on sv.id=ts.section_variant_id
where r.family_id='service-business' group by r.id,sv.section_type,sv.id
on conflict (recipe_id,section_type) do update set section_variant_id=excluded.section_variant_id,display_order=excluded.display_order,required=excluded.required,enabled_by_default=true;

insert into public.variant_compatibility_rules (section_variant_id,required_slots,optional_slots,minimum_item_count,maximum_item_count,minimum_image_count,supported_families,supported_style_presets,fallback_variant_id,mobile_ready,desktop_ready)
select sv.id,
  case when sv.section_type='header' then array['companyName'] when sv.section_type='hero' then array['heading'] when sv.section_type='footer' then array['companyName'] else '{}'::text[] end,
  case when sv.section_type in ('hero','about') then array[sv.section_type] when sv.section_type in ('services','projects') then array['service','gallery'] else '{}'::text[] end,
  case when sv.section_type in ('services','projects','testimonials','faq') then 1 else 0 end, 12,
  case when sv.section_type='projects' then 1 else 0 end,
  array['service-business'],array['modern-professional','clean-minimal','industrial-bold','warm-local-business','elegant-premium'],null,true,true
from public.section_variants sv where sv.is_active=true
on conflict (section_variant_id) do update set required_slots=excluded.required_slots,optional_slots=excluded.optional_slots,minimum_item_count=excluded.minimum_item_count,maximum_item_count=excluded.maximum_item_count,minimum_image_count=excluded.minimum_image_count,supported_families=excluded.supported_families,supported_style_presets=excluded.supported_style_presets,mobile_ready=true,desktop_ready=true;

insert into public.template_categories (template_id,business_category_id)
select t.id,c.id from public.templates t cross join public.business_categories c where t.slug in ('service-modern','service-minimal','service-bold') and c.slug in ('technical-services','ac-maintenance','cleaning','plumbing','electrical','painting','laundry','car-care','pest-control','landscaping') on conflict do nothing;

insert into public.design_category_mappings (business_category_id,recipe_id,priority,is_default)
select c.id,r.id,case r.id when 'service-modern' then 10 when 'service-bold' then 20 else 30 end,r.id='service-modern'
from public.business_categories c cross join public.design_recipes r where c.slug in ('technical-services','ac-maintenance','cleaning','plumbing','electrical','painting','laundry','car-care','pest-control','landscaping') and r.family_id='service-business'
on conflict (business_category_id,recipe_id) do update set priority=excluded.priority,is_default=excluded.is_default;

-- Exact media slots remain valid, with the two approved metadata slots added.
alter table public.site_media drop constraint if exists site_media_usage_type_check;
alter table public.site_media add constraint site_media_usage_type_check check (usage_type in ('logo','hero','about','service','service:ac-maintenance','service:electrical','service:plumbing','service:painting','service:interior-repairs','service:preventive-maintenance','gallery','gallery:project-01','gallery:project-02','gallery:project-03','gallery:project-04','favicon','social-share','general'));

alter table public.design_families enable row level security; alter table public.style_presets enable row level security; alter table public.design_recipes enable row level security; alter table public.design_recipe_sections enable row level security; alter table public.design_category_mappings enable row level security; alter table public.variant_compatibility_rules enable row level security; alter table public.site_design_selections enable row level security; alter table public.site_section_design_overrides enable row level security;
create policy "Authenticated users read published design families" on public.design_families for select to authenticated using (status in ('approved','published') or exists(select 1 from public.platform_admins where user_id=auth.uid()));
create policy "Authenticated users read approved style presets" on public.style_presets for select to authenticated using (status in ('approved','published') or exists(select 1 from public.platform_admins where user_id=auth.uid()));
create policy "Authenticated users read published design recipes" on public.design_recipes for select to authenticated using (status in ('approved','published') or exists(select 1 from public.platform_admins where user_id=auth.uid()));
create policy "Authenticated users read recipe sections" on public.design_recipe_sections for select to authenticated using (exists(select 1 from public.design_recipes r where r.id=recipe_id and r.status in ('approved','published')) or exists(select 1 from public.platform_admins where user_id=auth.uid()));
create policy "Authenticated users read design mappings" on public.design_category_mappings for select to authenticated using (true);
create policy "Authenticated users read compatibility rules" on public.variant_compatibility_rules for select to authenticated using (true);
create policy "Site members read design selections" on public.site_design_selections for select to authenticated using (exists(select 1 from public.sites s left join public.organization_members om on om.organization_id=s.organization_id and om.user_id=auth.uid() left join public.site_access_members sam on sam.site_id=s.id and sam.user_id=auth.uid() where s.id=site_id and (om.user_id is not null or sam.user_id is not null)));
create policy "Site editors manage draft design selections" on public.site_design_selections for all to authenticated using (exists(select 1 from public.sites s left join public.organization_members om on om.organization_id=s.organization_id and om.user_id=auth.uid() left join public.site_access_members sam on sam.site_id=s.id and sam.user_id=auth.uid() where s.id=site_id and (om.role in ('owner','admin','editor') or coalesce((sam.permissions->>'edit_design')::boolean,false)))) with check (status='draft');
create policy "Site members read section design overrides" on public.site_section_design_overrides for select to authenticated using (exists(select 1 from public.sites s left join public.organization_members om on om.organization_id=s.organization_id and om.user_id=auth.uid() left join public.site_access_members sam on sam.site_id=s.id and sam.user_id=auth.uid() where s.id=site_id and (om.user_id is not null or sam.user_id is not null)));

-- Backfill selection metadata only; customer content and snapshots remain untouched.
insert into public.site_design_selections (site_id,design_recipe_id,status,selected_by)
select sts.site_id,'service-modern','draft',sts.selected_by from public.site_template_selections sts join public.templates t on t.id=sts.template_id where t.slug='technical-services-modern'
on conflict (site_id) do nothing;
