"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/access-control";
import { generateAiSuggestions } from "@/lib/ai/content-generator";
import { isAiAvailable } from "@/lib/ai/provider";
import { aiActionSchema, aiProfileFormSchema, aiSuggestionIdSchema, promptAdminSchema, usageLimitAdminSchema } from "@/lib/ai/schemas";
import { listFromTextarea } from "@/lib/ai/safety";
import { requireAdmin } from "@/lib/data";
import { loadEditorContext, mergeObjects } from "@/lib/site-editor/editor-loader";
import { getSectionSchema } from "@/lib/site-renderer/section-schemas";
import { requireSiteSetup } from "@/lib/setup";
import type { AiContentSuggestion, AiSiteProfile, SitePermission } from "@/lib/types";

function formValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function formValues(formData: FormData, key: string) {
  return formData.getAll(key).map(String).filter(Boolean);
}

function aiBase(siteId: string, isClient: boolean) {
  return isClient ? `/client/websites/${siteId}` : `/dashboard/websites/${siteId}`;
}

async function requireAiEditableSite(siteId: string, permission: SitePermission = "edit_content") {
  const setup = await requireSiteSetup(siteId);
  if (!hasPermission(setup.siteAccess, permission, setup.membershipRole)) {
    redirect(`${aiBase(siteId, Boolean(setup.siteAccess))}/ai-suggestions?error=Your access can preview AI suggestions, but cannot create or apply them.`);
  }
  return setup;
}

async function loadPromptTemplate(supabase: Awaited<ReturnType<typeof requireSiteSetup>>["supabase"], key: string) {
  const { data } = await supabase.from("ai_prompt_versions").select("prompt_template").eq("key", key).eq("is_active", true).order("version", { ascending: false }).limit(1).maybeSingle<{ prompt_template: string }>();
  return data?.prompt_template ?? null;
}

export async function saveAiProfileAction(formData: FormData) {
  const input = aiProfileFormSchema.safeParse({
    siteId: formValue(formData, "siteId"),
    businessName: formValue(formData, "businessName"),
    businessType: formValue(formData, "businessType"),
    industry: formValue(formData, "industry"),
    targetAudience: formValue(formData, "targetAudience"),
    primaryLocation: formValue(formData, "primaryLocation"),
    serviceAreas: formValue(formData, "serviceAreas"),
    services: formValue(formData, "services"),
    uniqueSellingPoints: formValue(formData, "uniqueSellingPoints"),
    tone: formValue(formData, "tone"),
    preferredLanguage: formValue(formData, "preferredLanguage"),
    additionalLanguages: formValues(formData, "additionalLanguages"),
    primaryGoal: formValue(formData, "primaryGoal"),
    ctaPreference: formValue(formData, "ctaPreference"),
    contactPreference: formValue(formData, "contactPreference"),
    specialNotes: formValue(formData, "specialNotes")
  });
  if (!input.success) redirect(`/dashboard/websites?error=${encodeURIComponent(input.error.errors[0].message)}`);
  const setup = await requireAiEditableSite(input.data.siteId);
  const base = aiBase(setup.site.id, Boolean(setup.siteAccess));
  const { error } = await setup.supabase.from("ai_site_profiles").upsert(
    {
      site_id: setup.site.id,
      business_name: input.data.businessName,
      business_type: input.data.businessType || null,
      industry: input.data.industry || null,
      target_audience: input.data.targetAudience || null,
      primary_location: input.data.primaryLocation || null,
      service_areas: listFromTextarea(input.data.serviceAreas),
      services: listFromTextarea(input.data.services),
      unique_selling_points: listFromTextarea(input.data.uniqueSellingPoints),
      tone: input.data.tone,
      preferred_language: input.data.preferredLanguage,
      additional_languages: input.data.additionalLanguages,
      primary_goal: input.data.primaryGoal || null,
      cta_preference: input.data.ctaPreference || null,
      contact_preference: input.data.contactPreference || null,
      special_notes: input.data.specialNotes || null,
      created_by: setup.user.id
    },
    { onConflict: "site_id" }
  );
  if (error) redirect(`${base}/ai-setup?error=Could not save AI setup profile.`);
  revalidatePath(base);
  redirect(`${base}/ai-setup?message=AI setup profile saved.`);
}

