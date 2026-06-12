"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/access-control";
import { domainProvider } from "@/lib/domains/provider";
import { customDomainSchema, subdomainSchema } from "@/lib/publishing/schemas";
import { publicSiteUrl } from "@/lib/publishing/constants";
import { requireSiteSetup } from "@/lib/setup";

function value(formData: FormData, key: string) { return String(formData.get(key) ?? ""); }
function domainRecord(hostname: string, extra: Record<string, unknown> = {}) {
  return { hostname, domain: hostname, ...extra };
}
async function context(siteId: string) {
  const setup = await requireSiteSetup(siteId);
  if (!hasPermission(setup.siteAccess, "manage_domains", setup.membershipRole)) redirect(`/dashboard/websites/${siteId}?error=Only owners and admins can manage domains.`);
  return setup;
}

export async function saveStudioAddressAction(formData: FormData) {
  const siteId = value(formData, "siteId");
  const parsed = subdomainSchema.safeParse(value(formData, "subdomain"));
  if (!parsed.success) redirect(`/dashboard/websites/${siteId}/domains?error=${encodeURIComponent(parsed.error.errors[0].message)}`);
  const setup = await context(siteId);
  const { data: existing } = await setup.supabase.from("sites").select("id").eq("primary_subdomain", parsed.data).neq("id", siteId).maybeSingle();
  if (existing) redirect(`/dashboard/websites/${siteId}/domains?error=That website address is already in use.`);
  await setup.supabase.from("sites").update({ primary_subdomain: parsed.data }).eq("id", siteId);
  await setup.supabase.from("site_domains").update({ status: "removed", is_primary: false }).eq("site_id", siteId).in("domain_type", ["temporary_path", "platform_path", "platform_subdomain"]);
  const address = new URL(publicSiteUrl(parsed.data));
  const hostname = `${address.host}${address.pathname}`;
  const hasPlatformRoot = Boolean(process.env.PLATFORM_ROOT_DOMAIN || process.env.NEXT_PUBLIC_PLATFORM_WILDCARD_ENABLED === "true");
  await setup.supabase.from("site_domains").upsert(domainRecord(hostname, { site_id: siteId, organization_id: setup.organization.id, domain_type: hasPlatformRoot ? "platform_subdomain" : "temporary_path", status: setup.site.publication_status === "published" ? "active" : "pending", verification_status: "verified", ssl_status: "active", is_primary: true, redirect_to_primary: false, verified_at: new Date().toISOString(), created_by: setup.user.id }), { onConflict: "domain" });
  revalidatePath(`/dashboard/websites/${siteId}`);
  redirect(`/dashboard/websites/${siteId}/domains?message=Studio OS address updated.`);
}

export async function addCustomDomainAction(formData: FormData) {
  const siteId = value(formData, "siteId");
  const parsed = customDomainSchema.safeParse({ siteId, domain: value(formData, "domain") });
  if (!parsed.success) redirect(`/dashboard/websites/${siteId}/domains?error=${encodeURIComponent(parsed.error.errors[0].message)}`);
  const setup = await context(siteId);
  try {
    const state = await domainProvider().addDomain(parsed.data.domain);
    const { error } = await setup.supabase.from("site_domains").upsert(domainRecord(parsed.data.domain, { site_id: siteId, organization_id: setup.organization.id, domain_type: "custom_domain", status: state.verificationStatus === "verified" && state.sslStatus === "active" ? "active" : state.verificationStatus === "waiting_dns" ? "waiting_dns" : "verifying", verification_status: state.verificationStatus, ssl_status: state.sslStatus, verification_method: "dns", verification_details: { dnsRecords: state.dnsRecords }, provider_domain_id: state.providerDomainId ?? null, is_primary: false, redirect_to_primary: true, created_by: setup.user.id }), { onConflict: "domain" });
    if (error) throw error;
  } catch (error) { redirect(`/dashboard/websites/${siteId}/domains?error=${encodeURIComponent(error instanceof Error ? error.message : "Could not connect domain.")}`); }
  redirect(`/dashboard/websites/${siteId}/domains?message=Domain added. Complete the DNS steps below.`);
}

export async function refreshCustomDomainAction(formData: FormData) {
  const siteId = value(formData, "siteId"); const domainId = value(formData, "domainId"); const hostname = value(formData, "hostname");
  const setup = await context(siteId); const state = await domainProvider().checkDomainStatus(hostname);
  await setup.supabase.from("site_domains").update({ status: state.verificationStatus === "verified" && state.sslStatus === "active" ? "active" : state.verificationStatus === "waiting_dns" ? "waiting_dns" : "verifying", verification_status: state.verificationStatus, ssl_status: state.sslStatus, verification_details: { dnsRecords: state.dnsRecords }, last_checked_at: new Date().toISOString(), verified_at: state.verificationStatus === "verified" ? new Date().toISOString() : null }).eq("id", domainId).eq("site_id", siteId);
  revalidatePath(`/dashboard/websites/${siteId}/domains`); redirect(`/dashboard/websites/${siteId}/domains?message=Domain status refreshed.`);
}

export async function removeCustomDomainAction(formData: FormData) {
  const siteId = value(formData, "siteId"); const domainId = value(formData, "domainId"); const hostname = value(formData, "hostname");
  const setup = await context(siteId); await domainProvider().removeDomain(hostname); await setup.supabase.from("site_domains").update({ status: "removed", is_primary: false }).eq("id", domainId).eq("site_id", siteId);
  redirect(`/dashboard/websites/${siteId}/domains?message=Domain removed.`);
}

export async function markPrimaryDomainAction(formData: FormData) {
  const siteId = value(formData, "siteId"); const domainId = value(formData, "domainId"); const setup = await context(siteId);
  await setup.supabase.from("site_domains").update({ is_primary: false }).eq("site_id", siteId);
  await setup.supabase.from("site_domains").update({ is_primary: true }).eq("id", domainId).eq("site_id", siteId).eq("status", "active");
  redirect(`/dashboard/websites/${siteId}/domains?message=Primary domain updated.`);
}
