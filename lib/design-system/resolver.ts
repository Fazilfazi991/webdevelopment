import { customerVisibleRecipes, getVariant, type DesignRecipe } from "@/lib/design-system/catalog";

export type RecipeRecommendationInput = {
  businessFamily?: string;
  businessCategory?: string;
  serviceCount?: number;
  projectImageCount?: number;
  reviewCount?: number;
  galleryImageCount?: number;
  logoColourAvailable?: boolean;
  preferredStyle?: string;
  language?: string;
  region?: string;
};

export type RecipeRecommendation = { recipe: DesignRecipe; reasonTags: string[] };

export function recommendDesignRecipes(input: RecipeRecommendationInput) {
  const scores = customerVisibleRecipes.map((recipe) => {
    let score = 0;
    const reasons: string[] = [];
    if ((input.businessFamily ?? "service-business") === recipe.family) { score += 40; reasons.push("Service business fit"); }
    if (["technical-services", "ac-maintenance", "electrical", "plumbing"].includes(input.businessCategory ?? "") && recipe.slug === "service-modern") { score += 25; reasons.push("Technical services default"); }
    if (["painting", "car-care", "landscaping"].includes(input.businessCategory ?? "") && recipe.slug === "service-bold") { score += 22; reasons.push("Strong visual proof"); }
    if (["cleaning", "laundry", "pest-control"].includes(input.businessCategory ?? "") && recipe.slug === "service-minimal") { score += 22; reasons.push("Clear local-service browsing"); }
    if (input.preferredStyle && recipe.stylePresetId.includes(input.preferredStyle.toLowerCase())) { score += 18; reasons.push("Preferred style"); }
    if ((input.galleryImageCount ?? input.projectImageCount ?? 0) >= 4 && recipe.slug === "service-bold") { score += 10; reasons.push("Gallery ready"); }
    if ((input.reviewCount ?? 0) < 2 && recipe.slug === "service-minimal") { score += 5; reasons.push("Works with limited reviews"); }
    if (recipe.supportedLanguages.includes(input.language ?? "en")) score += 3;
    if (recipe.supportedRegions.includes(input.region ?? "global") || recipe.supportedRegions.includes("global")) score += 2;
    return { recipe, score, reasonTags: reasons.length ? reasons : ["General service-business fallback"] };
  }).sort((a, b) => b.score - a.score);

  return { best: scores[0] as RecipeRecommendation, alternatives: scores.slice(1, 3) as RecipeRecommendation[] };
}

export function resolveCompatibleVariant(variantId: string, counts: { items?: number; images?: number }) {
  let variant = getVariant(variantId);
  const visited = new Set<string>();
  while (variant && !visited.has(variant.id)) {
    visited.add(variant.id);
    if ((counts.items ?? 0) >= variant.minItems && (counts.images ?? 0) >= variant.minImages) return variant;
    variant = variant.fallbackVariant ? getVariant(variant.fallbackVariant) : null;
  }
  return null;
}
