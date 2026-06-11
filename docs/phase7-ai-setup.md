# Phase 7 AI Setup

Phase 7 adds controlled AI assistance for website setup and editing. AI output is stored as reviewable suggestions and is never published or applied automatically.

## Manual migration

Paste and execute this file in the dedicated Supabase SQL Editor:

`supabase/migrations/011_phase7_controlled_ai.sql`

Do not run it against any unrelated Supabase project.

## Environment variables

Add these server-side variables. Do not use `NEXT_PUBLIC_` for provider secrets.

```text
AI_PROVIDER=mock
AI_MODEL=mock-controlled-content-v1
AI_API_KEY=
AI_REQUEST_TIMEOUT_MS=15000
AI_MAX_RETRIES=1
AI_DEFAULT_REQUEST_LIMIT=50
AI_DEFAULT_TOKEN_LIMIT=100000
```

## Mock provider mode

`AI_PROVIDER=mock` returns deterministic structured suggestions and is suitable for local route and flow testing. It does not call an external provider and estimated cost is `0`.

## Real provider mode

`AI_PROVIDER=openai` uses the server-side `AI_API_KEY` and requests JSON output. The adapter validates every response with Zod before suggestions are inserted. Raw provider errors are replaced with safe summaries.

## Prompt versioning

Prompt metadata is stored in `ai_prompt_versions`. Platform admins can inspect and edit prompt purpose/templates at `/admin/ai/prompts`. Provider secrets must never be stored in prompts.

## Usage limits

`ai_usage_limits` tracks request and token counts by scope. Phase 7 only provides the foundation for limits; it does not add billing, credits, or payment flows.

## Security expectations

AI can create profile, content, SEO, translation, section recommendation, and image checklist suggestions. It cannot publish, change domains, change permissions, invite users, transfer ownership, modify billing, write arbitrary HTML/CSS, inject scripts, or create unsupported sections.
