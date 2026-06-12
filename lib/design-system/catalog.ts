export type SectionType =
  | "header" | "hero" | "highlights" | "about" | "services" | "projects"
  | "testimonials" | "faq" | "contact" | "footer" | "whatsapp-action";

export type DesignStatus = "draft" | "internal_review" | "mobile_qa" | "desktop_qa" | "approved" | "published" | "archived";

export type VariantCompatibility = {
  requiredSlots: string[];
  optionalSlots: string[];
  minItems: number;
  maxItems: number;
  minImages: number;
  supportedFamilies: string[];
  supportedStylePresets: string[];
  fallbackVariant: string | null;
  mobileReady: boolean;
  desktopReady: boolean;
};

export type SectionVariantDefinition = VariantCompatibility & {
  id: string;
  name: string;
  sectionType: SectionType;
  description: string;
  rendererKey: string;
};

export type StylePreset = {
  id: string;
  name: string;
  description: string;
  colors: { primary: string; primaryDark: string; secondary: string; accent: string; background: string; surface: string; ink: string; muted: string; border: string };
  fontFamily: string;
  typographyScale: "compact" | "balanced" | "bold" | "editorial";
  buttonStyle: "solid" | "outline" | "soft" | "pill" | "square";
  cardRadius: string;
  sectionSpacing: "compact" | "comfortable" | "generous";
  borderStyle: "subtle" | "strong" | "none";
  shadowStyle: string;
  iconStyle: "line" | "solid" | "boxed";
};

export type RecipeSection = {
  sectionType: SectionType;
  variantId: string;
  displayOrder: number;
  required: boolean;
  enabledByDefault: boolean;
  fallbackVariantId: string | null;
};

export type DesignRecipe = {
  id: string;
  name: string;
  slug: string;
  family: string;
  description: string;
  bestFor: string;
  stylePresetId: string;
  status: DesignStatus;
  isFeatured: boolean;
  previewAsset: string;
  mobilePreviewAsset: string;
  supportedLanguages: string[];
  supportedRegions: string[];
  includedPages: string[];
  sections: RecipeSection[];
};

const family = ["service-business"];
const presets = ["modern-professional", "clean-minimal", "industrial-bold", "warm-local-business", "elegant-premium"];
const compatibility = (fallbackVariant: string | null, overrides: Partial<VariantCompatibility> = {}): VariantCompatibility => ({
  requiredSlots: [], optionalSlots: [], minItems: 0, maxItems: 12, minImages: 0,
  supportedFamilies: family, supportedStylePresets: presets, fallbackVariant,
  mobileReady: true, desktopReady: true, ...overrides
});

function variant(id: string, name: string, sectionType: SectionType, rendererKey: string, fallback: string | null, overrides: Partial<VariantCompatibility> = {}): SectionVariantDefinition {
  return { id, name, sectionType, rendererKey, description: `${name}, approved for responsive service-business websites.`, ...compatibility(fallback, overrides) };
}

