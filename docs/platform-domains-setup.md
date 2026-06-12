# Platform Subdomains and Custom Domains

## Manual SQL

Apply these migrations manually to the Website Builder Supabase project:

1. `supabase/migrations/020_five_page_editor_structure.sql`
2. `supabase/migrations/021_site_domains.sql`

Do not apply them to unrelated Supabase projects.

## Environment Variables

Customer rendering keeps using `/sites/[slug]` internally.

- `PLATFORM_ROOT_DOMAIN=studioos.site` enables wildcard platform addresses such as `test.studioos.site`.
- `NEXT_PUBLIC_PLATFORM_URL=https://webdevelopment-virid.vercel.app` keeps temporary development paths such as `/sites/test`.
- `NEXT_PUBLIC_APP_HOST=webdevelopment-virid.vercel.app` identifies the dashboard/app host.
- `DOMAIN_PROVIDER=mock` is the safe default for local and test environments.
- `DOMAIN_PROVIDER=vercel` with `ENABLE_REMOTE_DOMAIN_PROVISIONING=true` enables live Vercel calls.
- `VERCEL_API_TOKEN`, `VERCEL_PROJECT_ID`, and optional `VERCEL_TEAM_ID` are server-only.
- `DOMAIN_A_RECORD_VALUE` and `DOMAIN_CNAME_TARGET` control customer DNS instructions.

## Configure `*.studioos.site`

1. Add `studioos.site` and `*.studioos.site` to the hosting provider project.
2. Point DNS for the root and wildcard according to the provider's instructions.
3. Set `PLATFORM_ROOT_DOMAIN=studioos.site`.
4. Verify `https://test.studioos.site` rewrites internally to `/sites/test`.

## Customer-Owned Domains

1. Customer enters a hostname such as `www.fusionventuresglobal.com`.
2. The provider adapter returns DNS records.
3. Customer adds the DNS record at their domain host.
4. Customer clicks `I Added the Record`.
5. The app refreshes DNS and SSL status.
6. After active status, the customer can make the domain primary.

## Vercel Provider Mode

Keep `DOMAIN_PROVIDER=mock` until live provisioning is intentionally enabled.

To enable Vercel:

1. Set `DOMAIN_PROVIDER=vercel`.
2. Set `ENABLE_REMOTE_DOMAIN_PROVISIONING=true`.
3. Set `VERCEL_API_TOKEN` and `VERCEL_PROJECT_ID`.
4. Add `VERCEL_TEAM_ID` if the project belongs to a team.
5. Test with a disposable domain before connecting customer domains.

## Safe Custom-Domain Test

Use a disposable subdomain first, for example:

```text
qa.example-owned-domain.com
```

Connect it, copy the DNS record, wait for DNS propagation, click `I Added the Record`, and only then mark it primary.
