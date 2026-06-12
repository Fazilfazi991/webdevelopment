import { platformDomain } from "@/lib/publishing/constants";

export type HostResolution =
  | { kind: "internal" }
  | { kind: "platform-path"; slug: string; pagePath: string }
  | { kind: "platform-subdomain"; slug: string; pagePath: string }
  | { kind: "custom-domain"; hostname: string; pagePath: string };

const internalRoots = new Set(["admin", "api", "auth", "dashboard", "sites", "client", "agency", "support", "help", "blog", "onboarding", "invitations", "robots.txt", "sitemap.xml"]);

export function normalizeHostname(host: string) {
  return host.split(":")[0]?.trim().toLowerCase().replace(/\.$/, "") ?? "";
}

export function subdomainFromHost(host: string, wildcardRoot = platformDomain()) {
  const cleanHost = normalizeHostname(host);
  const root = normalizeHostname(wildcardRoot);
  if (!cleanHost || cleanHost === root || !cleanHost.endsWith(`.${root}`)) return null;
  const slug = cleanHost.slice(0, -(root.length + 1));
  return slug.includes(".") ? null : slug;
}

export function customDomainFromHost(host: string, wildcardRoot = platformDomain()) {
  const cleanHost = normalizeHostname(host);
  if (!cleanHost || cleanHost === normalizeHostname(wildcardRoot) || cleanHost.endsWith(`.${normalizeHostname(wildcardRoot)}`)) return null;
  return cleanHost;
}

export function resolveHostRequest({ host, pathname, appHost = "webdevelopment-virid.vercel.app", wildcardRoot = platformDomain() }: { host: string; pathname: string; appHost?: string; wildcardRoot?: string }): HostResolution {
  const hostname = normalizeHostname(host);
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const parts = cleanPath.split("/").filter(Boolean);
  const isAppHost = hostname === normalizeHostname(appHost) || hostname === "localhost" || hostname === "127.0.0.1";
  if (isAppHost) {
    if (parts[0] === "sites" || !parts[0] || internalRoots.has(parts[0])) return { kind: "internal" };
    return { kind: "platform-path", slug: parts[0], pagePath: `/${parts.slice(1).join("/")}` };
  }
  const slug = subdomainFromHost(hostname, wildcardRoot);
  if (slug) return { kind: "platform-subdomain", slug, pagePath: cleanPath };
  return { kind: "custom-domain", hostname, pagePath: cleanPath };
}

export function rendererPath(slug: string, pagePath = "/") {
  const suffix = pagePath === "/" ? "" : pagePath;
  return `/sites/${slug}${suffix}`;
}
