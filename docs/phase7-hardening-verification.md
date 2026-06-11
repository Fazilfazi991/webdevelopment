# Phase 7 Hardening Verification

Date: 2026-06-11

## Live schema

Checked the dedicated Supabase project with the configured anon key. These tables are addressable:

- `ai_site_profiles`
- `ai_generation_requests`
- `ai_content_suggestions`
- `ai_usage_limits`
- `ai_prompt_versions`

The migration contains RLS enablement for all five tables and tenant-scoped policies through existing `can_read_site`, `has_site_permission`, `is_agency_member`, and `is_platform_admin` helpers.

## Hardening fixes

- Added an application allowlist before applying business profile suggestions.
- Added an application allowlist before applying SEO suggestions.
- Blocked direct application of review-only recommendation and image-checklist suggestions.
- Added Regenerate controls on suggestion cards.
- Added Make More Professional to editor AI actions.
- Added `012_phase7_ai_hardening.sql` to constrain safe suggestion field targets at the database layer.

## Manual checks still required

Use real authenticated sessions for self-service owner, agency owner, assigned developer, client editor, client viewer, and a second organisation owner. Confirm direct server-action denial, not just hidden or disabled buttons.

Run mock-provider workflow after applying `012_phase7_ai_hardening.sql`:

1. Save AI setup profile.
2. Generate website content suggestions.
3. Confirm generation request and suggestion rows are created.
4. Confirm live content remains unchanged before Apply.
5. Apply one business profile field.
6. Apply one section field.
7. Reject one suggestion.
8. Regenerate one suggestion.
9. Confirm preview changes only after Apply.

Failure-mode checks still require controlled environment changes:

- Missing provider configuration.
- Malformed provider output.
- Timeout and retry exhaustion.
- Usage limit reached.
- Invalid output length.
