"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/access-control";
import { parseGoogleVerificationTag } from "@/lib/publishing/google-verification";
import { sanitizeDeveloperCode } from "@/lib/security/custom-code";
import { requireSiteSetup } from "@/lib/setup";
import sharp from "sharp";

function value(formData: FormData, key: string) { return String(formData.get(key) ?? ""); }

export async function saveBrandingSettingsAction(formData: FormData) {
  const siteId = value(formData, "siteId");
  const setup = await requireSiteSetup(siteId);
  if (!hasPermission(setup.siteAccess, "edit_design", setup.membershipRole)) redirect(`/dashboard/websites/${siteId}`);
  const logoAlignment = value(formData, "logoAlignment") === "center" ? "center" : "left";
  const useLogoColors = formData.get("useLogoColors") === "on";
  const { error } = await setup.supabase.from("site_branding_settings").upsert({
    site_id: siteId,
    use_logo_colors: useLogoColors,
    show_business_name_fallback: formData.get("showBusinessNameFallback") === "on",
    logo_alignment: logoAlignment,
    created_by: setup.user.id
  }, { onConflict: "site_id" });
  if (error) redirect(`/dashboard/websites/${siteId}/settings/branding?error=${encodeURIComponent(error.message)}`);
  if (useLogoColors) {
    const { data: logo } = await setup.supabase.from("site_media").select("storage_path").eq("site_id", siteId).eq("usage_type", "logo").order("created_at", { ascending: false }).limit(1).maybeSingle<{ storage_path: string }>();
    if (logo) {
      const { data: file } = await setup.supabase.storage.from("site-media").download(logo.storage_path);
      if (file) {
        const stats = await sharp(Buffer.from(await file.arrayBuffer())).resize(96, 96, { fit: "inside" }).stats();
        const { r, g, b } = stats.dominant;
        const primary = `#${[r, g, b].map((part) => part.toString(16).padStart(2, "0")).join("")}`;
        await setup.supabase.from("site_theme_overrides").upsert({ site_id: siteId, primary_color: primary }, { onConflict: "site_id" });
      }
    }
  }
  revalidatePath(`/dashboard/websites/${siteId}`);
  redirect(`/dashboard/websites/${siteId}/settings/branding?message=Branding settings saved.`);
}

export async function saveGoogleVerificationAction(formData: FormData) {
  const siteId = value(formData, "siteId");
  const setup = await requireSiteSetup(siteId);
  if (!hasPermission(setup.siteAccess, "edit_content", setup.membershipRole)) redirect(`/dashboard/websites/${siteId}`);
  const raw = value(formData, "googleVerificationTag");
  const token = raw ? parseGoogleVerificationTag(raw) : null;
  if (raw && !token) redirect(`/dashboard/websites/${siteId}/seo?error=Paste the full Google verification meta tag.`);
  const { error } = await setup.supabase.from("sites").update({ google_verification_token: token }).eq("id", siteId);
  if (error) redirect(`/dashboard/websites/${siteId}/seo?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/sites/${setup.site.primary_subdomain || setup.site.slug}`);
  redirect(`/dashboard/websites/${siteId}/seo?message=Google verification saved.`);
}

export async function saveDeveloperCodeAction(formData: FormData) {
  const siteId = value(formData, "siteId");
  const setup = await requireSiteSetup(siteId);
  const allowed = ["owner", "admin"].includes(setup.membershipRole ?? "") || ["agency_owner", "agency_admin", "developer"].includes(setup.siteAccess?.access_role ?? "");
  if (!allowed) redirect(`/dashboard/websites/${siteId}/settings`);
  try {
    const header = sanitizeDeveloperCode(value(formData, "customHeaderCode"));
    const footer = sanitizeDeveloperCode(value(formData, "customFooterCode"));
    const { data: current } = await setup.supabase.from("site_developer_settings").select("version_number").eq("site_id", siteId).maybeSingle<{ version_number: number }>();
    const version = (current?.version_number ?? 0) + 1;
    const { error } = await setup.supabase.from("site_developer_settings").upsert({ site_id: siteId, custom_header_code: header || null, custom_footer_code: footer || null, version_number: version, updated_by: setup.user.id }, { onConflict: "site_id" });
    if (error) throw error;
    await setup.supabase.from("site_developer_setting_versions").insert({ site_id: siteId, version_number: version, custom_header_code: header || null, custom_footer_code: footer || null, created_by: setup.user.id });
    await setup.supabase.from("site_activity_logs").insert({ site_id: siteId, actor_user_id: setup.user.id, action_type: "developer_code_updated", action_summary: "Updated custom header or footer code", metadata: { version } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save custom code.";
    redirect(`/dashboard/websites/${siteId}/settings/advanced?error=${encodeURIComponent(message)}`);
  }
  redirect(`/dashboard/websites/${siteId}/settings/advanced?message=Advanced code saved as a new version.`);
}

export async function rollbackDeveloperCodeAction(formData: FormData) {
  const siteId = value(formData, "siteId");
  const versionId = value(formData, "versionId");
  const setup = await requireSiteSetup(siteId);
  const allowed = ["owner", "admin"].includes(setup.membershipRole ?? "") || ["agency_owner", "agency_admin", "developer"].includes(setup.siteAccess?.access_role ?? "");
  if (!allowed) redirect(`/dashboard/websites/${siteId}/settings`);
  const { data: version } = await setup.supabase.from("site_developer_setting_versions").select("*").eq("id", versionId).eq("site_id", siteId).maybeSingle<{ custom_header_code: string | null; custom_footer_code: string | null }>();
  if (!version) redirect(`/dashboard/websites/${siteId}/settings/advanced?error=Version not found.`);
  const { data: current } = await setup.supabase.from("site_developer_settings").select("version_number").eq("site_id", siteId).maybeSingle<{ version_number: number }>();
  const nextVersion = (current?.version_number ?? 0) + 1;
  await setup.supabase.from("site_developer_settings").upsert({ site_id: siteId, custom_header_code: version.custom_header_code, custom_footer_code: version.custom_footer_code, version_number: nextVersion, updated_by: setup.user.id }, { onConflict: "site_id" });
  await setup.supabase.from("site_developer_setting_versions").insert({ site_id: siteId, version_number: nextVersion, custom_header_code: version.custom_header_code, custom_footer_code: version.custom_footer_code, created_by: setup.user.id });
  await setup.supabase.from("site_activity_logs").insert({ site_id: siteId, actor_user_id: setup.user.id, action_type: "developer_code_rolled_back", action_summary: "Rolled back custom code", metadata: { version: nextVersion, sourceVersionId: versionId } });
  redirect(`/dashboard/websites/${siteId}/settings/advanced?message=Custom code rolled back as version ${nextVersion}.`);
}
