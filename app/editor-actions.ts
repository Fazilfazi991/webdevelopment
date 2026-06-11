"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSectionSchema } from "@/lib/site-renderer/section-schemas";
import { loadEditorContext, mergeObjects } from "@/lib/site-editor/editor-loader";
import { businessProfileSchema, mediaSchema, saveVersionSchema, sectionOverrideSchema, sectionStateSchema, themeOverrideSchema } from "@/lib/site-editor/schemas";
import { requireSiteSetup } from "@/lib/setup";
import { slugify } from "@/lib/utils";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function jsonList(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split("|").map((part) => part.trim());
      return href ? { label, href } : line;
    });
}

function sectionContentFromForm(formData: FormData) {
  const content: Record<string, unknown> = {};
  const simple = ["eyebrow", "title", "body", "companyName", "tagline", "phone", "email", "location", "formTitle", "quote", "name", "context"];
  simple.forEach((key) => {
    const fieldValue = value(formData, key);
    if (fieldValue) content[key] = fieldValue;
  });

  const primaryLabel = value(formData, "primaryActionLabel");
  const primaryHref = value(formData, "primaryActionHref");
  if (primaryLabel && primaryHref) content.primaryAction = { label: primaryLabel, href: primaryHref };

  const secondaryLabel = value(formData, "secondaryActionLabel");
  const secondaryHref = value(formData, "secondaryActionHref");
  if (secondaryLabel && secondaryHref) content.secondaryAction = { label: secondaryLabel, href: secondaryHref };

  const imageSrc = value(formData, "imageSrc");
  const imageAlt = value(formData, "imageAlt");
  if (imageSrc && imageAlt) content.image = { src: imageSrc, alt: imageAlt };

  const bullets = value(formData, "bullets");
  if (bullets) content.bullets = bullets.split("\n").map((item) => item.trim()).filter(Boolean);

  const proofPoints = value(formData, "proofPoints");
  if (proofPoints) content.proofPoints = proofPoints.split("\n").map((item) => item.trim()).filter(Boolean);

  const nav = value(formData, "nav");
  if (nav) content.nav = jsonList(nav).filter((item): item is { label: string; href: string } => typeof item === "object" && "href" in item);

  const links = value(formData, "links");
  if (links) content.links = jsonList(links).filter((item): item is { label: string; href: string } => typeof item === "object" && "href" in item);

  const items = value(formData, "items");
  if (items) {
    content.items = items
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [title, body] = line.split("|").map((part) => part.trim());
        return body ? { title, body } : { question: title, answer: "" };
      });
  }

  return content;
}

async function requireEditableSite(siteId: string) {
  const context = await requireSiteSetup(siteId);
  if (!["owner", "admin", "editor"].includes(context.membershipRole ?? "")) {
    redirect(`/dashboard/websites/${siteId}/editor?error=You can preview this website, but you cannot edit it.`);
  }
  return context;
}

export async function saveBusinessProfileAction(formData: FormData) {
  const input = businessProfileSchema.safeParse({
    siteId: value(formData, "siteId"),
    companyName: value(formData, "companyName"),
    tagline: value(formData, "tagline"),
    shortDescription: value(formData, "shortDescription"),
    fullDescription: value(formData, "fullDescription"),
    phone: value(formData, "phone"),
    whatsapp: value(formData, "whatsapp"),
    email: value(formData, "email"),
    addressLine1: value(formData, "addressLine1"),
    addressLine2: value(formData, "addressLine2"),
    city: value(formData, "city"),
    stateRegion: value(formData, "stateRegion"),
    countryCode: value(formData, "countryCode"),
    postalCode: value(formData, "postalCode"),
    mapEmbedUrl: value(formData, "mapEmbedUrl"),
    workingHours: value(formData, "workingHours"),
    socialLinks: value(formData, "socialLinks")
  });
  if (!input.success) redirect(`/dashboard/websites?error=${encodeURIComponent(input.error.errors[0].message)}`);

  const { supabase, site } = await requireEditableSite(input.data.siteId);
  const { error } = await supabase.from("site_business_profiles").upsert(
    {
      site_id: site.id,
      company_name: input.data.companyName,
      tagline: input.data.tagline || null,
      short_description: input.data.shortDescription || null,
      full_description: input.data.fullDescription || null,
      phone: input.data.phone || null,
      whatsapp: input.data.whatsapp || null,
      email: input.data.email || null,
      address_line_1: input.data.addressLine1 || null,
      address_line_2: input.data.addressLine2 || null,
      city: input.data.city || null,
      state_region: input.data.stateRegion || null,
      country_code: input.data.countryCode || null,
      postal_code: input.data.postalCode || null,
      map_embed_url: input.data.mapEmbedUrl || null,
      working_hours: input.data.workingHours ? input.data.workingHours.split("\n").filter(Boolean) : [],
      social_links: input.data.socialLinks ? jsonList(input.data.socialLinks) : []
    },
    { onConflict: "site_id" }
  );
  if (error) redirect(`/dashboard/websites/${site.id}/editor/content?error=Could not save business profile.`);
  await supabase.from("sites").update({ setup_step: "content" }).eq("id", site.id);
  revalidatePath(`/dashboard/websites/${site.id}`);
  redirect(`/dashboard/websites/${site.id}/editor/content?message=Business profile saved.`);
}

