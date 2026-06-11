import { redirect } from "next/navigation";
import { requireDashboardContext, requireUser } from "@/lib/data";
import { getAccessibleSiteById, getAccessibleSitesForCurrentUser } from "@/lib/access-control";
import type {
  BusinessCategory,
  Industry,
  Profile,
  SetupStep,
  SiteTemplateSelection,
  Template,
  TemplateCategory,
  TemplatePage
} from "@/lib/types";

export const setupSteps: Array<{ key: SetupStep; label: string; hrefPart: string }> = [
  { key: "website_type", label: "Website Type", hrefPart: "type" },
  { key: "industry", label: "Industry", hrefPart: "industry" },
  { key: "business_category", label: "Business Category", hrefPart: "category" },
  { key: "template", label: "Choose Template", hrefPart: "templates" },
  { key: "template_selected", label: "Template Selected", hrefPart: "complete" },
  { key: "content", label: "Business Details", hrefPart: "content" }
];

export function setupPath(siteId: string, step: SetupStep) {
  if (step === "content") return `/dashboard/websites/${siteId}/editor`;
  const item = setupSteps.find((setupStep) => setupStep.key === step) ?? setupSteps[0];
  return `/dashboard/websites/${siteId}/setup/${item.hrefPart}`;
}

export async function requireSiteSetup(siteId: string) {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>();

  const accessContext = await getAccessibleSiteById(supabase, user.id, siteId);
  if (!accessContext) {
    redirect("/dashboard/websites");
  }

  const { site, organization, membershipRole, siteAccess } = accessContext;

  const { data: selection } = await supabase
    .from("site_template_selections")
    .select("*")
    .eq("site_id", site.id)
    .maybeSingle<SiteTemplateSelection>();

  const allAccessible = await getAccessibleSitesForCurrentUser(supabase, user.id);
  const sites = allAccessible.map((item) => item.site);

  return {
    supabase,
    user,
    profile,
    organization,
    membershipRole,
    sites,
    site,
    selection,
    siteAccess
  };
}

export async function getIndustries(supabase: Awaited<ReturnType<typeof requireDashboardContext>>["supabase"], includeInactive = false) {
  let query = supabase.from("industries").select("*").order("display_order", { ascending: true }).order("name", { ascending: true });
  if (!includeInactive) query = query.eq("is_active", true);
  const { data } = await query.returns<Industry[]>();
  return data ?? [];
}

export async function getCategories(
  supabase: Awaited<ReturnType<typeof requireDashboardContext>>["supabase"],
  industryId?: string,
  includeInactive = false
) {
  let query = supabase.from("business_categories").select("*").order("display_order", { ascending: true }).order("name", { ascending: true });
  if (industryId) query = query.eq("industry_id", industryId);
  if (!includeInactive) query = query.eq("is_active", true);
  const { data } = await query.returns<BusinessCategory[]>();
  return data ?? [];
}

export async function getTemplatePages(supabase: Awaited<ReturnType<typeof requireDashboardContext>>["supabase"], templateIds: string[]) {
  if (!templateIds.length) return [] as TemplatePage[];
  const { data } = await supabase
    .from("template_pages")
    .select("*")
    .in("template_id", templateIds)
    .order("display_order", { ascending: true })
    .returns<TemplatePage[]>();
  return data ?? [];
}

export async function getTemplatesForCategory(
  supabase: Awaited<ReturnType<typeof requireDashboardContext>>["supabase"],
  categoryId: string,
  options: { search?: string; style?: string; featuredOnly?: boolean } = {}
) {
  const { data: mappings } = await supabase
    .from("template_categories")
    .select("*")
    .eq("business_category_id", categoryId)
    .returns<TemplateCategory[]>();
  const templateIds = [...new Set((mappings ?? []).map((mapping) => mapping.template_id))];
  if (!templateIds.length) return { templates: [] as Template[], pages: [] as TemplatePage[] };

  let query = supabase.from("templates").select("*").in("id", templateIds).eq("is_active", true).order("display_order", { ascending: true });
  if (options.search) query = query.ilike("name", `%${options.search}%`);
  if (options.style) query = query.eq("style_label", options.style);
  if (options.featuredOnly) query = query.eq("is_featured", true);

  const { data } = await query.returns<Template[]>();
  const templates = data ?? [];
  const pages = await getTemplatePages(
    supabase,
    templates.map((template) => template.id)
  );
  return { templates, pages };
}

export async function getTemplateById(supabase: Awaited<ReturnType<typeof requireDashboardContext>>["supabase"], templateId: string) {
  const { data: template } = await supabase.from("templates").select("*").eq("id", templateId).eq("is_active", true).maybeSingle<Template>();
  const pages = template ? await getTemplatePages(supabase, [template.id]) : [];
  return { template, pages };
}

export async function getRecommendedTemplateForCategory(
  supabase: Awaited<ReturnType<typeof requireDashboardContext>>["supabase"],
  categoryId: string
) {
  const { data: category } = await supabase
    .from("business_categories")
    .select("id, industry_id, default_template_id")
    .eq("id", categoryId)
    .eq("is_active", true)
    .maybeSingle<{ id: string; industry_id: string; default_template_id: string | null }>();

  if (!category) return null;

  if (category.default_template_id) {
    const { data: template } = await supabase
      .from("templates")
      .select("*")
      .eq("id", category.default_template_id)
      .eq("is_active", true)
      .maybeSingle<Template>();
    if (template) return { category, template };
  }

  const { data: industry } = await supabase
    .from("industries")
    .select("id, default_template_id")
    .eq("id", category.industry_id)
    .eq("is_active", true)
    .maybeSingle<{ id: string; default_template_id: string | null }>();

  if (industry?.default_template_id) {
    const { data: template } = await supabase
      .from("templates")
      .select("*")
      .eq("id", industry.default_template_id)
      .eq("is_active", true)
      .maybeSingle<Template>();
    if (template) return { category, template };
  }

  const { templates } = await getTemplatesForCategory(supabase, category.id, { featuredOnly: true });
  if (templates[0]) return { category, template: templates[0] };

  const fallback = await getTemplatesForCategory(supabase, category.id);
  return fallback.templates[0] ? { category, template: fallback.templates[0] } : { category, template: null };
}
