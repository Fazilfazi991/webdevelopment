# Supabase Manual Setup

This folder contains SQL for the dedicated Website Builder Supabase project only.

Target project:

`https://caaacypgmlbkmmgobsdc.supabase.co`

Do not apply these files to Plumlet or any existing product database.

Apply `migrations/001_phase1_foundation.sql` manually in the Supabase SQL editor for this project.

If `001_phase1_foundation.sql` was already applied before `002_phase1_rls_tightening.sql` existed, apply `migrations/002_phase1_rls_tightening.sql` as a follow-up patch.

For Phase 2, apply `migrations/003_phase2_template_discovery.sql` manually in the same dedicated project.
