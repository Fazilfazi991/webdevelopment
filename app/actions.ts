"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { countries, currencies, languages, timezones } from "@/lib/constants";
import { readDemoState, timestamp, writeDemoState } from "@/lib/demo-store";
import { requireDashboardContext, requireUser } from "@/lib/data";
import { organizationSchema, profileSchema, siteSchema } from "@/lib/validators/onboarding";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function isAllowed<T extends readonly { value: string }[]>(list: T, candidate: string) {
  return list.some((item) => item.value === candidate);
}

export async function createOrganizationAction(formData: FormData) {
  const { user } = await requireUser();
  const state = readDemoState();
  const input = organizationSchema.safeParse({
    name: value(formData, "name"),
    slug: value(formData, "slug"),
    countryCode: value(formData, "countryCode"),
    defaultCurrency: value(formData, "defaultCurrency"),
    timezone: value(formData, "timezone")
  });

  if (!input.success) redirect(`/onboarding?error=${encodeURIComponent(input.error.errors[0].message)}`);
  if (!isAllowed(countries, input.data.countryCode) || !isAllowed(currencies, input.data.defaultCurrency) || !isAllowed(timezones, input.data.timezone)) {
    redirect("/onboarding?error=Choose supported market settings.");
  }

  const createdAt = timestamp();
  state.organization = {
    id: crypto.randomUUID(),
    name: input.data.name,
    slug: input.data.slug,
    country_code: input.data.countryCode,
    default_currency: input.data.defaultCurrency,
    timezone: input.data.timezone,
    created_by: user.id,
    created_at: createdAt,
    updated_at: createdAt
  };
  state.membershipRole = "owner";
  writeDemoState(state);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function createSiteAction(formData: FormData) {
  const { user, organization } = await requireDashboardContext();
  const state = readDemoState();
  const input = siteSchema.safeParse({
    name: value(formData, "name"),
    slug: value(formData, "slug"),
    websiteType: value(formData, "websiteType")
  });

  if (!input.success) redirect(`/dashboard/websites/new?error=${encodeURIComponent(input.error.errors[0].message)}`);

  const existing = state.sites.find((site) => site.organization_id === organization.id && site.slug === input.data.slug);
  if (existing) redirect("/dashboard/websites/new?error=That website slug already exists in this organisation.");

  const createdAt = timestamp();
  const site = {
    id: crypto.randomUUID(),
    organization_id: organization.id,
    name: input.data.name,
    slug: input.data.slug,
    website_type: input.data.websiteType,
    status: "draft" as const,
    country_code: organization.country_code,
    default_language: "en",
    created_by: user.id,
    created_at: createdAt,
    updated_at: createdAt
  };
  state.sites = [site, ...state.sites];
  writeDemoState(state);

  revalidatePath("/dashboard");
  redirect(`/dashboard/websites/${site.id}/setup`);
}

export async function updateProfileAction(formData: FormData) {
  const { user } = await requireUser();
  const state = readDemoState();
  const input = profileSchema.safeParse({
    fullName: value(formData, "fullName"),
    phone: value(formData, "phone"),
    countryCode: value(formData, "countryCode"),
    preferredLanguage: value(formData, "preferredLanguage")
  });

  if (!input.success) redirect(`/dashboard/settings?error=${encodeURIComponent(input.error.errors[0].message)}`);
  if (!isAllowed(countries, input.data.countryCode) || !isAllowed(languages, input.data.preferredLanguage)) {
    redirect("/dashboard/settings?error=Choose supported profile settings.");
  }

  if (state.profile?.id !== user.id && state.profile?.email !== user.email) redirect("/dashboard/settings?error=Demo profile not found.");
  if (state.profile) {
    state.profile = {
      ...state.profile,
      full_name: input.data.fullName,
      phone: input.data.phone ?? null,
      country_code: input.data.countryCode,
      preferred_language: input.data.preferredLanguage,
      updated_at: timestamp()
    };
  }
  writeDemoState(state);

  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?message=Profile updated.");
}
