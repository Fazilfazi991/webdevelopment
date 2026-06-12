export const reservedSubdomains = new Set([
  "www",
  "admin",
  "dashboard",
  "api",
  "auth",
  "app",
  "mail",
  "support",
  "help",
  "status",
  "assets",
  "static",
  "cdn",
  "blog",
  "sites",
  "client",
  "agency"
]);

export function platformDomain() {
  return process.env.PLATFORM_ROOT_DOMAIN || process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "studioos.site";
}

export function platformUrl() {
  return process.env.NEXT_PUBLIC_PLATFORM_URL || "https://webdevelopment-virid.vercel.app";
}

export function platformWildcardConfigured() {
  return Boolean(process.env.PLATFORM_ROOT_DOMAIN || process.env.NEXT_PUBLIC_PLATFORM_WILDCARD_ENABLED === "true");
}

export function publicSitePath(subdomain: string, pageSlug?: string) {
  return `/sites/${subdomain}${pageSlug && pageSlug !== "home" ? `/${pageSlug}` : ""}`;
}

export function publicSiteUrl(subdomain: string, pageSlug?: string) {
  if (platformWildcardConfigured()) {
    return `https://${subdomain}.${platformDomain()}${pageSlug && pageSlug !== "home" ? `/${pageSlug}` : ""}`;
  }
  return `${platformUrl()}${publicSitePath(subdomain, pageSlug)}`;
}
