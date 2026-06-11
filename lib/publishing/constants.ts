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
  "blog"
]);

export function platformDomain() {
  return process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "yourplatform.com";
}

export function platformUrl() {
  return process.env.NEXT_PUBLIC_PLATFORM_URL || `https://${platformDomain()}`;
}

export function publicSitePath(subdomain: string, pageSlug?: string) {
  return `/sites/${subdomain}${pageSlug && pageSlug !== "home" ? `/${pageSlug}` : ""}`;
}

export function publicSiteUrl(subdomain: string, pageSlug?: string) {
  return `${platformUrl()}${publicSitePath(subdomain, pageSlug)}`;
}
