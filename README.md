# Guided Website Builder

Phase 1 foundation for a guided, multi-tenant website-builder SaaS.

This project is intentionally isolated from Plumlet. It is configured for the dedicated Supabase project at `https://caaacypgmlbkmmgobsdc.supabase.co`.

## What Works

- Register and log in with Supabase Auth
- Create an organisation
- Create draft website projects
- View dashboard overview metrics
- View website cards
- View planned media and lead placeholders
- Update profile settings
- Access the admin dashboard shell

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod validation
- Server actions
- Supabase schema and RLS SQL for manual setup

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

`.env.local` should contain this app's dedicated Supabase URL and anon key only. Do not reuse another product's credentials.

## Manual Supabase Setup

Open the SQL editor in the dedicated Supabase project and apply:

`supabase/migrations/001_phase1_foundation.sql`

If you already applied the Phase 1 SQL before the RLS tightening patch was added, also apply:

`supabase/migrations/002_phase1_rls_tightening.sql`

After registering your first user, make that user an admin manually:

```sql
insert into public.platform_admins (user_id)
select id from auth.users where email = 'your-email@example.com'
on conflict (user_id) do nothing;
```

Never apply these SQL files to Plumlet or any existing product database.