export async function generateSiteAiSuggestionsAction(formData: FormData) {
  const siteId = formValue(formData, "siteId");
  const setup = await requireAiEditableSite(siteId);
  const base = aiBase(setup.site.id, Boolean(setup.siteAccess));
  if (!isAiAvailable()) redirect(`${base}/ai-setup?error=AI is not configured. Use mock mode locally or add a server-side provider key.`);
  const { data: profile } = await setup.supabase.from("ai_site_profiles").select("*").eq("site_id", setup.site.id).maybeSingle<AiSiteProfile>();
  const context = await loadEditorContext(setup.supabase, setup.site.id, true);
  const promptTemplate = await loadPromptTemplate(setup.supabase, "full_site_content");
  try {
    await generateAiSuggestions({
      supabase: setup.supabase,
      siteId: setup.site.id,
      userId: setup.user.id,
      requestType: "full_site_content",
      profile: profile ?? null,
      payload: { site: setup.site, currentProfile: context.businessProfile, sections: context.previewResult.status === "ready" ? context.previewResult.preview.sections.map((section) => section.section_key) : [] },
      promptTemplate
    });
  } catch {
    redirect(`${base}/ai-setup?error=AI could not create safe structured suggestions. Try again later or continue manually.`);
  }
  revalidatePath(`${base}/ai-suggestions`);
  redirect(`${base}/ai-suggestions?message=AI suggestions are ready for review.`);
}

export async function generateFieldAiSuggestionAction(formData: FormData) {
  const input = aiActionSchema.safeParse({
    siteId: formValue(formData, "siteId"),
    requestType: formValue(formData, "requestType"),
    sectionKey: formValue(formData, "sectionKey") || undefined,
    fieldKey: formValue(formData, "fieldKey"),
    currentValue: formValue(formData, "currentValue"),
    language: formValue(formData, "language") || undefined,
    instruction: formValue(formData, "instruction") || undefined
  });
  if (!input.success) redirect(`/dashboard/websites?error=${encodeURIComponent(input.error.errors[0].message)}`);
  const setup = await requireAiEditableSite(input.data.siteId);
  const base = aiBase(setup.site.id, Boolean(setup.siteAccess));
  if (!isAiAvailable()) redirect(`${base}/editor/content?error=AI is not configured. Use mock mode locally or add a server-side provider key.`);
  const { data: profile } = await setup.supabase.from("ai_site_profiles").select("*").eq("site_id", setup.site.id).maybeSingle<AiSiteProfile>();
  const promptTemplate = await loadPromptTemplate(setup.supabase, input.data.requestType);
  try {
    await generateAiSuggestions({
      supabase: setup.supabase,
      siteId: setup.site.id,
      userId: setup.user.id,
      requestType: input.data.requestType,
      profile: profile ?? null,
      payload: input.data,
      promptTemplate
    });
  } catch {
    redirect(`${base}/editor/content?error=AI could not create a safe suggestion for that field.`);
  }
  revalidatePath(`${base}/ai-suggestions`);
  redirect(`${base}/ai-suggestions?message=Field suggestion created.`);
}

