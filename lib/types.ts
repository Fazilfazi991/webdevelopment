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
  published_at: string | null;
  published_by: string | null;
  publication_status: "draft" | "published" | "unpublished" | "suspended";
  primary_subdomain: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_media_id: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  last_published_version_id: string | null;
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
  signed_url?: string;
};

export type SiteVersion = {
  id: string;
  site_id: string;
  version_number: number;
  snapshot: unknown;
  created_by: string;
  created_at: string;
};

export type SiteDomain = {
  id: string;
  site_id: string;
  organization_id: string;
  domain: string;
  domain_type: "platform_subdomain" | "custom_domain";
  status: "pending" | "verified" | "active" | "failed" | "removed";
  verification_token: string | null;
  verification_method: string | null;
  verification_details: unknown;
  is_primary: boolean;
  verified_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type ContactLead = {
  id: string;
  site_id: string;
  organization_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  subject: string | null;
  message: string;
  source_page: string | null;
  source_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  status: "new" | "contacted" | "qualified" | "closed" | "spam";
  is_read: boolean;
  submitted_at: string;
  created_at: string;
  updated_at: string;
};

export type LeadNotificationSetting = {
  id: string;
  site_id: string;
  notification_email: string | null;
  send_email_notifications: boolean;
  created_at: string;
  updated_at: string;
};

export type SitePublishHistory = {
  id: string;
  site_id: string;
  site_version_id: string | null;
  action: "published" | "republished" | "unpublished";
  performed_by: string;
  created_at: string;
};

export type AgencyRole = "owner" | "admin" | "developer" | "viewer";

export type Agency = {
  id: string;
  name: string;
  slug: string;
  country_code: string;
  website: string | null;
  logo_url: string | null;
  support_email: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type AgencyMember = {
  id: string;
  agency_id: string;
  user_id: string;
  role: AgencyRole;
  invited_by: string | null;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Client = {
  id: string;
  agency_id: string;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  country_code: string | null;
  notes: string | null;
  status: "active" | "invited" | "inactive" | "archived";
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type SitePermission =
  | "edit_content"
  | "upload_media"
  | "edit_design"
  | "manage_sections"
  | "preview_site"
  | "publish_site"
  | "manage_domains"
  | "view_leads"
  | "update_leads"
  | "invite_users"
  | "transfer_ownership"
  | "manage_billing";

export type SiteAccessRole = "agency_owner" | "agency_admin" | "developer" | "client_owner" | "client_editor" | "client_viewer";

export type SiteAccessMember = {
  id: string;
  site_id: string;
  user_id: string;
  access_role: SiteAccessRole;
  permissions: Partial<Record<SitePermission, boolean>>;
  granted_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientInvitation = {
  id: string;
  client_id: string;
  site_id: string;
  email: string;
  invitation_token: string;
  invitation_status: "pending" | "accepted" | "expired" | "cancelled";
  access_role: "client_owner" | "client_editor" | "client_viewer";
  expires_at: string;
  invited_by: string;
  accepted_by: string | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SiteOwnership = {
  id: string;
  site_id: string;
  ownership_type: "organization" | "agency" | "client";
  owner_organization_id: string | null;
  owner_agency_id: string | null;
  owner_client_user_id: string | null;
  transferred_by: string | null;
  transferred_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SiteOwnershipTransfer = {
  id: string;
  site_id: string;
  from_ownership_type: string;
  to_ownership_type: string;
  from_owner_reference: string | null;
  to_owner_reference: string | null;
  status: "pending" | "approved" | "cancelled" | "completed";
  requested_by: string;
  approved_by: string | null;
  requested_at: string;
  completed_at: string | null;
  created_at: string;
};

export type SiteActivityLog = {
  id: string;
  site_id: string;
  actor_user_id: string | null;
  action_type: string;
  action_summary: string;
  metadata: Record<string, unknown>;
  created_at: string;
};
