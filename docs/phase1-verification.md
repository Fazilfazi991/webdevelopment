# Phase 1 Verification Notes

Date: 2026-06-11

Project scope: dedicated Website Builder Supabase project only.

Supabase MCP was not used. No remote database changes were made automatically during this verification pass.

## Automated Local Checks

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed.
- Local server route smoke checks passed on port `3003`.

## Routes Smoke Checked

- `/auth/login` returns the login page.
- `/auth/register` returns the registration page.
- `/auth/forgot-password` returns the forgot-password page.
- `/auth/reset-password` returns the reset-password page.
- `/dashboard` returns a server redirect payload to `/auth/login` when unauthenticated.
- `/admin` returns a server redirect payload to `/auth/login` when unauthenticated.
- `/onboarding` returns a server redirect payload to `/auth/login` when unauthenticated.

## Supabase SQL Reviewed

Manual SQL files:

- `supabase/migrations/001_phase1_foundation.sql`
- `supabase/migrations/002_phase1_rls_tightening.sql`

Tables covered:

- `profiles`
- `organizations`
- `organization_members`
- `sites`
- `platform_admins`
- `media_library`

RLS is enabled on all Phase 1 tenant tables. Policies cover own-profile access, organisation membership access, owner/admin organisation updates, owner/admin/editor site writes, viewer read-only access, media tenant isolation, and platform-admin gating.

## Manual Supabase Tests Still Required

These checks require creating real auth users or tenant records in the dedicated Supabase project, so they should be performed manually:

1. Register a new user.
2. Confirm email if Supabase email confirmation is enabled.
3. Log in with the confirmed user.
4. Verify invalid login credentials show an error.
5. Request a forgot-password email.
6. Follow a reset-password link and set a new password.
7. Create an organisation and confirm owner membership exists.
8. Try a duplicate organisation slug and confirm a clear error.
9. Create a draft business website.
10. Try an invalid website slug and confirm validation appears.
11. Try a duplicate website slug and confirm a clear error.
12. Confirm a normal user is redirected away from `/admin`.

## Two-Account RLS Checklist

Use two normal test accounts in different organisations:

1. Account A can see only Account A profile, organisation, sites, and media records.
2. Account B can see only Account B profile, organisation, sites, and media records.
3. Account A cannot query or update Account B sites.
4. Account B cannot query or update Account A sites.
5. A viewer member can view organisation sites but cannot create or update sites.
6. An editor member can create and update sites.
7. A normal authenticated user cannot insert themselves into `platform_admins`.
8. Only a manually seeded platform admin can access `/admin`.

## Manual Admin Seed

After registering the first platform admin user, run this in the Supabase SQL editor:

```sql
insert into public.platform_admins (user_id)
select id from auth.users where email = 'your-email@example.com'
on conflict (user_id) do nothing;
```