export const sectionVariants: SectionVariantDefinition[] = [
  variant("header-trust-bar-01", "Header Trust Bar 01", "header", "header-topbar-standard", null, { requiredSlots: ["companyName"] }),
  variant("header-minimal-02", "Header Minimal 02", "header", "header-clean", "header-trust-bar-01", { requiredSlots: ["companyName"] }),
  variant("header-centered-03", "Header Centered 03", "header", "header-clean", "header-minimal-02", { requiredSlots: ["companyName"] }),
  variant("header-industrial-04", "Header Industrial 04", "header", "header-topbar-standard", "header-trust-bar-01", { requiredSlots: ["companyName", "phone"] }),
  variant("hero-split-image-01", "Hero Split Image 01", "hero", "hero-split-image", "hero-text-first-03", { requiredSlots: ["heading", "description", "primaryCta"], optionalSlots: ["hero"], minImages: 0 }),
  variant("hero-full-bleed-02", "Hero Full Bleed 02", "hero", "hero-background-overlay", "hero-text-first-03", { requiredSlots: ["heading"], optionalSlots: ["hero"] }),
  variant("hero-text-first-03", "Hero Text First 03", "hero", "hero-minimal-services", null, { requiredSlots: ["heading"] }),
  variant("hero-offset-card-04", "Hero Offset Card 04", "hero", "hero-split-image", "hero-text-first-03", { requiredSlots: ["heading", "description"] }),
  variant("hero-industrial-05", "Hero Industrial 05", "hero", "hero-background-overlay", "hero-full-bleed-02", { requiredSlots: ["heading"] }),
  variant("highlights-trust-row-01", "Highlights Trust Row 01", "highlights", "service-highlights-row", null, { minItems: 2, maxItems: 4 }),
  variant("highlights-compact-02", "Highlights Compact 02", "highlights", "service-highlights-row", "highlights-trust-row-01", { minItems: 2, maxItems: 3 }),
  variant("highlights-bold-strip-03", "Highlights Bold Strip 03", "highlights", "service-highlights-row", "highlights-trust-row-01", { minItems: 3, maxItems: 4 }),
  variant("about-image-left-01", "About Image Left 01", "about", "about-image-left", "about-text-03", { optionalSlots: ["about"] }),
  variant("about-image-right-02", "About Image Right 02", "about", "about-image-right", "about-text-03", { optionalSlots: ["about"] }),
  variant("about-text-03", "About Text 03", "about", "about-image-left", null),
  variant("about-proof-panel-04", "About Proof Panel 04", "about", "about-image-right", "about-text-03", { minItems: 2 }),
  variant("services-cards-01", "Services Cards 01", "services", "services-card-grid", "services-compact-02", { minItems: 1, maxItems: 6 }),
  variant("services-compact-02", "Services Compact 02", "services", "services-icon-grid", null, { minItems: 1, maxItems: 8 }),
  variant("services-rows-03", "Services Alternating Rows 03", "services", "services-alternating-rows", "services-cards-01", { minItems: 1, maxItems: 6 }),
  variant("services-industrial-04", "Services Industrial 04", "services", "services-alternating-rows", "services-rows-03", { minItems: 2, maxItems: 6 }),
  variant("projects-grid-01", "Projects Grid 01", "projects", "project-gallery-grid", null, { minItems: 1, minImages: 1, optionalSlots: ["gallery"] }),
  variant("projects-showcase-02", "Projects Showcase 02", "projects", "project-gallery-grid", "projects-grid-01", { minItems: 2, minImages: 2 }),
  variant("projects-mosaic-03", "Projects Mosaic 03", "projects", "project-gallery-grid", "projects-grid-01", { minItems: 4, minImages: 4 }),
  variant("testimonials-compact-01", "Testimonials Compact 01", "testimonials", "testimonials-cards", null, { minItems: 1, maxItems: 3 }),
  variant("testimonials-grid-02", "Testimonials Grid 02", "testimonials", "testimonials-cards", "testimonials-compact-01", { minItems: 2, maxItems: 6 }),
  variant("testimonials-featured-03", "Testimonials Featured 03", "testimonials", "testimonials-cards", "testimonials-compact-01", { minItems: 1, maxItems: 4 }),
  variant("faq-accordion-01", "FAQ Accordion 01", "faq", "faq-accordion", null, { minItems: 1, maxItems: 10 }),
  variant("faq-compact-02", "FAQ Compact 02", "faq", "faq-accordion", "faq-accordion-01", { minItems: 1, maxItems: 6 }),
  variant("faq-split-03", "FAQ Split 03", "faq", "faq-accordion", "faq-accordion-01", { minItems: 2, maxItems: 8 }),
  variant("contact-form-01", "Contact Form 01", "contact", "contact-map-form", "contact-banner-02", { requiredSlots: ["phone"] }),
  variant("contact-banner-02", "Contact Banner 02", "contact", "contact-cta-banner", null),
  variant("contact-split-03", "Contact Split 03", "contact", "contact-map-form", "contact-banner-02", { requiredSlots: ["phone"] }),
  variant("footer-standard-01", "Footer Standard 01", "footer", "footer-standard", null, { requiredSlots: ["companyName"] }),
  variant("footer-minimal-02", "Footer Minimal 02", "footer", "footer-standard", "footer-standard-01", { requiredSlots: ["companyName"] }),
  variant("footer-columns-03", "Footer Columns 03", "footer", "footer-standard", "footer-standard-01", { requiredSlots: ["companyName"] }),
  variant("footer-industrial-04", "Footer Industrial 04", "footer", "footer-standard", "footer-standard-01", { requiredSlots: ["companyName"] }),
  variant("whatsapp-floating-01", "WhatsApp Floating 01", "whatsapp-action", "floating-whatsapp", null, { requiredSlots: ["whatsapp"] })
];

