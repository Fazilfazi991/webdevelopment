-- Allow stable template media slots while preserving existing broad usage types.
-- This is required so uploaded Technical Services images can map to a specific
-- service card or gallery item instead of relying on loose broad categories.

alter table public.site_media
drop constraint if exists site_media_usage_type_check;

alter table public.site_media
add constraint site_media_usage_type_check
check (
  usage_type in (
    'logo',
    'hero',
    'about',
    'service',
    'service:ac-maintenance',
    'service:electrical',
    'service:plumbing',
    'service:painting',
    'service:interior-repairs',
    'service:preventive-maintenance',
    'gallery',
    'gallery:project-01',
    'gallery:project-02',
    'gallery:project-03',
    'gallery:project-04',
    'favicon',
    'general'
  )
);
