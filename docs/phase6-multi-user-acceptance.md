# Phase 6 Multi-User Acceptance

This checklist is for final real-session acceptance before Phase 7. Use the dedicated Supabase project only. Do not store passwords or invitation tokens in this file.

## Test Accounts

| Account | Email | Status | Notes |
| --- | --- | --- | --- |
| Agency A Owner | Fill during manual test | Pending manual session | Creates Agency A, clients, websites, invitations, and transfers. |
| Agency A Developer | Fill during manual test | Pending manual session | Must only access explicitly assigned websites. |
| Client A Owner | Fill during manual test | Pending manual session | Accepts owner invitation and verifies owner permissions. |
| Client A Viewer | Fill during manual test | Pending manual session | Accepts viewer invitation and verifies read-only restrictions. |
| Agency B Owner | Fill during manual test | Pending manual session | Verifies cross-agency isolation. |

## Acceptance Matrix

| Test | Account used | Route | Action | Expected result | Actual result | Pass or fail | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Agency onboarding | Agency A Owner | `/onboarding/agency` | Create agency workspace | Agency and owner membership created; redirect to `/agency` | Pending manual session | Pending | Use unique slug. Duplicate slug should show friendly error. |
| Agency overview | Agency A Owner | `/agency` | Open dashboard | Metrics and recent activity load; no blank page | Pending manual session | Pending | Empty states should be useful. |
| Add client | Agency A Owner | `/agency/clients` | Create Client A record | Client belongs to Agency A only | Pending manual session | Pending | Verify client contact details are private. |
| Create client website | Agency A Owner | `/agency/websites` | Select Client A and create website | `agency_site_clients`, `site_ownership`, and agency owner `site_access_members` records created | Pending manual session | Pending | Verify website appears under Client A only. |
| Select template | Agency A Owner | `/dashboard/websites/[siteId]/setup/templates` | Choose template | Existing builder flow is reused | Pending manual session | Pending | No duplicate editor. |
| Edit content | Agency A Owner | `/dashboard/websites/[siteId]/editor/content` | Save content | Content saves and activity remains concise | Pending manual session | Pending | Raw database errors must not show. |
| Upload image | Agency A Owner | `/dashboard/websites/[siteId]/editor/images` | Upload image | Media metadata and storage object saved | Pending manual session | Pending | Verify signed URL preview refreshes. |
| Preview | Agency A Owner | `/dashboard/websites/[siteId]/preview` | Open and refresh preview | Preview loads or visible fallback appears | Pending manual session | Pending | No blank page. |
| Publish | Agency A Owner | `/dashboard/websites` | Publish with subdomain | Public site, publish history, version snapshot, and domain record created | Pending manual session | Pending | Verify public route loads. |
| Assign developer | Agency A Owner | Database/app assignment flow | Grant developer access | Agency A Developer gets access only to assigned website | Pending manual session | Pending | Current UI has team invite prep; assignment may require direct record setup until full team invite flow is expanded. |
| Developer assigned access | Agency A Developer | Assigned editor/preview routes | Open assigned website | Assigned website opens according to permissions | Pending manual session | Pending | Verify edit/upload/publish according to permissions. |
| Developer unassigned access | Agency A Developer | Unassigned Agency A site route | Direct URL access | Access denied or visible fallback | Pending manual session | Pending | Test direct route, not only hidden UI. |
| Developer cross-agency block | Agency A Developer | Agency B site route | Direct URL access | Access denied or visible fallback | Pending manual session | Pending | Cross-agency isolation. |
| Client owner invitation | Agency A Owner, Client A Owner | `/agency/invitations`, `/invitations/[token]` | Create and accept owner invitation | Token generated, email failure non-blocking, access record created, redirect to `/client` | Pending manual session | Pending | Do not paste token into logs/docs. |
| Client editor invitation | Agency A Owner, Client A Editor if used | `/agency/invitations`, `/invitations/[token]` | Create and accept editor invitation | Editor preset stored and accepted correctly | Pending manual session | Pending | Optional if separate editor account is available. |
| Client viewer invitation | Agency A Owner, Client A Viewer | `/agency/invitations`, `/invitations/[token]` | Create and accept viewer invitation | Viewer preset stored and accepted as read-only | Pending manual session | Pending | Verify no write permissions. |
| Wrong email invitation | Different signed-in user | `/invitations/[token]` | Attempt accept | Rejected; no site access record | Pending manual session | Pending | Matching invited email required by RLS/update policy. |
| Expired invitation | Client A Owner | `/invitations/[token]` | Open expired token | Rejected with visible message | Pending manual session | Pending | Create short expiry or edit record for test. |
| Cancelled invitation | Client A Owner | `/invitations/[token]` | Open cancelled token | Rejected with visible message | Pending manual session | Pending | Cancellation must prevent reuse. |
| Reused accepted invitation | Client A Owner | `/invitations/[token]` | Accept again | Rejected; no duplicate access | Pending manual session | Pending | Unique `(site_id,user_id)` also protects duplicate access. |
| Client owner dashboard | Client A Owner | `/client`, `/client/websites`, `/client/websites/[siteId]` | Open assigned website | Simple dashboard loads; assigned websites only | Pending manual session | Pending | No agency/internal tooling visible. |
| Client owner editor | Client A Owner | `/client/websites/[siteId]/editor` | Save permitted edits | Permitted edits succeed | Pending manual session | Pending | Server actions must enforce permissions. |
| Client owner publish/domain/leads | Client A Owner | Client/dashboard routes | Publish, domain, lead actions | Allowed when permissions include them | Pending manual session | Pending | Validate both UI and server action. |
| Client viewer preview | Client A Viewer | `/client/websites/[siteId]/preview` | Open preview | Preview works | Pending manual session | Pending | Viewer can preview only. |
| Client viewer edit denial | Client A Viewer | Editor/direct server actions | Attempt save/upload/publish/domain/lead/transfer | Denied server-side with friendly state | Pending manual session | Pending | Must test crafted direct action, not only hidden buttons. |
| Agency B client isolation | Agency B Owner | `/agency/clients` and direct Agency A records | Attempt access | Agency B cannot view Agency A clients | Pending manual session | Pending | RLS tenant isolation. |
| Agency B website isolation | Agency B Owner | Agency A website/leads/media/activity routes | Attempt access | Access denied or visible fallback | Pending manual session | Pending | Includes leads, media, activity, invitation records. |
| Cross-client isolation | Client A Owner/Viewer | Client B routes | Attempt access | Client A cannot view Client B websites/leads/media | Pending manual session | Pending | Direct URL tests required. |
| Transfer preserve access | Agency A Owner, Client A Owner | `/agency/websites`, `/client/websites/[siteId]` | Request with preserve access; client accepts | Ownership becomes client; agency/developer access remains; content/media/domains/leads/versions/history/public status intact | Pending manual session | Pending | Verify `preserve_developer_access = true`. |
| Transfer remove access | Agency A Owner, Client A Owner | `/agency/websites`, `/client/websites/[siteId]` | Request with remove access; client accepts | Ownership becomes client; agency/developer access removed; content/media/domains/leads/versions/history/public status intact | Pending manual session | Pending | Verify former collaborators cannot reopen protected routes. |
| Transfer cancellation | Agency A Owner, Client A Owner | `/agency/websites`, `/client/websites/[siteId]` | Request then cancel | Transfer cancelled; ownership unchanged; client cannot accept; activity logged | Pending manual session | Pending | Repeated cancellation must not corrupt state. |
| Existing self-service regression | Business Owner | `/onboarding`, `/dashboard/websites/new`, editor, preview, publish, lead inbox | Register, create org/site, edit, upload, publish, submit lead, view lead | Original workflow still works | Pending manual session | Pending | Must not require agency workspace. |
| Stability direct routes | Any relevant signed-in account | See `docs/stability-verification.md` | Direct URL, refresh, back/forward, mobile/desktop | CSS loads, no raw HTML, no blank pages, visible errors | Automated baseline passed; authenticated manual pending | Pending | Use route-health checklist. |

