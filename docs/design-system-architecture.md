# Studio OS Design System Architecture

## Existing architecture reused

- `section_variants`, `template_sections`, and `template_theme_presets` remain the renderer source.
- `site_section_overrides` and `site_theme_overrides` remain content and token overrides.
- `site_media` retains exact media-slot mapping and signed URL refresh.
- `site_versions` and `sites.last_published_version_id` keep public snapshots immutable until publish.
- `site_template_selections` remains the active draft template pointer.
- Canonical profile, services, projects, testimonials, FAQ, contact, SEO, pages, leads, domains, and media records are not copied into recipes.

## Additive model

Migration `018_design_system_recipes.sql` adds families, presets, recipes, recipe sections, category mappings, compatibility rules, and draft design selections. Existing tables are referenced rather than replaced.

The typed catalog in `lib/design-system/catalog.ts` permits routes and tests to work from an approved, version-controlled source while the same records are deployed to Supabase. No remote SQL is run automatically.

## Switching contract

Applying a recipe updates only the site's draft template selection and `site_design_selections`. It does not delete or overwrite customer content, media, SEO, domains, leads, blog data, or published snapshots. Unsupported section data remains stored. Publishing continues to create a new immutable `site_versions` snapshot.

## Backfill

Existing Technical Services sites are mapped to Service Modern by the migration when their current template slug is `technical-services-modern`. No content backfill is required.