export const stylePresets: StylePreset[] = [
  { id: "modern-professional", name: "Modern Professional", description: "Balanced, polished and trust-led.", colors: { primary: "#0f766e", primaryDark: "#134e4a", secondary: "#d8c3a5", accent: "#16a34a", background: "#ffffff", surface: "#f5f7f6", ink: "#10231f", muted: "#52635f", border: "#dce5e2" }, fontFamily: "Inter, Arial, sans-serif", typographyScale: "balanced", buttonStyle: "solid", cardRadius: "14px", sectionSpacing: "comfortable", borderStyle: "subtle", shadowStyle: "0 16px 40px rgba(15, 76, 67, .10)", iconStyle: "boxed" },
  { id: "clean-minimal", name: "Clean Minimal", description: "Quiet, light and text-first.", colors: { primary: "#334155", primaryDark: "#0f172a", secondary: "#e2e8f0", accent: "#64748b", background: "#ffffff", surface: "#f8fafc", ink: "#0f172a", muted: "#64748b", border: "#e2e8f0" }, fontFamily: "Inter, Arial, sans-serif", typographyScale: "compact", buttonStyle: "outline", cardRadius: "8px", sectionSpacing: "compact", borderStyle: "subtle", shadowStyle: "0 8px 24px rgba(15, 23, 42, .06)", iconStyle: "line" },
  { id: "industrial-bold", name: "Industrial Bold", description: "High contrast, direct and project-led.", colors: { primary: "#f97316", primaryDark: "#111827", secondary: "#fbbf24", accent: "#fb923c", background: "#ffffff", surface: "#f3f4f6", ink: "#111827", muted: "#4b5563", border: "#d1d5db" }, fontFamily: "Arial, sans-serif", typographyScale: "bold", buttonStyle: "square", cardRadius: "2px", sectionSpacing: "generous", borderStyle: "strong", shadowStyle: "0 18px 0 rgba(17, 24, 39, .10)", iconStyle: "solid" },
  { id: "warm-local-business", name: "Warm Local Business", description: "Friendly, familiar and community-minded.", colors: { primary: "#b45309", primaryDark: "#78350f", secondary: "#fde68a", accent: "#d97706", background: "#fffbeb", surface: "#fff7ed", ink: "#422006", muted: "#78716c", border: "#fed7aa" }, fontFamily: "Georgia, serif", typographyScale: "balanced", buttonStyle: "pill", cardRadius: "18px", sectionSpacing: "comfortable", borderStyle: "subtle", shadowStyle: "0 14px 32px rgba(120, 53, 15, .10)", iconStyle: "boxed" },
  { id: "elegant-premium", name: "Elegant Premium", description: "Refined typography and restrained detail.", colors: { primary: "#4338ca", primaryDark: "#1e1b4b", secondary: "#c4b5fd", accent: "#7c3aed", background: "#ffffff", surface: "#f5f3ff", ink: "#1e1b4b", muted: "#6b7280", border: "#ddd6fe" }, fontFamily: "Georgia, serif", typographyScale: "editorial", buttonStyle: "soft", cardRadius: "12px", sectionSpacing: "generous", borderStyle: "none", shadowStyle: "0 22px 50px rgba(49, 46, 129, .12)", iconStyle: "line" }
];

