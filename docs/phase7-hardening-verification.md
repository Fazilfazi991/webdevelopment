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

Final live schema check on 2026-06-11:

| Check | Result | Notes |
| --- | --- | --- |
| `ai_site_profiles` addressable | Passed | PostgREST returned status 200 for selected Phase 7 columns. |
| `ai_generation_requests` addressable | Passed | PostgREST returned status 200 for selected Phase 7 columns. |
| `ai_content_suggestions` addressable | Passed | PostgREST returned status 200 for selected Phase 7 columns. |
| `ai_usage_limits` addressable | Passed | PostgREST returned status 200 for selected Phase 7 columns. |
| `ai_prompt_versions` addressable | Passed | PostgREST returned status 200 for selected Phase 7 columns. |
| Public visitor insert into `ai_content_suggestions` | Passed | Anonymous unsafe insert was blocked by RLS with Postgres code `42501`. |
| `012_phase7_ai_hardening.sql` reflected live | Manual confirmation required | The user stated the patch was manually applied. This workspace only has anon Supabase credentials, so it cannot directly inspect `pg_constraint` or perform an authenticated unsafe insert to prove the new check constraint. No schema-cache error was observed for Phase 7 tables. If the Supabase API appears stale during manual testing, run `notify pgrst, 'reload schema';` in the dedicated SQL Editor. |

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

## Final acceptance attempt - 2026-06-11

The final brief requires real authenticated browser sessions for Self-Service Owner, Agency A Owner, Agency A Developer, Client A Owner, Client A Viewer, and Agency B Owner. Credentials for these accounts are not available in this workspace, and secrets must not be committed. Therefore the following remain **pending manual session**:

- Mock AI setup flow: questionnaire, generation, profile apply, SEO apply, reject, regenerate, preview.
- Editor AI actions: Improve Writing, Make It Shorter, Make More Professional, Fix Grammar, Translate, Regenerate.
- SEO assistant field approval and manual editing.
- Translation checks for English, Arabic, Hindi, and Malayalam.
- Section recommendation checks with approved variants only.
- Image checklist checks against selected template and enabled sections.
- Client viewer direct server-action denial.
- Assigned developer access on assigned and unassigned sites.
- Agency B cross-agency and cross-tenant AI isolation.
- Provider-missing, malformed-output, timeout, retry-exhaustion, and usage-limit failure-mode checks.
- Unsafe-field application and review-only application denial using authenticated crafted requests.

What was verified from this workspace:

- Live Phase 7 AI tables are addressable.
- Anonymous public insertion into AI suggestions is blocked by RLS.
- Phase 7 hardening code whitelists business profile and SEO apply targets.
- Review-only section recommendation and image checklist suggestions are blocked from direct application in application code.
- Regenerate and Make More Professional controls are present in code.
- Typecheck, lint, build, and smoke route checks passed after Phase 7 hardening.

Release status: **not approved for Phase 8** until the real-session tests above are completed and recorded with actual results.
