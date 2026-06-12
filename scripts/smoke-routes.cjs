const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000";
const siteId = process.env.SMOKE_SITE_ID;
const subdomain = process.env.SMOKE_SUBDOMAIN;
const invitationToken = process.env.SMOKE_INVITATION_TOKEN;

const routes = [
  { path: "/", expectCss: true },
  { path: "/auth/login", expectCss: true },
  { path: "/dashboard", allowRedirect: true, expectCss: true },
  { path: "/dashboard/websites", allowRedirect: true, expectCss: true },
  { path: "/agency", allowRedirect: true, expectCss: true },
  { path: "/agency/clients", allowRedirect: true, expectCss: true },
  { path: "/agency/websites", allowRedirect: true, expectCss: true },
  { path: "/agency/team", allowRedirect: true, expectCss: true },
  { path: "/agency/invitations", allowRedirect: true, expectCss: true },
  { path: "/agency/ai-usage", allowRedirect: true, expectCss: true },
  { path: "/client", allowRedirect: true, expectCss: true },
  { path: "/client/websites", allowRedirect: true, expectCss: true },
  { path: "/admin/ai", allowRedirect: true, expectCss: true },
  { path: "/admin/ai/prompts", allowRedirect: true, expectCss: true },
  { path: "/admin/ai/usage", allowRedirect: true, expectCss: true },
  siteId ? { path: `/dashboard/websites/${siteId}/preview`, allowRedirect: true, expectCss: true } : null,
  siteId ? { path: `/dashboard/websites/${siteId}/design`, allowRedirect: true, expectCss: true } : null,
  siteId ? { path: `/dashboard/websites/${siteId}/media`, allowRedirect: true, expectCss: true } : null,
  siteId ? { path: `/dashboard/websites/${siteId}/domains`, allowRedirect: true, expectCss: true } : null,
  siteId ? { path: `/dashboard/websites/${siteId}/settings/branding`, allowRedirect: true, expectCss: true } : null,
  siteId ? { path: `/dashboard/websites/${siteId}/seo`, allowRedirect: true, expectCss: true } : null,
  siteId ? { path: `/dashboard/websites/${siteId}/ai-setup`, allowRedirect: true, allowNotFound: true, expectCss: true } : null,
  siteId ? { path: `/dashboard/websites/${siteId}/ai-suggestions`, allowRedirect: true, allowNotFound: true, expectCss: true } : null,
  siteId ? { path: `/client/websites/${siteId}`, allowRedirect: true, allowNotFound: true, expectCss: true } : null,
  siteId ? { path: `/client/websites/${siteId}/editor`, allowRedirect: true, allowNotFound: true, expectCss: true } : null,
  siteId ? { path: `/client/websites/${siteId}/preview`, allowRedirect: true, allowNotFound: true, expectCss: true } : null,
  siteId ? { path: `/client/websites/${siteId}/ai-setup`, allowRedirect: true, allowNotFound: true, expectCss: true } : null,
  siteId ? { path: `/client/websites/${siteId}/ai-suggestions`, allowRedirect: true, allowNotFound: true, expectCss: true } : null,
  subdomain ? { path: `/sites/${subdomain}`, allowNotFound: true, expectCss: true } : null,
  subdomain ? { path: `/sites/${subdomain}/about`, allowNotFound: true, expectCss: true } : null,
  subdomain ? { path: `/sites/${subdomain}/services`, allowNotFound: true, expectCss: true } : null,
  subdomain ? { path: `/sites/${subdomain}/projects`, allowNotFound: true, expectCss: true } : null,
  subdomain ? { path: `/sites/${subdomain}/contact`, allowNotFound: true, expectCss: true } : null
  , invitationToken ? { path: `/invitations/${invitationToken}`, allowRedirect: true, allowNotFound: true, expectCss: true } : null
].filter(Boolean);

function hasCssReference(html) {
  return /<link[^>]+stylesheet|\/_next\/static\/css\//i.test(html);
}

function hasVisibleBody(html) {
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || html;
  return body.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, "").trim().length > 0;
}

function hasNextRedirectDigest(html) {
  return /NEXT_REDIRECT|;replace;\/auth\/login;|;replace;\/onboarding;/i.test(html);
}

async function checkRoute(route) {
  const response = await fetch(new URL(route.path, baseUrl), { redirect: "manual" });
  const html = await response.text();
  const location = response.headers.get("location");

  if (response.status >= 500) throw new Error(`${route.path} returned ${response.status}`);
  if (response.status >= 300 && response.status < 400) {
    if (!route.allowRedirect) throw new Error(`${route.path} redirected unexpectedly to ${location}`);
    return { path: route.path, status: response.status, note: `redirect ${location || ""}`.trim() };
  }
  if (response.status === 404 && route.allowNotFound) {
    if (!hasVisibleBody(html)) throw new Error(`${route.path} returned an empty 404 body`);
    return { path: route.path, status: response.status, note: "visible not-found" };
  }
  if (!response.ok) throw new Error(`${route.path} returned ${response.status}`);
  if (!html.trim()) throw new Error(`${route.path} returned empty HTML`);
  if (route.allowRedirect && hasNextRedirectDigest(html)) {
    if (route.expectCss && !hasCssReference(html)) throw new Error(`${route.path} redirect shell did not include a CSS asset reference`);
    return { path: route.path, status: response.status, note: "next redirect" };
  }
  if (!hasVisibleBody(html)) throw new Error(`${route.path} rendered an empty body`);
  if (route.expectCss && !hasCssReference(html)) throw new Error(`${route.path} did not include a CSS asset reference`);
  return { path: route.path, status: response.status, note: "ok" };
}

(async () => {
  const results = [];
  for (const route of routes) results.push(await checkRoute(route));
  for (const result of results) console.log(`${result.status} ${result.path} ${result.note}`);
  if (!siteId) console.log("SKIP /dashboard/websites/[siteId]/preview: set SMOKE_SITE_ID to include it.");
  if (!siteId) console.log("SKIP /dashboard/websites/[siteId]/ai-setup and /ai-suggestions: set SMOKE_SITE_ID to include them.");
  if (!siteId) console.log("SKIP /client/websites/[siteId] routes: set SMOKE_SITE_ID to include them.");
  if (!subdomain) console.log("SKIP /sites/[subdomain] nested routes: set SMOKE_SUBDOMAIN to include them.");
  if (!invitationToken) console.log("SKIP /invitations/[token]: set SMOKE_INVITATION_TOKEN to include it.");
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
