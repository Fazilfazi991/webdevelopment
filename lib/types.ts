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

export type SetupStep = "website_type" | "industry" | "business_category" | "template" | "template_selected";

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
