# Template Quality Checklist

## Technical Services Modern

Status: blocked for final visual approval.

### Asset Readiness

- [x] Required local WebP files exist under `public/templates/technical-services-modern`.
- [x] Asset manifest includes file path, filename, section, expected dimensions, actual dimensions, aspect ratio, crop status, desktop QA status, mobile QA status, and notes.
- [x] Image dimensions match the current expected production placeholder sizes.
- [ ] Final production photography supplied.
- [ ] Final production photography crop-reviewed after replacement.

### Visual Route QA

Required viewport widths: 1440, 1024, 768, 390.

| Route | 1440 | 1024 | 768 | 390 | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `/dashboard/websites/[siteId]/preview` | Not verified | Not verified | Not verified | Not verified | Blocked | Local request returns the app shell with an `/auth/login` redirect signal. Requires authenticated siteId with Technical Services Modern selected. |
| `/dashboard/websites/[siteId]/preview/home` | Not verified | Not verified | Not verified | Not verified | Blocked | Requires authenticated siteId with Technical Services Modern selected. |
| `/dashboard/websites/[siteId]/preview/about` | Not verified | Not verified | Not verified | Not verified | Blocked | Requires authenticated siteId with Technical Services Modern selected. |
| `/dashboard/websites/[siteId]/preview/services` | Not verified | Not verified | Not verified | Not verified | Blocked | Requires authenticated siteId with Technical Services Modern selected. |
| `/dashboard/websites/[siteId]/preview/projects` | Not verified | Not verified | Not verified | Not verified | Blocked | Requires authenticated siteId with Technical Services Modern selected. |
| `/dashboard/websites/[siteId]/preview/contact` | Not verified | Not verified | Not verified | Not verified | Blocked | Requires authenticated siteId with Technical Services Modern selected. |
| `/sites/[subdomain]` | Not verified | Not verified | Not verified | Not verified | Blocked | Requires a published subdomain for this template. |

### Verification Notes

- Local app responded at `http://127.0.0.1:3004`.
- Static asset fetch verified for `/templates/technical-services-modern/hero.webp`.
- `npm.cmd run typecheck` passed.
- `npm.cmd run lint` passed.
- `npm.cmd run build` passed.
- `SMOKE_BASE_URL=http://127.0.0.1:3004 npm.cmd run smoke:routes` passed for the general route set. Template preview and public site checks were skipped because `SMOKE_SITE_ID` and `SMOKE_SUBDOMAIN` were not set.
- Browser screenshot automation is unavailable in this session because the installed browser plugin is missing its required `scripts/browser-client.mjs` helper.
- Supabase MCP was not used.
- No Supabase data, RLS policy, auth flow, billing flow, publishing flow, or public marketing homepage changes are part of this QA document update.
