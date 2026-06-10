import type { SiteThemeTokens } from "@/lib/site-renderer/theme-types";
import type { Template, TemplatePage } from "@/lib/types";

export type SectionVariantKey =
  | "header-topbar-standard"
  | "header-clean"
  | "hero-split-image"
  | "hero-background-overlay"
  | "hero-minimal-services"
  | "service-highlights-row"
  | "about-image-left"
  | "about-image-right"
  | "services-card-grid"
  | "services-icon-grid"
  | "services-alternating-rows"
  | "why-choose-us-grid"
  | "project-gallery-grid"
  | "testimonials-cards"
  | "faq-accordion"
  | "contact-cta-banner"
  | "contact-map-form"
  | "footer-standard"
  | "floating-whatsapp";

export type SectionVariant = {
  id: string;
  key: string;
  name: string;
  section_type: string;
  description: string | null;
  schema_version: number;
  is_active: boolean;
};

export type TemplateSectionRecord = {
  id: string;
  template_id: string;
  section_variant_id: string;
  page_slug: string;
  section_key: string;
  display_order: number;
  is_required: boolean;
  is_active: boolean;
  default_content: unknown;
  default_settings: unknown;
  section_variants?: SectionVariant | SectionVariant[] | null;
};

export type TemplateThemePreset = {
  id: string;
  template_id: string;
  name: string;
  key: string;
  is_default: boolean;
  theme_tokens: unknown;
};

export type LoadedTemplatePreview = {
  template: Template;
  pages: TemplatePage[];
  sections: TemplateSectionRecord[];
  theme: SiteThemeTokens;
  themePresetName: string;
};

export type SectionComponentProps<TContent = unknown, TSettings = unknown> = {
  content: TContent;
  settings: TSettings;
  pageSlug: string;
};
