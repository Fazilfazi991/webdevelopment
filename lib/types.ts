export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  country_code: string | null;
  preferred_language: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  country_code: string;
  default_currency: string;
  timezone: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Site = {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  website_type: "business_website";
  status: "draft" | "published" | "suspended" | "archived";
  country_code: string;
  default_language: string;
  setup_step: SetupStep;
  setup_completed_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type SetupStep = "website_type" | "industry" | "business_category" | "template" | "template_selected" | "content";

export type Industry = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type BusinessCategory = {
  id: string;
  industry_id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Template = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  long_description: string | null;
  style_label: string | null;
  thumbnail_url: string | null;
  desktop_preview_url: string | null;
  mobile_preview_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type TemplateCategory = {
  id: string;
  template_id: string;
  business_category_id: string;
  created_at: string;
};

export type TemplatePage = {
  id: string;
  template_id: string;
  page_name: string;
  page_slug: string;
  display_order: number;
  is_default: boolean;
  created_at: string;
};

export type SiteTemplateSelection = {
  id: string;
  site_id: string;
  industry_id: string;
  business_category_id: string | null;
  template_id: string | null;
  selected_by: string;
  created_at: string;
  updated_at: string;
};

export type SiteBusinessProfile = {
  id: string;
  site_id: string;
  company_name: string | null;
  tagline: string | null;
  short_description: string | null;
  full_description: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state_region: string | null;
  country_code: string | null;
  postal_code: string | null;
  map_embed_url: string | null;
  working_hours: unknown;
  social_links: unknown;
  created_at: string;
  updated_at: string;
};

export type SiteSectionOverride = {
  id: string;
  site_id: string;
  template_section_id: string;
  is_enabled: boolean;
  display_order: number | null;
  content_override: unknown;
  settings_override: unknown;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type SiteThemeOverride = {
  id: string;
  site_id: string;
  theme_preset_id: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  font_preset: "professional_sans" | "modern_clean" | "classic_corporate" | "friendly_local" | null;
  button_style: "square" | "soft_rounded" | "pill" | null;
  radius_preset: "minimal" | "balanced" | "rounded" | null;
  created_at: string;
  updated_at: string;
};

export type SiteMedia = {
  id: string;
  site_id: string;
  organization_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  usage_type: "logo" | "hero" | "service" | "gallery" | "about" | "favicon" | "general";
  created_by: string;
  created_at: string;
  updated_at: string;
};