const recipeSections = (ids: Partial<Record<SectionType, string>>): RecipeSection[] =>
  Object.entries(ids).map(([sectionType, variantId], displayOrder) => ({ sectionType: sectionType as SectionType, variantId: variantId!, displayOrder, required: ["header", "hero", "services", "contact", "footer"].includes(sectionType), enabledByDefault: true, fallbackVariantId: sectionVariants.find((item) => item.id === variantId)?.fallbackVariant ?? null }));

export const designRecipes: DesignRecipe[] = [
  { id: "service-modern", name: "Service Modern", slug: "service-modern", family: "service-business", description: "A polished split-layout design with structured services and balanced trust signals.", bestFor: "Technical services, AC maintenance, electrical and plumbing teams", stylePresetId: "modern-professional", status: "published", isFeatured: true, previewAsset: "/designs/service-modern/preview-desktop.webp", mobilePreviewAsset: "/designs/service-modern/preview-mobile.webp", supportedLanguages: ["en", "ar"], supportedRegions: ["global", "gcc"], includedPages: ["Home", "About", "Services", "Projects", "Contact"], sections: recipeSections({ header: "header-trust-bar-01", hero: "hero-split-image-01", highlights: "highlights-trust-row-01", about: "about-image-left-01", services: "services-cards-01", projects: "projects-grid-01", testimonials: "testimonials-grid-02", faq: "faq-accordion-01", contact: "contact-form-01", footer: "footer-columns-03", "whatsapp-action": "whatsapp-floating-01" }) },
  { id: "service-minimal", name: "Service Minimal", slug: "service-minimal", family: "service-business", description: "A calm text-first design with compact service browsing and strong mobile readability.", bestFor: "Cleaning, laundry, pest control and focused local operators", stylePresetId: "clean-minimal", status: "published", isFeatured: true, previewAsset: "/designs/service-minimal/preview-desktop.webp", mobilePreviewAsset: "/designs/service-minimal/preview-mobile.webp", supportedLanguages: ["en", "ar"], supportedRegions: ["global", "gcc"], includedPages: ["Home", "About", "Services", "Projects", "Contact"], sections: recipeSections({ header: "header-minimal-02", hero: "hero-text-first-03", highlights: "highlights-compact-02", about: "about-text-03", services: "services-compact-02", projects: "projects-grid-01", testimonials: "testimonials-compact-01", faq: "faq-compact-02", contact: "contact-banner-02", footer: "footer-minimal-02", "whatsapp-action": "whatsapp-floating-01" }) },
  { id: "service-bold", name: "Service Bold", slug: "service-bold", family: "service-business", description: "A high-contrast full-width design with alternating services and a stronger project showcase.", bestFor: "Car care, painting, landscaping and industrial maintenance", stylePresetId: "industrial-bold", status: "published", isFeatured: true, previewAsset: "/designs/service-bold/preview-desktop.webp", mobilePreviewAsset: "/designs/service-bold/preview-mobile.webp", supportedLanguages: ["en", "ar"], supportedRegions: ["global", "gcc"], includedPages: ["Home", "About", "Services", "Projects", "Contact"], sections: recipeSections({ header: "header-industrial-04", hero: "hero-industrial-05", highlights: "highlights-bold-strip-03", about: "about-image-right-02", services: "services-industrial-04", projects: "projects-showcase-02", testimonials: "testimonials-featured-03", faq: "faq-split-03", contact: "contact-split-03", footer: "footer-industrial-04", "whatsapp-action": "whatsapp-floating-01" }) }
];

export const serviceCategories = ["technical-services", "ac-maintenance", "cleaning", "plumbing", "electrical", "painting", "laundry", "car-care", "pest-control", "landscaping"];
export const customerVisibleRecipes = designRecipes.filter((recipe) => ["approved", "published"].includes(recipe.status) && recipe.previewAsset && recipe.mobilePreviewAsset);
export function getRecipe(slug: string) { return designRecipes.find((recipe) => recipe.slug === slug) ?? null; }
export function getPreset(id: string) { return stylePresets.find((preset) => preset.id === id) ?? stylePresets[0]; }
export function getVariant(id: string) { return sectionVariants.find((item) => item.id === id) ?? null; }
