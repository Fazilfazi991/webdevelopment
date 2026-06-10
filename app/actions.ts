"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { countries, currencies, languages, timezones } from "@/lib/constants";
import { requireDashboardContext, requireUser } from "@/lib/data";
import { organizationSchema, profileSchema, siteSchema } from "@/lib/validators/onboarding";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function isAllowed<T extends readonly { value: string }[]>(list: T, candidate: string) {
  return list.some((item) => item.value === candidate);
}

export async function createOrganizationAction(formData: FormData) {
  const { supabase, user } = await requireUser();
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

  const { data: existing } = await supabase.from("organizations").select("id").eq("slug", input.data.slug).maybeSingle();
  if (existing) redirect("/onboarding?error=That organisation slug is already taken.");

  const organizationId = crypto.randomUUID();
  const { error } = await supabase
    .from("organizations")
    .insert({
      id: organizationId,
      name: input.data.name,
      slug: input.data.slug,
      country_code: input.data.countryCode,
      default_currency: input.data.defaultCurrency,
      timezone: input.data.timezone,
      created_by: user.id
    });

  if (error) {
    const message = error.code === "23505" ? "That organisation slug is already taken." : error.message;
    redirect(`/onboarding?error=${encodeURIComponent(message)}`);
  }

  const { error: memberError } = await supabase.from("organization_members").insert({
    organization_id: organizationId,
    user_id: user.id,
    role: "owner"
  });

  if (memberError) redirect(`/onboarding?error=${encodeURIComponent(memberError.message)}`);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function createSiteAction(formData: FormData) {
  const { supabase, user, organization } = await requireDashboardContext();
  const input = siteSchema.safeParse({
    name: value(formData, "name"),
    slug: value(formData, "slug"),
    websiteType: value(formData, "websiteType")
  });

  if (!input.success) redirect(`/dashboard/websites/new?error=${encodeURIComponent(input.error.errors[0].message)}`);

  const { data: existing } = await supabase
    .from("sites")
    .select("id")
    .eq("organization_id", organization.id)
    .eq("slug", input.data.slug)
    .maybeSingle();
  if (existing) redirect("/dashboard/websites/new?error=That website slug already exists in this organisation.");

  const { data: site, error } = await supabase
    .from("sites")
    .insert({
      organization_id: organization.id,
      name: input.data.name,
      slug: input.data.slug,
      website_type: input.data.websiteType,
      status: "draft",
      country_code: organization.country_code,
      default_language: "en",
      setup_step: "website_type",
      created_by: user.id
    })
    .select("id")
    .single();

  if (error || !site) redirect(`/dashboard/websites/new?error=${encodeURIComponent(error?.message ?? "Could not create website.")}`);

  revalidatePath("/dashboard");
  redirect(`/dashboard/websites/${site.id}/setup/type`);
}

export async function updateProfileAction(formData: FormData) {
  const { supabase, user } = await requireUser();
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

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.data.fullName,
      phone: input.data.phone,
      country_code: input.data.countryCode,
      preferred_language: input.data.preferredLanguage
    })
    .eq("id", user.id);

  if (error) redirect(`/dashboard/settings?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?message=Profile updated.");
}
