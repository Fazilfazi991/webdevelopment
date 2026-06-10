# Guided Website Builder

Phase 1 demo foundation for a guided, multi-tenant website-builder SaaS.

This project is intentionally isolated from Plumlet. It does not connect to Supabase yet. The current app uses demo cookie state so the product flow can be reviewed safely without touching any external database.

## What Works In Demo Mode

- Register and log in with demo auth
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
- Supabase schema placeholder for a future separate project

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` if needed. Supabase variables are intentionally commented out until a new, separate Supabase project is created for this app.

## Supabase Safety

Do not apply `supabase/migrations/000_placeholder_phase1_schema.sql` to Plumlet or any existing product database. It is documentation for a future dedicated project only.

## Future Backend Steps

1. Create a brand-new Supabase project for this app.
2. Review the placeholder SQL.
3. Add full RLS policies and storage bucket policies.
4. Add a seed script for the first platform admin.
5. Replace demo cookie state with Supabase Auth and Postgres queries.
