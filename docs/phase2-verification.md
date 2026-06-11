# Phase 2 Verification Notes

Date: 2026-06-11

Project scope: dedicated Website Builder Supabase project only.

Supabase MCP was not used. No remote database changes were made automatically.

## Manual SQL Required

Apply this file in the Supabase SQL Editor for the dedicated project:

`supabase/migrations/003_phase2_template_discovery.sql`

## Automated Local Checks

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Manual Flow Checklist

1. Register or log in as a normal user.
2. Create a draft website.
3. Confirm the app opens the Website Type step.
4. Select Business Website.
5. Select an active industry.
6. Select a business category.
7. Search/filter templates.
8. Preview a template.
9. Use the selected template.
10. Confirm the completion page appears.
11. Return to My Websites and confirm setup step, industry, category, and template are shown.
12. Change the industry and confirm incompatible category/template selections are cleared.
13. Confirm backward navigation keeps valid selections.
14. Confirm a normal user cannot open `/admin/industries`, `/admin/business-categories`, or `/admin/templates`.
15. Seed a platform admin and confirm admin CRUD screens work.

## Two-Account RLS Checklist

1. Account A and Account B should not see each other's `site_template_selections`.
2. A viewer member can view a selected template but cannot change it.
3. An editor member can change the selected template.
4. Normal users cannot insert, update, or delete industries, categories, templates, mappings, or template pages.
5. Platform admins can create and update reference data.
