"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRecommendedTemplateForCategory, requireSiteSetup, setupPath } from "@/lib/setup";
import {
  categoryStepSchema,
  industryStepSchema,
  templateSelectionSchema,
  websiteTypeStepSchema
} from "@/lib/validators/template-discovery";

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function chooseWebsiteTypeAction(formData: FormData) {
  const input = websiteTypeStepSchema.safeParse({
    siteId: str(formData, "siteId"),
    websiteType: str(formData, "websiteType")
  });
  if (!input.success) redirect("/dashboard/websites?error=Choose a supported website type.");

  const { supabase, site } = await requireSiteSetup(input.data.siteId);
  const { error } = await supabase
    .from("sites")
    .update({ website_type: input.data.websiteType, setup_step: "industry" })
    .eq("id", site.id);
  if (error) redirect(`${setupPath(site.id, "website_type")}?error=Could not save the website type.`);

  revalidatePath("/dashboard");
  redirect(setupPath(site.id, "industry"));
}

export async function chooseIndustryAction(formData: FormData) {
  const input = industryStepSchema.safeParse({
    siteId: str(formData, "siteId"),
    industryId: str(formData, "industryId")
  });
  if (!input.success) redirect("/dashboard/websites?error=Choose an industry.");

  const { supabase, site, selection, user } = await requireSiteSetup(input.data.siteId);
  const { data: industry } = await supabase.from("industries").select("id").eq("id", input.data.industryId).eq("is_active", true).maybeSingle();
  if (!industry) redirect(`${setupPath(site.id, "industry")}?error=Choose an active industry.`);

  await supabase.from("site_template_selections").upsert(
    {
      site_id: site.id,
      industry_id: input.data.industryId,
      business_category_id: selection?.industry_id === input.data.industryId ? selection?.business_category_id : null,
      template_id: selection?.industry_id === input.data.industryId ? selection?.template_id : null,
      selected_by: user.id
    },
    { onConflict: "site_id" }
  );

  const { error } = await supabase.from("sites").update({ setup_step: "business_category" }).eq("id", site.id);
  if (error) redirect(`${setupPath(site.id, "industry")}?error=Could not save the industry.`);

  revalidatePath("/dashboard");
  redirect(setupPath(site.id, "business_category") + `?industry=${input.data.industryId}`);
}

export async function chooseCategoryAction(formData: FormData) {
  const input = categoryStepSchema.safeParse({
    siteId: str(formData, "siteId"),
    categoryId: str(formData, "categoryId")
  });
  if (!input.success) redirect("/dashboard/websites?error=Choose a business category.");

  const { supabase, site, user } = await requireSiteSetup(input.data.siteId);
  const recommendation = await getRecommendedTemplateForCategory(supabase, input.data.categoryId);
  if (!recommendation?.category) redirect(`${setupPath(site.id, "business_category")}?error=Choose an active business category.`);
  const { category, template } = recommendation;

  await supabase.from("site_template_selections").upsert(
    {
      site_id: site.id,
      industry_id: category.industry_id,
      business_category_id: category.id,
      template_id: template?.id ?? null,
      selected_by: user.id
    },
    { onConflict: "site_id" }
  );

  const nextStep = template ? "template_selected" : "template";
  const { error } = await supabase
    .from("sites")
    .update({
      setup_step: nextStep,
      setup_completed_at: template ? new Date().toISOString() : null
    })
    .eq("id", site.id);
  if (error) redirect(`${setupPath(site.id, "business_category")}?error=Could not save the category.`);

  revalidatePath("/dashboard");
  redirect(template ? setupPath(site.id, "template_selected") : setupPath(site.id, "template") + `?category=${category.id}`);
}

export async function selectTemplateAction(formData: FormData) {
  const input = templateSelectionSchema.safeParse({
    siteId: str(formData, "siteId"),
    templateId: str(formData, "templateId")
  });
  if (!input.success) redirect("/dashboard/websites?error=Choose a template.");

  const { supabase, site, user } = await requireSiteSetup(input.data.siteId);
  const categoryId = str(formData, "categoryId");
  const { data: category } = await supabase
    .from("business_categories")
    .select("id, industry_id")
    .eq("id", categoryId)
    .eq("is_active", true)
    .maybeSingle<{ id: string; industry_id: string }>();
  if (!category) redirect(`${setupPath(site.id, "business_category")}?error=Choose a business category before selecting a template.`);

  const { data: mapping } = await supabase
    .from("template_categories")
    .select("id, templates!inner(id, is_active)")
    .eq("business_category_id", category.id)
    .eq("template_id", input.data.templateId)
    .maybeSingle();
  if (!mapping) redirect(`${setupPath(site.id, "template")}?category=${category.id}&error=Choose an active template for this category.`);

  const { error } = await supabase.from("site_template_selections").upsert(
    {
      site_id: site.id,
      industry_id: category.industry_id,
      business_category_id: category.id,
      template_id: input.data.templateId,
      selected_by: user.id
    },
    { onConflict: "site_id" }
  );
  if (error) redirect(`${setupPath(site.id, "template")}?category=${category.id}&error=Could not save the template selection.`);

  await supabase.from("sites").update({ setup_step: "content", setup_completed_at: new Date().toISOString() }).eq("id", site.id);
  revalidatePath("/dashboard");
  redirect(setupPath(site.id, "template_selected"));
}

export async function prepareRecommendedDesignAction(formData: FormData) {
  const siteId = str(formData, "siteId");
  const categoryId = str(formData, "categoryId");
  const input = categoryStepSchema.safeParse({ siteId, categoryId });
  if (!input.success) redirect("/dashboard/websites?error=Could not prepare the recommended design.");

  const { supabase, site, user } = await requireSiteSetup(input.data.siteId);
  const recommendation = await getRecommendedTemplateForCategory(supabase, input.data.categoryId);
  if (!recommendation?.category || !recommendation.template) {
    // No specific recommendation found — send user to browse all available designs
    redirect(`/dashboard/websites/${site.id}/setup/templates${input.data.categoryId ? `?category=${input.data.categoryId}` : ""}`);
  }

  const { category, template } = recommendation;
  const { error } = await supabase.from("site_template_selections").upsert(
    {
      site_id: site.id,
      industry_id: category.industry_id,
      business_category_id: category.id,
      template_id: template.id,
      selected_by: user.id
    },
    { onConflict: "site_id" }
  );
  if (error) redirect("/dashboard/websites?error=Could not prepare the recommended design.");

  await supabase
    .from("sites")
    .update({ setup_step: "template_selected", setup_completed_at: new Date().toISOString() })
    .eq("id", site.id);
  revalidatePath("/dashboard/websites");
  redirect(setupPath(site.id, "template_selected"));
}