export async function saveThemeAction(formData: FormData) {
  const input = themeOverrideSchema.safeParse({
    siteId: value(formData, "siteId"),
    primaryColor: value(formData, "primaryColor"),
    secondaryColor: value(formData, "secondaryColor"),
    accentColor: value(formData, "accentColor"),
    fontPreset: value(formData, "fontPreset"),
    buttonStyle: value(formData, "buttonStyle"),
    radiusPreset: value(formData, "radiusPreset")
  });
  if (!input.success) redirect(`/dashboard/websites?error=${encodeURIComponent(input.error.errors[0].message)}`);
  const { supabase, site } = await requireEditableSite(input.data.siteId);
  const { error } = await supabase.from("site_theme_overrides").upsert(
    {
      site_id: site.id,
      primary_color: input.data.primaryColor,
      secondary_color: input.data.secondaryColor,
      accent_color: input.data.accentColor,
      font_preset: input.data.fontPreset,
      button_style: input.data.buttonStyle,
      radius_preset: input.data.radiusPreset
    },
    { onConflict: "site_id" }
  );
  if (error) redirect(`/dashboard/websites/${site.id}/editor/design?error=Could not save design settings.`);
  revalidatePath(`/dashboard/websites/${site.id}`);
  redirect(`/dashboard/websites/${site.id}/editor/design?message=Design settings saved.`);
}

export async function saveSectionContentAction(formData: FormData) {
  const input = sectionOverrideSchema.safeParse({
    siteId: value(formData, "siteId"),
    sectionId: value(formData, "sectionId"),
    sectionKey: value(formData, "sectionKey"),
    content: JSON.stringify(sectionContentFromForm(formData))
  });
  if (!input.success) redirect(`/dashboard/websites?error=${encodeURIComponent(input.error.errors[0].message)}`);
  const { supabase, site, user } = await requireEditableSite(input.data.siteId);
  const schema = getSectionSchema(input.data.sectionKey);
  const patch = sectionContentFromForm(formData);
  const current = await loadEditorContext(supabase, site.id, true);
  const section = current.previewResult.status === "ready" ? current.previewResult.preview.sections.find((item) => item.id === input.data.sectionId) : null;
  const merged = mergeObjects(section?.default_content, patch);
  if (!schema?.safeParse(merged).success) redirect(`/dashboard/websites/${site.id}/editor/content?error=Check the section fields and keep text within the suggested limits.`);

  const { error } = await supabase.from("site_section_overrides").upsert(
    {
      site_id: site.id,
      template_section_id: input.data.sectionId,
      content_override: patch,
      settings_override: {},
      is_enabled: true,
      display_order: section?.display_order ?? 0,
      created_by: user.id
    },
    { onConflict: "site_id,template_section_id" }
  );
  if (error) redirect(`/dashboard/websites/${site.id}/editor/content?error=Could not save section content.`);
  revalidatePath(`/dashboard/websites/${site.id}`);
  redirect(`/dashboard/websites/${site.id}/editor/content?message=Section saved.`);
}

