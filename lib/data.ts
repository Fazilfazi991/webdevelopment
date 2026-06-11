import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Organization, Profile, Site } from "@/lib/types";

export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function requireUser() {
  const { supabase, user } = await getCurrentUser();
  if (!user) redirect("/auth/login");
  return { supabase, user };
}

export async function requireDashboardContext() {
  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>();

  const { data: memberships } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const membership = memberships?.[0];
  let organization = membership?.organizations as Organization | null | undefined;
  const membershipRole = membership?.role as string | undefined;

  const { data: sites } = await supabase
    .from("sites")
    .select("*")
    .order("updated_at", { ascending: false })
    .returns<Site[]>();

  const accessibleSites = sites ?? [];

  if (!organization) {
    if (accessibleSites.length > 0) {
      const firstSite = accessibleSites[0];
      const { data: siteOrg } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", firstSite.organization_id)
        .maybeSingle<Organization>();
      if (siteOrg) {
        organization = siteOrg;
      }
    }
  }

  if (!organization && accessibleSites.length === 0) {
    redirect("/onboarding");
  }

  if (!organization) {
    organization = {
      id: crypto.randomUUID(),
      name: "My Workspace",
      slug: "my-workspace",
      country_code: "US",
      default_currency: "USD",
      timezone: "UTC",
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  return {
    supabase,
    user,
    profile,
    organization,
    membershipRole,
    sites: accessibleSites
  };
}

export async function requireAdmin() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("platform_admins").select("id").eq("user_id", user.id).maybeSingle();
  if (!data) redirect("/dashboard");
  return { supabase, user };
}