export async function regenerateAiSuggestionAction(formData: FormData) {
  const input = aiSuggestionIdSchema.safeParse({ siteId: formValue(formData, "siteId"), suggestionId: formValue(formData, "suggestionId") });
  if (!input.success) redirect("/dashboard/websites?error=Could not regenerate suggestion.");
  const setup = await requireAiEditableSite(input.data.siteId);
  const base = aiBase(setup.site.id, Boolean(setup.siteAccess));
  if (!isAiAvailable()) redirect(`${base}/ai-suggestions?error=AI is not configured. Use mock mode locally or add a server-side provider key.`);
  const { data: suggestion } = await setup.supabase
    .from("ai_content_suggestions")
    .select("*")
    .eq("site_id", setup.site.id)
    .eq("id", input.data.suggestionId)
    .maybeSingle<AiContentSuggestion>();
  if (!suggestion) redirect(`${base}/ai-suggestions?error=Suggestion is no longer available.`);
  if (!["business_profile", "section_field", "seo", "translation"].includes(suggestion.suggestion_type)) {
    redirect(`${base}/ai-suggestions?error=This suggestion is review-only. Generate website content suggestions to refresh recommendations and image guidance.`);
  }
  const { data: profile } = await setup.supabase.from("ai_site_profiles").select("*").eq("site_id", setup.site.id).maybeSingle<AiSiteProfile>();
  const requestType = suggestion.suggestion_type === "translation" ? "translation" : suggestion.suggestion_type === "seo" ? "seo_suggestion" : "rewrite";
  const promptTemplate = await loadPromptTemplate(setup.supabase, requestType);
  try {
    await generateAiSuggestions({
      supabase: setup.supabase,
      siteId: setup.site.id,
      userId: setup.user.id,
      requestType,
      profile: profile ?? null,
      payload: {
        sectionKey: suggestion.section_key ?? undefined,
        fieldKey: suggestion.field_key,
        currentValue: typeof suggestion.original_value === "string" ? suggestion.original_value : typeof suggestion.suggested_value === "string" ? suggestion.suggested_value : JSON.stringify(suggestion.suggested_value ?? ""),
        language: suggestion.language,
        instruction: "Regenerate a fresh alternative suggestion."
      },
      promptTemplate
    });
  } catch {
    redirect(`${base}/ai-suggestions?error=AI could not regenerate a safe suggestion.`);
  }
  revalidatePath(`${base}/ai-suggestions`);
  redirect(`${base}/ai-suggestions?message=Suggestion regenerated.`);
}

function setNestedValue(base: Record<string, unknown>, fieldKey: string, value: unknown) {
  const parts = fieldKey.split(".");
  if (parts.length === 1) return { ...base, [fieldKey]: value };
  const [first, second] = parts;
  const nested = base[first] && typeof base[first] === "object" && !Array.isArray(base[first]) ? { ...(base[first] as Record<string, unknown>) } : {};
  return { ...base, [first]: { ...nested, [second]: value } };
}

const businessProfileSuggestionFields = new Set(["company_name", "tagline", "short_description", "full_description"]);
const seoSuggestionFields = new Set(["seo_title", "seo_description", "seo_keywords", "og_title", "og_description"]);

