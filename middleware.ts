import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { rendererPath, resolveHostRequest } from "@/lib/publishing/host-routing";

export async function middleware(request: NextRequest) {
  const resolution = resolveHostRequest({
    host: request.headers.get("host") || "",
    pathname: request.nextUrl.pathname,
    appHost: process.env.NEXT_PUBLIC_APP_HOST || "webdevelopment-virid.vercel.app",
    wildcardRoot: process.env.PLATFORM_ROOT_DOMAIN || process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "studioos.site"
  });

  let rewritePath: string | null = null;
  if (resolution.kind === "platform-path" || resolution.kind === "platform-subdomain") {
    rewritePath = rendererPath(resolution.slug, resolution.pagePath);
  }

  // Guard: if Supabase env vars are missing (e.g. Vercel env not configured yet),
  // pass the request through unchanged rather than crashing with 500.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const responseForPath = () => {
    if (!rewritePath) return NextResponse.next({ request });
    const url = request.nextUrl.clone();
    url.pathname = rewritePath;
    return NextResponse.rewrite(url, { request });
  };

  if (!supabaseUrl || !supabaseKey) return responseForPath();

  let response = responseForPath();

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = responseForPath();
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  if (resolution.kind === "custom-domain") {
    const { data: domain } = await supabase
      .from("site_domains")
      .select("site_id,is_primary,redirect_to_primary,hostname,domain")
      .or(`hostname.eq.${resolution.hostname},domain.eq.${resolution.hostname}`)
      .eq("status", "active")
      .maybeSingle<{ site_id: string; is_primary: boolean | null; redirect_to_primary: boolean | null; hostname: string | null; domain: string | null }>();
    if (domain) {
      if (domain.redirect_to_primary && !domain.is_primary) {
        const { data: primary } = await supabase
          .from("site_domains")
          .select("hostname,domain")
          .eq("site_id", domain.site_id)
          .eq("is_primary", true)
          .eq("status", "active")
          .maybeSingle<{ hostname: string | null; domain: string | null }>();
        const primaryHost = primary?.hostname || primary?.domain;
        if (primaryHost && primaryHost !== resolution.hostname) {
          const url = request.nextUrl.clone();
          url.protocol = "https:";
          url.host = primaryHost;
          return NextResponse.redirect(url, 308);
        }
      }
      const { data: site } = await supabase.from("sites").select("primary_subdomain").eq("id", domain.site_id).eq("publication_status", "published").maybeSingle<{ primary_subdomain: string | null }>();
      if (site?.primary_subdomain) {
        rewritePath = rendererPath(site.primary_subdomain, resolution.pagePath);
        response = responseForPath();
      }
    }
  }

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
