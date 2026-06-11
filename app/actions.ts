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
    websiteType: value(formData, "websiteType"),
    countryCode: value(formData, "countryCode") || organization.country_code,
    defaultLanguage: value(formData, "defaultLanguage") || "en"
  });

  if (!input.success) redirect(`/dashboard/websites/new?error=${encodeURIComponent(input.error.errors[0].message)}`);
  if (!isAllowed(countries, input.data.countryCode) || !isAllowed(languages, input.data.defaultLanguage)) {
    redirect("/dashboard/websites/new?error=Choose supported country and language settings.");
  }

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
      country_code: input.data.countryCode,
      default_language: input.data.defaultLanguage,
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

/** Auto-derives timezone and currency from country for the simplified onboarding form. */
export async function createOrganizationAutoAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const nameRaw = value(formData, "name").trim();
  const countryCode = value(formData, "countryCode") || "IN";

  if (!nameRaw) redirect("/onboarding?error=Please enter your business name.");
  if (!isAllowed(countries, countryCode)) redirect("/onboarding?error=Choose a supported country.");

  // Auto-derive currency and timezone
  const countryDefaults: Record<string, { currency: string; timezone: string }> = {
    AE: { currency: "AED", timezone: "Asia/Dubai" },
    IN: { currency: "INR", timezone: "Asia/Kolkata" }
  };
  const defaults = countryDefaults[countryCode] ?? { currency: "USD", timezone: "UTC" };

  const slug = nameRaw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  const { data: existingOrg } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  const finalSlug = existingOrg ? `${slug}-${Date.now().toString(36)}` : slug;

  const { data: org, error } = await supabase
    .from("organizations")
    .insert({
      name: nameRaw,
      slug: finalSlug,
      country_code: countryCode,
      default_currency: defaults.currency,
      timezone: defaults.timezone,
      created_by: user.id
    })
    .select("id")
    .single();

  if (error || !org) redirect(`/onboarding?error=${encodeURIComponent(error?.message ?? "Could not create organisation.")}`);

  const { error: memberError } = await supabase.from("organization_members").insert({
    organization_id: org.id,
    user_id: user.id,
    role: "owner"
  });

  if (memberError) {
    await supabase.from("organizations").delete().eq("id", org.id);
    redirect(`/onboarding?error=${encodeURIComponent(memberError.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard/websites/new");
}

/**
 * Creates a new site and its business profile in one server action.
 * Called by the mobile onboarding wizard at the "Prepare My Website" step.
 */
export async function createSiteWithProfileAction(formData: FormData) {
  const { supabase, user, organization } = await requireDashboardContext();

  const name = value(formData, "name").trim();
  const slug = value(formData, "slug").trim();
  const countryCode = value(formData, "countryCode") || organization.country_code;
  const defaultLanguage = value(formData, "defaultLanguage") || "en";
  const phone = value(formData, "phone") || null;
  const whatsapp = value(formData, "whatsapp") || null;
  const email = value(formData, "email") || null;
  const address = value(formData, "address") || null;
  const city = value(formData, "city") || null;
  const mapEmbedUrl = value(formData, "mapEmbedUrl") || null;
  const workingHours = value(formData, "workingHours") || null;

  if (!name || !slug) redirect("/dashboard/websites/new?error=Business name is required.");
  if (!isAllowed(countries, countryCode) || !isAllowed(languages, defaultLanguage)) {
    redirect("/dashboard/websites/new?error=Choose supported country and language.");
  }

  const { data: existingSite } = await supabase
    .from("sites")
    .select("id")
    .eq("organization_id", organization.id)
    .eq("slug", slug)
    .maybeSingle();

  if (existingSite) redirect("/dashboard/websites/new?error=That website address is already used. Try a different business name.");

  const { data: site, error: siteError } = await supabase
    .from("sites")
    .insert({
      organization_id: organization.id,
      name,
      slug,
      website_type: "business_website",
      status: "draft",
      country_code: countryCode,
      default_language: defaultLanguage,
      setup_step: "industry",
      created_by: user.id
    })
    .select("id")
    .single();

  if (siteError || !site) redirect(`/dashboard/websites/new?error=${encodeURIComponent(siteError?.message ?? "Could not create website.")}`);

  // Create the business profile record
  const { error: profileError } = await supabase.from("site_business_profiles").insert({
    site_id: site.id,
    company_name: name,
    phone: phone,
    whatsapp: whatsapp,
    email: email,
    address_line_1: address,
    city: city,
    map_embed_url: mapEmbedUrl,
    working_hours: workingHours ? { description: workingHours } : null
  });

  if (profileError) {
    await supabase.from("sites").delete().eq("id", site.id);
    redirect(`/dashboard/websites/new?error=${encodeURIComponent(profileError.message)}`);
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/websites/${site.id}/setup/industry`);
}

