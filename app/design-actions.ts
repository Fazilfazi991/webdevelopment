"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hasPermission } from "@/lib/access-control";
import { getRecipe } from "@/lib/design-system/catalog";
import { requireSiteSetup } from "@/lib/setup";

const schema = z.object({ siteId: z.string().uuid(), recipeSlug: z.string().min(1) });

export async function applyDesignRecipeAction(formData: FormData) {
  const input = schema.safeParse({ siteId: String(formData.get("siteId") ?? ""), recipeSlug: String(formData.get("recipeSlug") ?? "") });
  if (!input.success) redirect("/dashboard/websites?error=Invalid design selection.");
  const context = await requireSiteSetup(input.data.siteId);
  if (!hasPermission(context.siteAccess, "edit_design", context.membershipRole)) redirect(`/dashboard/websites/${context.site.id}/design?error=You cannot change this website design.`);
  const recipe = getRecipe(input.data.recipeSlug);
  if (!recipe || !["approved", "published"].includes(recipe.status)) redirect(`/dashboard/websites/${context.site.id}/design?error=This design is not available.`);

  const { data: template } = await context.supabase.from("templates").select("id").eq("slug", recipe.slug).eq("is_active", true).maybeSingle<{ id: string }>();
  if (!template) redirect(`/dashboard/websites/${context.site.id}/design/${recipe.slug}?error=This design must be installed by an administrator before it can be applied.`);

  const { error: designSelectionError } = await context.supabase.from("site_design_selections").upsert({ site_id: context.site.id, design_recipe_id: recipe.id, status: "draft", selected_by: context.user.id, review_recommended: false }, { onConflict: "site_id" });
  if (designSelectionError) redirect(`/dashboard/websites/${context.site.id}/design/${recipe.slug}?error=Design Studio migration 018 must be applied before switching designs.`);

  const { error } = await context.supabase.from("site_template_selections").update({ template_id: template.id, selected_by: context.user.id }).eq("site_id", context.site.id);
  if (error) redirect(`/dashboard/websites/${context.site.id}/design/${recipe.slug}?error=Could not apply this design.`);
  await context.supabase.from("sites").update({ updated_at: new Date().toISOString() }).eq("id", context.site.id);
  revalidatePath(`/dashboard/websites/${context.site.id}`);
  redirect(`/dashboard/websites/${context.site.id}/design?message=${encodeURIComponent(`${recipe.name} applied as a draft. Your live website is unchanged until you publish.`)}`);
}
