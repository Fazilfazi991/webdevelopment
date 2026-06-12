import { designRecipes } from "@/lib/design-system/catalog";

const files = ["thumbnail.webp", "cover.webp", "preview-desktop.webp", "preview-mobile.webp", "page-home.webp", "page-about.webp", "page-services.webp", "page-projects.webp", "page-contact.webp", "section-hero.webp", "section-services.webp", "section-projects.webp", "section-contact.webp", "section-footer.webp"] as const;

export const previewAssetManifest = Object.fromEntries(
  designRecipes.map((recipe) => [recipe.slug, Object.fromEntries(files.map((file) => [file.replace(".webp", ""), `/designs/${recipe.slug}/${file}`]))])
);
