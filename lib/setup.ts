import { redirect } from "next/navigation";
import { requireDashboardContext, requireUser } from "@/lib/data";
import type {
  BusinessCategory,
  Industry,
  Organization,
  Profile,
  SetupStep,
  Site,
  SiteAccessMember,
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
  const { data: memberships } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  const membership = memberships?.[0];
  let organization = membership?.organizations as Organization | null | undefined;
  let membershipRole = membership?.role as string | undefined;
  const { data: orgSites } = organization
    ? await supabase.from("sites").select("*").eq("organization_id", organization.id).order("updated_at", { ascending: false }).returns<Site[]>()
    : { data: [] as Site[] };
  let site = (orgSites ?? []).find((item) => item.id === siteId) as Site | undefined;
  let siteAccess: SiteAccessMember | null = null;

  if (!site) {
    const { data: access } = await supabase
      .from("site_access_members")
      .select("*")
      .eq("site_id", siteId)
      .eq("user_id", user.id)
      .maybeSingle<SiteAccessMember>();
    if (access) {
      const { data: accessibleSite } = await supabase.from("sites").select("*").eq("id", siteId).maybeSingle<Site>();
      site = accessibleSite ?? undefined;
      siteAccess = access;
      if (site && !organization) {
        organization = {
          id: site.organization_id,
          name: "Website owner",
          slug: "website-owner",
          country_code: site.country_code,
          default_currency: "USD",
          timezone: "Asia/Dubai",
          created_by: site.created_by,
          created_at: site.created_at,
          updated_at: site.updated_at
        };
        membershipRole = undefined;
      }
    }
  }

  if (!site) redirect("/dashboard/websites");

  const { data: selection } = await supabase
    .from("site_template_selections")
    .select("*")
    .eq("site_id", site.id)
    .maybeSingle<SiteTemplateSelection>();

  if (!organization) redirect("/dashboard/websites");
  return { supabase, user, profile, organization, membershipRole, sites: orgSites ?? [], site: site as Site, selection, siteAccess };
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
