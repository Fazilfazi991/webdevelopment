"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadEditorContext } from "@/lib/site-editor/editor-loader";
import { requireSiteSetup } from "@/lib/setup";
import { publicSitePath } from "@/lib/publishing/constants";
import { customDomainSchema, leadSchema, leadUpdateSchema, publishSchema, seoSchema, unpublishSchema } from "@/lib/publishing/schemas";
import { notifyLead } from "@/lib/publishing/email";
import { hasPermission } from "@/lib/access-control";
import type { ContactLead, LeadNotificationSetting, SiteVersion } from "@/lib/types";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function err(siteId: string, tab: string, message: string): never {
  redirect(`/dashboard/websites/${siteId}/editor/${tab}?error=${encodeURIComponent(message)}`);
}

async function requirePublishSite(siteId: string) {
  const context = await requireSiteSetup(siteId);
  if (!hasPermission(context.siteAccess, "publish_site", context.membershipRole)) {
    redirect(`/dashboard/websites/${siteId}/editor?error=You do not have permission to publish this website.`);
  }
  return context;
}

async function createVersionSnapshot(siteId: string, performedBy: string) {
  const { supabase } = await requireSiteSetup(siteId);
  const snapshot = await loadEditorContext(supabase, siteId, true);
  const { count } = await supabase.from("site_versions").select("id", { count: "exact", head: true }).eq("site_id", siteId);
  const { data, error } = await supabase
    .from("site_versions")
    .insert({
      site_id: siteId,
      version_number: (count ?? 0) + 1,
      snapshot,
      created_by: performedBy
    })
    .select("id")
    .single<SiteVersion>();
  if (error || !data) throw new Error("version_failed");
  return data.id;
}

export async function publishWebsiteAction(formData: FormData) {
  const input = publishSchema.safeParse({ siteId: value(formData, "siteId"), subdomain: value(formData, "subdomain") });
  if (!input.success) redirect(`/dashboard/websites?error=${encodeURIComponent(input.error.errors[0].message)}`);
  const { supabase, site, organization, user, selection } = await requirePublishSite(input.data.siteId);
  if (!selection?.template_id) err(site.id, "content", "Choose a design template before publishing.");

  const { data: existing } = await supabase.from("sites").select("id").eq("primary_subdomain", input.data.subdomain).neq("id", site.id).maybeSingle();
  if (existing) err(site.id, "content", "That subdomain is already taken.");

  let versionId: string;
  try {
    versionId = await createVersionSnapshot(site.id, user.id);
  } catch {
    err(site.id, "content", "Could not save a publish version.");
  }

  const action = site.publication_status === "published" ? "republished" : "published";
  const { error } = await supabase
    .from("sites")
    .update({
      publication_status: "published",
      status: "published",
      primary_subdomain: input.data.subdomain,
      published_at: new Date().toISOString(),
      published_by: user.id,
      last_published_version_id: versionId
    })
    .eq("id", site.id);
  if (error) err(site.id, "content", "Could not publish the website.");

  await supabase.from("site_domains").upsert(
    {
      site_id: site.id,
      organization_id: organization.id,
      domain: `${input.data.subdomain}.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "yourplatform.com"}`,
      domain_type: "platform_subdomain",
      status: "active",
      is_primary: true,
      verified_at: new Date().toISOString(),
      created_by: user.id
    },
    { onConflict: "domain" }
  );
  await supabase.from("site_publish_history").insert({ site_id: site.id, site_version_id: versionId, action, performed_by: user.id });
  revalidatePath("/dashboard/websites");
  redirect(`/dashboard/websites/${site.id}/editor?message=Website published at ${publicSitePath(input.data.subdomain)}.`);
}

export async function unpublishWebsiteAction(formData: FormData) {
  const input = unpublishSchema.safeParse({ siteId: value(formData, "siteId") });
  if (!input.success) redirect("/dashboard/websites?error=Could not unpublish website.");
  const { supabase, site, user } = await requirePublishSite(input.data.siteId);
  await supabase.from("sites").update({ publication_status: "unpublished", status: "draft" }).eq("id", site.id);
  await supabase.from("site_publish_history").insert({ site_id: site.id, action: "unpublished", performed_by: user.id });
  revalidatePath("/dashboard/websites");
  redirect(`/dashboard/websites?message=Website unpublished.`);
}

