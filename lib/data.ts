import { redirect } from "next/navigation";
import { readDemoState } from "@/lib/demo-store";
import type { Organization, Profile, Site } from "@/lib/types";

export async function getCurrentUser() {
  const state = readDemoState();
  return { user: state.user };
}

export async function requireUser() {
  const { user } = await getCurrentUser();
  if (!user) redirect("/auth/login");
  return { user };
}

export async function requireDashboardContext() {
  const { user } = await requireUser();
  const state = readDemoState();
  const profile = state.profile as Profile | null;
  const organization = state.organization as Organization | null;

  if (!organization) redirect("/onboarding");

  return {
    user,
    profile,
    organization,
    membershipRole: state.membershipRole ?? undefined,
    sites: state.sites as Site[]
  };
}

export async function requireAdmin() {
  const { user } = await requireUser();
  const state = readDemoState();
  if (!state.platformAdmin) redirect("/dashboard");
  return { user, state };
}
