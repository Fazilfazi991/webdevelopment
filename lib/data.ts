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
  const organization = membership?.organizations as Organization | null | undefined;

  if (!organization) redirect("/onboarding");

  const { data: sites } = await supabase
    .from("sites")
    .select("*")
    .eq("organization_id", organization.id)
    .order("updated_at", { ascending: false })
    .returns<Site[]>();

  return {
    supabase,
    user,
    profile,
    organization,
    membershipRole: membership?.role as string | undefined,
    sites: sites ?? []
  };
}

export async function requireAdmin() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("platform_admins").select("id").eq("user_id", user.id).maybeSingle();
  if (!data) redirect("/dashboard");
  return { supabase, user };
}
