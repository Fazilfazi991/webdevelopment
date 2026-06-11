import { platformDomain } from "@/lib/publishing/constants";

export function subdomainFromHost(host: string) {
  const cleanHost = host.split(":")[0]?.toLowerCase();
  const root = platformDomain().toLowerCase();
  if (!cleanHost || cleanHost === root || !cleanHost.endsWith(`.${root}`)) return null;
  return cleanHost.slice(0, -(root.length + 1));
}

export function customDomainFromHost(host: string) {
  const cleanHost = host.split(":")[0]?.toLowerCase();
  if (!cleanHost || cleanHost.endsWith(`.${platformDomain().toLowerCase()}`)) return null;
  return cleanHost;
}