export async function saveSeoAction(formData: FormData) {
  const input = seoSchema.safeParse({
    siteId: value(formData, "siteId"),
    seoTitle: value(formData, "seoTitle"),
    seoDescription: value(formData, "seoDescription"),
    seoKeywords: value(formData, "seoKeywords"),
    ogTitle: value(formData, "ogTitle"),
    ogDescription: value(formData, "ogDescription"),
    robotsIndex: formData.get("robotsIndex") === "on" ? "on" : "off",
    robotsFollow: formData.get("robotsFollow") === "on" ? "on" : "off"
  });
  if (!input.success) redirect(`/dashboard/websites?error=${encodeURIComponent(input.error.errors[0].message)}`);
  const { supabase, site } = await requirePublishSite(input.data.siteId);
  const { error } = await supabase
    .from("sites")
    .update({
      seo_title: input.data.seoTitle || null,
      seo_description: input.data.seoDescription || null,
      seo_keywords: input.data.seoKeywords || null,
      og_title: input.data.ogTitle || null,
      og_description: input.data.ogDescription || null,
      robots_index: input.data.robotsIndex === "on",
      robots_follow: input.data.robotsFollow === "on"
    })
    .eq("id", site.id);
  if (error) err(site.id, "design", "Could not save SEO settings.");
  redirect(`/dashboard/websites/${site.id}/editor/design?message=SEO settings saved.`);
}

export async function saveCustomDomainAction(formData: FormData) {
  const input = customDomainSchema.safeParse({ siteId: value(formData, "siteId"), domain: value(formData, "domain") });
  if (!input.success) redirect(`/dashboard/websites?error=${encodeURIComponent(input.error.errors[0].message)}`);
  const { supabase, site, organization, user, membershipRole, siteAccess } = await requireSiteSetup(input.data.siteId);
  if (!hasPermission(siteAccess, "manage_domains", membershipRole)) err(site.id, "design", "Only owners and admins can manage domains.");
  const token = crypto.randomUUID();
  const { error } = await supabase.from("site_domains").insert({
    site_id: site.id,
    organization_id: organization.id,
    domain: input.data.domain,
    domain_type: "custom_domain",
    status: "pending",
    verification_token: token,
    verification_method: "dns_txt",
    verification_details: { cname_target: process.env.DOMAIN_CNAME_TARGET || process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "yourplatform.com" },
    created_by: user.id
  });
  if (error) err(site.id, "design", "Could not save custom domain.");
  redirect(`/dashboard/websites/${site.id}/editor/design?message=Custom domain saved with DNS instructions.`);
}

export async function submitLeadAction(formData: FormData) {
  const input = leadSchema.safeParse({
    siteId: value(formData, "siteId"),
    organizationId: value(formData, "organizationId"),
    name: value(formData, "name"),
    email: value(formData, "email"),
    phone: value(formData, "phone"),
    whatsapp: value(formData, "whatsapp"),
    subject: value(formData, "subject"),
    message: value(formData, "message"),
    sourcePage: value(formData, "sourcePage"),
    sourceUrl: value(formData, "sourceUrl"),
    honeypot: value(formData, "companyWebsite"),
    submittedAt: value(formData, "submittedAt")
  });
  if (!input.success || Date.now() - input.data.submittedAt < 1500) {
    redirect(`${value(formData, "returnPath") || "/"}?lead=error`);
  }
  const supabase = createClient();
  const { data: site } = await supabase
    .from("sites")
    .select("id, organization_id, publication_status")
    .eq("id", input.data.siteId)
    .eq("organization_id", input.data.organizationId)
    .eq("publication_status", "published")
    .maybeSingle();
  if (!site) redirect(`${value(formData, "returnPath") || "/"}?lead=error`);
  const leadPayload = {
    site_id: input.data.siteId,
    organization_id: input.data.organizationId,
    name: input.data.name,
    email: input.data.email || null,
    phone: input.data.phone || null,
    whatsapp: input.data.whatsapp || null,
    subject: input.data.subject || null,
    message: input.data.message,
    source_page: input.data.sourcePage || null,
    source_url: input.data.sourceUrl || null
  } satisfies Partial<ContactLead>;
  const { error } = await supabase
    .from("contact_leads")
    .insert(leadPayload);
  if (!error) {
    const { data: settings } = await supabase.from("lead_notification_settings").select("*").eq("site_id", input.data.siteId).maybeSingle<LeadNotificationSetting>();
    if (settings?.send_email_notifications) await notifyLead({ name: input.data.name, email: input.data.email || null, message: input.data.message }, settings.notification_email);
  }
  redirect(`${value(formData, "returnPath") || "/"}?lead=${error ? "error" : "success"}`);
}

export async function updateLeadAction(formData: FormData) {
  const input = leadUpdateSchema.safeParse({
    leadId: value(formData, "leadId"),
    status: value(formData, "status"),
    isRead: value(formData, "isRead")
  });
  if (!input.success) redirect("/dashboard/leads?error=Could not update lead.");
  const supabase = createClient();
  const { data: lead } = await supabase.from("contact_leads").select("site_id").eq("id", input.data.leadId).maybeSingle<{ site_id: string }>();
  if (lead) {
    const { data: allowed } = await supabase.rpc("has_site_permission", { target_site_id: lead.site_id, permission_key: "update_leads" });
    if (allowed) await supabase.from("contact_leads").update({ status: input.data.status, is_read: input.data.isRead === "true" }).eq("id", input.data.leadId);
  }
  revalidatePath("/dashboard/leads");
  redirect("/dashboard/leads?message=Lead updated.");
}
