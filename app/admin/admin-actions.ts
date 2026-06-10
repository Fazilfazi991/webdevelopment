"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/data";
import { slugify } from "@/lib/utils";
import { categoryAdminSchema, industryAdminSchema, templateAdminSchema } from "@/lib/validators/template-discovery";

function formValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function checkbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function optionalId(formData: FormData) {
  const value = formValue(formData, "id");
  return value ? value : undefined;
}

function friendly(error: { code?: string; message?: string } | null | undefined, fallback: string) {
  if (error?.code === "23505") return "That slug already exists.";
  return fallback;
}

export async function saveIndustryAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const input = industryAdminSchema.safeParse({
    id: optionalId(formData),
    name: formValue(formData, "name"),
    slug: formValue(formData, "slug") || slugify(formValue(formData, "name")),
    description: formValue(formData, "description"),
    iconName: formValue(formData, "iconName"),
    displayOrder: formValue(formData, "displayOrder") || "0",
    isActive: checkbox(formData, "isActive")
  });
  if (!input.success) redirect(`/admin/industries?error=${encodeURIComponent(input.error.errors[0].message)}`);

  const payload = {
    name: input.data.name,
    slug: input.data.slug,
    description: input.data.description,
    icon_name: input.data.iconName,
    display_order: input.data.displayOrder,
    is_active: input.data.isActive
  };
  const result = input.data.id
    ? await supabase.from("industries").update(payload).eq("id", input.data.id)
    : await supabase.from("industries").insert(payload);

  if (result.error) redirect(`/admin/industries?error=${encodeURIComponent(friendly(result.error, "Could not save industry."))}`);
  revalidatePath("/admin/industries");
  redirect("/admin/industries?message=Industry saved.");
}

export async function saveCategoryAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const input = categoryAdminSchema.safeParse({
    id: optionalId(formData),
    industryId: formValue(formData, "industryId"),
    name: formValue(formData, "name"),
    slug: formValue(formData, "slug") || slugify(formValue(formData, "name")),
    description: formValue(formData, "description"),
    iconName: formValue(formData, "iconName"),
    displayOrder: formValue(formData, "displayOrder") || "0",
    isActive: checkbox(formData, "isActive")
  });
  if (!input.success) redirect(`/admin/business-categories?error=${encodeURIComponent(input.error.errors[0].message)}`);

  const payload = {
    industry_id: input.data.industryId,
    name: input.data.name,
    slug: input.data.slug,
    description: input.data.description,
    icon_name: input.data.iconName,
    display_order: input.data.displayOrder,
    is_active: input.data.isActive
  };
  const result = input.data.id
    ? await supabase.from("business_categories").update(payload).eq("id", input.data.id)
    : await supabase.from("business_categories").insert(payload);

  if (result.error) redirect(`/admin/business-categories?error=${encodeURIComponent(friendly(result.error, "Could not save category."))}`);
  revalidatePath("/admin/business-categories");
  redirect("/admin/business-categories?message=Category saved.");
}

export async function saveTemplateAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const categoryIds = formData.getAll("categoryIds").map(String).filter(Boolean);
  const input = templateAdminSchema.safeParse({
    id: optionalId(formData),
    name: formValue(formData, "name"),
    slug: formValue(formData, "slug") || slugify(formValue(formData, "name")),
    shortDescription: formValue(formData, "shortDescription"),
    longDescription: formValue(formData, "longDescription"),
    styleLabel: formValue(formData, "styleLabel"),
    thumbnailUrl: formValue(formData, "thumbnailUrl"),
    desktopPreviewUrl: formValue(formData, "desktopPreviewUrl"),
    mobilePreviewUrl: formValue(formData, "mobilePreviewUrl"),
    displayOrder: formValue(formData, "displayOrder") || "0",
    isFeatured: checkbox(formData, "isFeatured"),
    isActive: checkbox(formData, "isActive"),
    categoryIds,
    pages: formValue(formData, "pages")
  });
  if (!input.success) redirect(`/admin/templates?error=${encodeURIComponent(input.error.errors[0].message)}`);

  const payload = {
    name: input.data.name,
    slug: input.data.slug,
    short_description: input.data.shortDescription,
    long_description: input.data.longDescription,
    style_label: input.data.styleLabel,
    thumbnail_url: input.data.thumbnailUrl || null,
    desktop_preview_url: input.data.desktopPreviewUrl || null,
    mobile_preview_url: input.data.mobilePreviewUrl || null,
    display_order: input.data.displayOrder,
    is_featured: input.data.isFeatured,
    is_active: input.data.isActive
  };

  const templateResult = input.data.id
    ? await supabase.from("templates").update(payload).eq("id", input.data.id).select("id").single()
    : await supabase.from("templates").insert(payload).select("id").single();
  if (templateResult.error || !templateResult.data) {
    redirect(`/admin/templates?error=${encodeURIComponent(friendly(templateResult.error, "Could not save template."))}`);
  }

  const templateId = templateResult.data.id;
  await supabase.from("template_categories").delete().eq("template_id", templateId);
  await supabase.from("template_categories").insert(input.data.categoryIds.map((categoryId) => ({ template_id: templateId, business_category_id: categoryId })));

  await supabase.from("template_pages").delete().eq("template_id", templateId);
  const pages = input.data.pages
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((pageName, index) => ({
      template_id: templateId,
      page_name: pageName,
      page_slug: slugify(pageName),
      display_order: (index + 1) * 10,
      is_default: index === 0
    }));
  if (pages.length) await supabase.from("template_pages").insert(pages);

  revalidatePath("/admin/templates");
  redirect("/admin/templates?message=Template saved.");
}