export async function applyAiSuggestionAction(formData: FormData) {
  const input = aiSuggestionIdSchema.safeParse({ siteId: formValue(formData, "siteId"), suggestionId: formValue(formData, "suggestionId") });
  if (!input.success) redirect("/dashboard/websites?error=Could not apply suggestion.");
  const setup = await requireAiEditableSite(input.data.siteId);
  const base = aiBase(setup.site.id, Boolean(setup.siteAccess));
  const { data: suggestion } = await setup.supabase
    .from("ai_content_suggestions")
    .select("*")
    .eq("site_id", setup.site.id)
    .eq("id", input.data.suggestionId)
    .maybeSingle<AiContentSuggestion>();
  if (!suggestion || !["pending", "approved"].includes(suggestion.status)) redirect(`${base}/ai-suggestions?error=Suggestion is no longer available.`);

  if (suggestion.suggestion_type === "business_profile") {
    if (!businessProfileSuggestionFields.has(suggestion.field_key)) redirect(`${base}/ai-suggestions?error=Suggestion targets an unsupported business profile field.`);
    await setup.supabase.from("site_business_profiles").upsert({ site_id: setup.site.id, [suggestion.field_key]: suggestion.suggested_value }, { onConflict: "site_id" });
  } else if (suggestion.suggestion_type === "seo") {
    if (!seoSuggestionFields.has(suggestion.field_key)) redirect(`${base}/ai-suggestions?error=Suggestion targets an unsupported SEO field.`);
    await setup.supabase.from("sites").update({ [suggestion.field_key]: suggestion.suggested_value }).eq("id", setup.site.id);
  } else if (suggestion.suggestion_type === "section_field" || suggestion.suggestion_type === "translation") {
    if (!suggestion.section_key) redirect(`${base}/ai-suggestions?error=Suggestion is missing a section.`);
    const context = await loadEditorContext(setup.supabase, setup.site.id, true);
    const section = context.previewResult.status === "ready" ? context.previewResult.preview.sections.find((item) => item.section_key === suggestion.section_key) : null;
    if (!section) redirect(`${base}/ai-suggestions?error=The suggested section is not available in this template.`);
    const override = context.sectionOverrides.find((item) => item.template_section_id === section.id);
    const nextContent = setNestedValue((override?.content_override as Record<string, unknown>) ?? {}, suggestion.field_key, suggestion.suggested_value);
    const merged = mergeObjects(section.default_content, nextContent);
    if (!getSectionSchema(section.section_key)?.safeParse(merged).success) redirect(`${base}/ai-suggestions?error=Suggestion does not fit the approved section schema.`);
    await setup.supabase.from("site_section_overrides").upsert(
      {
        site_id: setup.site.id,
        template_section_id: section.id,
        content_override: nextContent,
        settings_override: override?.settings_override ?? {},
        is_enabled: true,
        display_order: override?.display_order ?? section.display_order,
        created_by: setup.user.id
      },
      { onConflict: "site_id,template_section_id" }
    );
  } else {
    redirect(`${base}/ai-suggestions?error=This suggestion is review-only and cannot be applied directly.`);
  }

  await setup.supabase
    .from("ai_content_suggestions")
    .update({ status: "applied", applied_by: setup.user.id, applied_at: new Date().toISOString() })
    .eq("id", suggestion.id)
    .eq("site_id", setup.site.id);
  revalidatePath(base);
  redirect(`${base}/ai-suggestions?message=Suggestion applied.`);
}

export async function rejectAiSuggestionAction(formData: FormData) {
  const input = aiSuggestionIdSchema.safeParse({ siteId: formValue(formData, "siteId"), suggestionId: formValue(formData, "suggestionId") });
  if (!input.success) redirect("/dashboard/websites?error=Could not reject suggestion.");
  const setup = await requireAiEditableSite(input.data.siteId);
  const base = aiBase(setup.site.id, Boolean(setup.siteAccess));
  await setup.supabase.from("ai_content_suggestions").update({ status: "rejected" }).eq("site_id", setup.site.id).eq("id", input.data.suggestionId);
  revalidatePath(`${base}/ai-suggestions`);
  redirect(`${base}/ai-suggestions?message=Suggestion rejected.`);
}

export async function updatePromptVersionAction(formData: FormData) {
  const input = promptAdminSchema.safeParse({
    id: formValue(formData, "id"),
    purpose: formValue(formData, "purpose"),
    promptTemplate: formValue(formData, "promptTemplate"),
    isActive: formData.get("isActive") === "on" ? "on" : "off"
  });
  if (!input.success) redirect(`/admin/ai/prompts?error=${encodeURIComponent(input.error.errors[0].message)}`);
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("ai_prompt_versions").update({ purpose: input.data.purpose, prompt_template: input.data.promptTemplate, is_active: input.data.isActive === "on" }).eq("id", input.data.id);
  if (error) redirect("/admin/ai/prompts?error=Could not update prompt version.");
  revalidatePath("/admin/ai/prompts");
  redirect("/admin/ai/prompts?message=Prompt version updated.");
}

export async function updateUsageLimitAction(formData: FormData) {
  const input = usageLimitAdminSchema.safeParse({
    id: formValue(formData, "id"),
    requestLimit: formValue(formData, "requestLimit"),
    tokenLimit: formValue(formData, "tokenLimit")
  });
  if (!input.success) redirect(`/admin/ai/usage?error=${encodeURIComponent(input.error.errors[0].message)}`);
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("ai_usage_limits").update({ request_limit: input.data.requestLimit, token_limit: input.data.tokenLimit }).eq("id", input.data.id);
  if (error) redirect("/admin/ai/usage?error=Could not update usage limit.");
  revalidatePath("/admin/ai/usage");
  redirect("/admin/ai/usage?message=Usage limit updated.");
}
