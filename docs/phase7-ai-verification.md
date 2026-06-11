# Phase 7 AI Verification

Use real authenticated sessions where permissions matter. Automated route checks do not replace multi-user acceptance.

## Functional checks

- AI onboarding: save business basics, positioning, tone, and language on `/dashboard/websites/[siteId]/ai-setup`.
- Mock generation: with `AI_PROVIDER=mock`, create website content suggestions and confirm they appear on `/dashboard/websites/[siteId]/ai-suggestions`.
- Rewrite actions: use Improve Writing, Make It Shorter, Fix Grammar, and Translate from editor fields; confirm suggestions are reviewable before application.
- SEO assistant: create SEO field suggestions and confirm manual editing still works.
- Translation: confirm translated suggestions are stored separately and are not published automatically.
- Section recommendations: confirm only approved section keys are suggested.
- Image checklist: confirm guidance is upload-only and links users back to existing image workflows.
- Apply/reject: apply one field, reject another, and confirm live content only changes after Apply.

## Permission checks

- Client viewer can read suggestions but cannot generate, apply, reject, regenerate, or use rewrite tools.
- Client editor can generate and apply content suggestions but cannot publish unless separately permitted.
- Developer can use AI only on assigned editable sites.
- Cross-tenant and cross-agency users cannot read AI profiles, requests, suggestions, or usage rows.
- Platform admins can view `/admin/ai`, `/admin/ai/prompts`, and `/admin/ai/usage`.

## Failure checks

- Provider missing: set `AI_PROVIDER=openai` without `AI_API_KEY` and confirm the UI shows a useful unavailable message.
- Malformed output: force the provider adapter to return invalid JSON/shape in a local test branch and confirm no suggestion is inserted.
- Timeout/retry: use a very low `AI_REQUEST_TIMEOUT_MS` and confirm safe failure summaries are stored.
- Usage limit: set request limit to the current count and confirm generation is blocked safely.

## Stability checks

Run:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd run smoke:routes
```

Routes added to smoke coverage:

- `/dashboard/websites/[siteId]/ai-setup`
- `/dashboard/websites/[siteId]/ai-suggestions`
- `/client/websites/[siteId]/ai-setup`
- `/client/websites/[siteId]/ai-suggestions`
- `/admin/ai`
- `/admin/ai/prompts`
- `/admin/ai/usage`
- `/agency/ai-usage`

Confirm direct refresh, loading states, safe error states, and CSS loading in a browser.