## Automated Baseline

Run before approval:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd run smoke:routes
```

Latest automated verification:

| Check | Result | Notes |
| --- | --- | --- |
| Live schema via Supabase API | Passed | Phase 6 tables and hardening columns visible through PostgREST. |
| Typecheck | Passed | Run in this verification pass. |
| Lint | Passed | Run in this verification pass. |
| Build | Passed | Run in this verification pass. |
| Smoke routes | Passed | Public/auth/protected redirect shell routes passed. Set `SMOKE_SITE_ID`, `SMOKE_SUBDOMAIN`, and `SMOKE_INVITATION_TOKEN` for deeper route coverage. |

## Final Manual Verification Attempt - 2026-06-11

The final manual verification request requires real authenticated browser sessions for:

- Self-Service Owner
- Agency A Owner
- Agency A Developer
- Client A Owner
- Client A Viewer
- Agency B Owner

This Codex workspace does not contain credentials for those accounts, and passwords or invitation tokens must not be stored in committed files. Because of that, the real-session acceptance matrix above remains **Pending manual session**. No pending row was marked as passed by inference.

What was verified from this workspace:

- Dedicated Supabase Phase 6 and Phase 7 tables are reachable through the configured project.
- Automated typecheck, lint, production build, and route smoke checks were run during Phase 6 and Phase 7 hardening passes.
- Protected route smoke checks return visible redirect shells with CSS.
- The existing documentation preserves the required manual checks for invitation edge cases, client viewer server-action denial, developer assigned-site restriction, cross-agency isolation, cross-client isolation, ownership transfer preserve/remove/cancel, and self-service regression.

Release status: **not approved for Phase 8** until the real accounts above are used and every required Phase 6 row is updated with actual results.

## Approval Rule

Phase 6 may proceed to Phase 7 only after every manual row above is marked pass using real authenticated browser sessions or equivalent authenticated API sessions. Do not approve Phase 7 from automated schema/build checks alone.
