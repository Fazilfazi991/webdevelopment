-- Template Production Sprint: Technical Services Modern hardening.
-- Target: dedicated Website Builder Supabase project only.
-- Do not apply this file to Plumlet or any other product database.

update public.templates
set
  short_description = 'A clean, practical website for maintenance and technical-service companies.',
  long_description = 'A production-ready technical-services template with clear service paths, project proof, WhatsApp contact, quote requests, and five complete pages for home, about, services, projects, and contact.',
  thumbnail_url = '/templates/technical-services-modern/thumbnail.webp',
  desktop_preview_url = '/templates/technical-services-modern/preview-desktop.webp',
  mobile_preview_url = '/templates/technical-services-modern/preview-mobile.webp',
  style_label = 'Modern Corporate',
  is_featured = true,
  is_active = true,
  updated_at = now()
where slug = 'technical-services-modern';

update public.template_theme_presets
set
  name = 'Technical Services Modern v1',
  key = 'technical-services-modern-v1',
  theme_tokens = '{
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
  }'::jsonb,
  updated_at = now()
where template_id = (select id from public.templates where slug = 'technical-services-modern')
  and is_default = true;

update public.template_sections
set default_content = replace(default_content::text, '.svg', '.webp')::jsonb,
    updated_at = now()
where template_id = (select id from public.templates where slug = 'technical-services-modern');
