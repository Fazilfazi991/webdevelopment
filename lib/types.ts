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
  created_by: string;
  created_at: string;
  updated_at: string;
};