export async function saveSectionStateAction(formData: FormData) {
  const input = sectionStateSchema.safeParse({
    siteId: value(formData, "siteId"),
    sectionId: value(formData, "sectionId"),
    isEnabled: value(formData, "isEnabled"),
    displayOrder: value(formData, "displayOrder"),
    isRequired: value(formData, "isRequired")
  });
  if (!input.success) redirect("/dashboard/websites?error=Could not update section.");
  if (input.data.isRequired === "true" && input.data.isEnabled === "false") {
    redirect(`/dashboard/websites/${input.data.siteId}/editor/sections?error=Required sections cannot be disabled.`);
  }
  const { supabase, site, user } = await requireEditableSite(input.data.siteId);
  const { error } = await supabase.from("site_section_overrides").upsert(
    {
      site_id: site.id,
      template_section_id: input.data.sectionId,
      is_enabled: input.data.isEnabled === "true",
      display_order: input.data.displayOrder,
      created_by: user.id
    },
    { onConflict: "site_id,template_section_id" }
  );
  if (error) redirect(`/dashboard/websites/${site.id}/editor/sections?error=Could not update section.`);
  revalidatePath(`/dashboard/websites/${site.id}`);
  redirect(`/dashboard/websites/${site.id}/editor/sections?message=Section updated.`);
}

export async function resetSectionAction(formData: FormData) {
  const siteId = value(formData, "siteId");
  const sectionId = value(formData, "sectionId");
  const { supabase, site } = await requireEditableSite(siteId);
  await supabase.from("site_section_overrides").delete().eq("site_id", site.id).eq("template_section_id", sectionId);
  revalidatePath(`/dashboard/websites/${site.id}`);
  redirect(`/dashboard/websites/${site.id}/editor/sections?message=Section reset.`);
}

export async function saveMediaMetadataAction(formData: FormData) {
  const input = mediaSchema.safeParse({
    siteId: value(formData, "siteId"),
    usageType: value(formData, "usageType"),
    fileName: value(formData, "fileName"),
    mimeType: value(formData, "mimeType"),
    fileSize: value(formData, "fileSize"),
    width: value(formData, "width") || undefined,
    height: value(formData, "height") || undefined,
    altText: value(formData, "altText")
  });
  if (!input.success) redirect(`/dashboard/websites?error=${encodeURIComponent(input.error.errors[0].message)}`);
  const { supabase, site, organization, user } = await requireEditableSite(input.data.siteId);
  const safeName = `${Date.now()}-${slugify(input.data.fileName.replace(/\.[^.]+$/, "")) || "image"}`;
  const storagePath = `organizations/${organization.id}/sites/${site.id}/${safeName}`;
  const { error } = await supabase.from("site_media").insert({
    site_id: site.id,
    organization_id: organization.id,
    storage_path: storagePath,
    file_name: input.data.fileName,
    mime_type: input.data.mimeType,
    file_size: input.data.fileSize,
    width: input.data.width ?? null,
    height: input.data.height ?? null,
    alt_text: input.data.altText ?? null,
    usage_type: input.data.usageType,
    created_by: user.id
  });
  if (error) redirect(`/dashboard/websites/${site.id}/editor/images?error=Could not save image metadata.`);
  revalidatePath(`/dashboard/websites/${site.id}`);
  redirect(`/dashboard/websites/${site.id}/editor/images?message=Image metadata saved. Upload the file to the matching private storage path.`);
}

export async function saveVersionAction(formData: FormData) {
  const input = saveVersionSchema.safeParse({ siteId: value(formData, "siteId") });
  if (!input.success) redirect("/dashboard/websites?error=Could not save version.");
  const { supabase, site, user } = await requireEditableSite(input.data.siteId);
  const context = await loadEditorContext(supabase, site.id, true);
  const { count } = await supabase.from("site_versions").select("id", { count: "exact", head: true }).eq("site_id", site.id);
  const { error } = await supabase.from("site_versions").insert({
    site_id: site.id,
    version_number: (count ?? 0) + 1,
    snapshot: context,
    created_by: user.id
  });
  if (error) redirect(`/dashboard/websites/${site.id}/editor?error=Could not save version.`);
  redirect(`/dashboard/websites/${site.id}/editor?message=Version saved.`);
}
