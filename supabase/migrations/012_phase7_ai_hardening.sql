-- Phase 7 hardening: constrain AI suggestion field targets at the database layer.
-- Run manually in the dedicated Supabase SQL Editor if this patch is needed there.

alter table public.ai_content_suggestions
drop constraint if exists ai_content_suggestions_safe_field_targets;

alter table public.ai_content_suggestions
add constraint ai_content_suggestions_safe_field_targets
check (
  (
    suggestion_type = 'business_profile'
    and field_key in ('company_name', 'tagline', 'short_description', 'full_description')
  )
  or (
    suggestion_type = 'seo'
    and field_key in ('seo_title', 'seo_description', 'seo_keywords', 'og_title', 'og_description')
  )
  or (
    suggestion_type in ('section_field', 'translation')
    and length(field_key) between 1 and 120
  )
  or (
    suggestion_type = 'section_recommendation'
    and field_key = 'recommended_sections'
  )
  or (
    suggestion_type = 'image_requirement'
    and field_key = 'image_checklist'
  )
);

-- This complements application-side apply allowlists so AI suggestions cannot be
-- used as a path to publish, change domains, change permissions, or transfer ownership.
