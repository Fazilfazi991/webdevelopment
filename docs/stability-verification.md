# Stability Verification

Run these checks before Phase 6 after a clean `.next` delete, in both `npm.cmd run dev` and `npm.cmd run build` plus `npm.cmd run start`.

For each route verify: direct URL load, hard refresh, client-side navigation, browser back, browser forward, desktop viewport, mobile viewport, CSS loaded, no console error, no terminal error, and no blank page.

| Route | Auth State | Expected Result |
| --- | --- | --- |
| `/` | Public | Homepage loads with global CSS. |
| `/auth/login` | Public | Login form loads with global CSS. |
| `/auth/register` | Public | Register form loads with global CSS. |
| `/dashboard` | Authenticated | Dashboard shell and overview load; unauthenticated users redirect to login. |
| `/dashboard/websites` | Authenticated | Website cards, publish controls, and fallbacks load. |
| `/dashboard/websites/[siteId]/editor` | Authenticated | Editor shell loads or shows a visible editor error state. |
| `/dashboard/websites/[siteId]/preview` | Authenticated | Preview toolbar remains visible; missing template/data shows a fallback. |
| `/dashboard/leads` | Authenticated | Lead inbox loads or shows an empty state. |
| `/sites/[subdomain]` | Public | Published site loads; unpublished/missing site shows not-found copy. |
| `/sites/[subdomain]/about` | Public | Published page loads or shows not-found copy. |
| `/sites/[subdomain]/services` | Public | Published page loads or shows not-found copy. |
| `/sites/[subdomain]/contact` | Public | Published page loads and contact form can submit leads. |

Extra refresh loop:

1. Refresh `/dashboard` five times.
2. Refresh `/dashboard/websites` five times.
3. Refresh `/dashboard/websites/[siteId]/preview` five times.
4. Open the preview route in a new tab.
5. Navigate dashboard -> websites -> editor -> preview -> dashboard with browser back and forward.
6. Repeat at a mobile-width viewport.
7. Restart the server and repeat the same route checks.

Automated smoke check:

```powershell
npm.cmd run smoke:routes
$env:SMOKE_SITE_ID="replace-with-site-id"; $env:SMOKE_SUBDOMAIN="replace-with-subdomain"; npm.cmd run smoke:routes
```
