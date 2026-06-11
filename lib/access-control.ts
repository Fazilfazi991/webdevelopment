import { redirect } from "next/navigation";
import { requireUser } from "@/lib/data";
import type { Agency, AgencyMember, Organization, Site, SiteAccessMember, SiteAccessRole, SitePermission } from "@/lib/types";

type SupabaseServerClient = Awaited<ReturnType<typeof requireUser>>["supabase"];
type OrganizationMembership = {
  organization_id: string;
  role: string;
};

export const permissionPresets: Record<SiteAccessRole, Partial<Record<SitePermission, boolean>>> = {
  agency_owner: {
    edit_content: true,
    upload_media: true,
    edit_design: true,
    manage_sections: true,
    preview_site: true,
    publish_site: true,
    manage_domains: true,
    view_leads: true,
    update_leads: true,
    invite_users: true,
    transfer_ownership: true
  },
  agency_admin: {
    edit_content: true,
    upload_media: true,
    edit_design: true,
    manage_sections: true,
    preview_site: true,
    publish_site: true,
    manage_domains: true,
    view_leads: true,
    update_leads: true,
    invite_users: true,
    transfer_ownership: true
  },
  developer: {
    edit_content: true,
    upload_media: true,
    edit_design: true,
    manage_sections: true,
    preview_site: true,
    publish_site: true,
    view_leads: true
  },
  client_owner: {
    edit_content: true,
    upload_media: true,
    edit_design: true,
    manage_sections: true,
    preview_site: true,
    publish_site: true,
    manage_domains: true,
    view_leads: true,
    update_leads: true,
    invite_users: true,
    transfer_ownership: true
  },
  client_editor: {
    edit_content: true,
    upload_media: true,
    preview_site: true
  },
  client_viewer: {
    preview_site: true
  }
};

export const permissionLabels: Array<{ key: SitePermission; label: string }> = [
  { key: "edit_content", label: "Edit content" },
  { key: "upload_media", label: "Upload images" },
  { key: "edit_design", label: "Edit design" },
  { key: "manage_sections", label: "Manage sections" },
  { key: "preview_site", label: "Preview" },
  { key: "publish_site", label: "Publish" },
  { key: "manage_domains", label: "Manage domains" },
  { key: "view_leads", label: "View leads" },
  { key: "update_leads", label: "Update leads" },
  { key: "invite_users", label: "Invite users" },
  { key: "transfer_ownership", label: "Transfer ownership" },
  { key: "manage_billing", label: "Manage billing" }
];

export function permissionsForRole(role: SiteAccessRole, overrides: Partial<Record<SitePermission, boolean>> = {}) {
  return { ...permissionPresets[role], ...overrides };
}

export function hasPermission(access: SiteAccessMember | null | undefined, permission: SitePermission, orgRole?: string | null) {
  if (["owner", "admin", "editor"].includes(orgRole ?? "")) return true;
  if (!access) return false;
  if (["agency_owner", "agency_admin", "client_owner"].includes(access.access_role)) return true;
  return access.permissions?.[permission] === true;
}

export async function requireAgencyContext() {
  const { supabase, user } = await requireUser();
  const { data: memberships } = await supabase
    .from("agency_members")
    .select("*, agencies(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  const membership = memberships?.[0] as (AgencyMember & { agencies?: Agency }) | undefined;
  if (!membership?.agencies) redirect("/onboarding/agency");
  return { supabase, user, agency: membership.agencies, agencyMembership: membership, agencyRole: membership.role };
}

export async function requireClientSites() {
  const { supabase, user } = await requireUser();
  const { data: access } = await supabase
    .from("site_access_members")
    .select("*, sites(*)")
    .eq("user_id", user.id)
    .in("access_role", ["client_owner", "client_editor", "client_viewer"])
    .returns<Array<SiteAccessMember & { sites: Site | null }>>();
  return { supabase, user, access: access ?? [], sites: (access ?? []).map((item) => item.sites).filter(Boolean) as Site[] };
}

export async function getAccessibleSitesForCurrentUser(supabase: SupabaseServerClient, userId: string) {
  const { data: sites } = await supabase
    .from("sites")
    .select("*")
    .order("updated_at", { ascending: false })
    .returns<Site[]>();

  const { data: memberships } = await supabase
    .from("organization_members")
    .select("*")
    .eq("user_id", userId)
    .returns<OrganizationMembership[]>();

  const { data: accessMembers } = await supabase
    .from("site_access_members")
    .select("*")
    .eq("user_id", userId)
    .returns<SiteAccessMember[]>();

  const membershipMap = new Map(memberships?.map((m) => [m.organization_id, m]) ?? []);
  const accessMap = new Map(accessMembers?.map((a) => [a.site_id, a]) ?? []);

  return (sites ?? []).map((site) => {
    const membership = membershipMap.get(site.organization_id);
    const siteAccess = accessMap.get(site.id);
    return {
      site,
      membershipRole: membership?.role as string | undefined,
      siteAccess
    };
  });
}

export async function getAccessibleSiteById(supabase: SupabaseServerClient, userId: string, siteId: string) {
  const { data: site } = await supabase
    .from("sites")
    .select("*")
    .eq("id", siteId)
    .maybeSingle<Site>();

  if (!site) return null;

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", site.organization_id)
    .maybeSingle<Organization>();

  if (!organization) return null;

  const { data: membership } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", site.organization_id)
    .eq("user_id", userId)
    .maybeSingle<OrganizationMembership>();

  const { data: siteAccess } = await supabase
    .from("site_access_members")
    .select("*")
    .eq("site_id", site.id)
    .eq("user_id", userId)
    .maybeSingle<SiteAccessMember>();

  let isPlatformAdmin = false;
  if (!membership && !siteAccess) {
    const { data: admin } = await supabase
      .from("platform_admins")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    isPlatformAdmin = !!admin;
    if (!isPlatformAdmin) {
      return null;
    }
  }

  return {
    site,
    organization,
    membershipRole: membership?.role as string | undefined,
    siteAccess,
    isPlatformAdmin
  };
}

export async function requireSitePermission(supabase: SupabaseServerClient, userId: string, siteId: string, permission: SitePermission) {
  const accessContext = await getAccessibleSiteById(supabase, userId, siteId);
  if (!accessContext) {
    redirect("/dashboard/websites");
  }
  const allowed = hasPermission(accessContext.siteAccess, permission, accessContext.membershipRole) || accessContext.isPlatformAdmin;
  if (!allowed) {
    redirect("/dashboard/websites");
  }
  return accessContext;
}
