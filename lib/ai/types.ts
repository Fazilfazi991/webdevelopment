export const aiRequestTypes = [
  "full_site_content",
  "section_content",
  "rewrite",
  "shorten",
  "grammar_fix",
  "seo_suggestion",
  "translation",
  "section_recommendation",
  "image_requirements"
] as const;

export type AiRequestType = (typeof aiRequestTypes)[number];
export type AiSuggestionStatus = "pending" | "approved" | "rejected" | "applied" | "expired";
export type AiSuggestionType = "business_profile" | "section_field" | "seo" | "translation" | "section_recommendation" | "image_requirement";

export type AiSiteProfile = {
  id: string;
  site_id: string;
  business_name: string | null;
  business_type: string | null;
  industry: string | null;
  target_audience: string | null;
  primary_location: string | null;
  service_areas: string[];
  services: string[];
  unique_selling_points: string[];
  tone: string | null;
  preferred_language: string | null;
  additional_languages: string[];
  primary_goal: string | null;
  cta_preference: string | null;
  contact_preference: string | null;
  special_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AiGenerationRequest = {
  id: string;
  site_id: string;
  requested_by: string;
  request_type: AiRequestType;
  provider: string | null;
  model: string | null;
  input_snapshot: Record<string, unknown>;
  output_snapshot: Record<string, unknown>;
  status: "pending" | "completed" | "failed" | "cancelled";
  error_code: string | null;
  error_summary: string | null;
  tokens_input: number;
  tokens_output: number;
  estimated_cost: number;
  created_at: string;
  completed_at: string | null;
};

export type AiContentSuggestion = {
  id: string;
  site_id: string;
  request_id: string | null;
  section_key: string | null;
  field_key: string;
  suggestion_type: AiSuggestionType;
  language: string;
  original_value: unknown;
  suggested_value: unknown;
  status: AiSuggestionStatus;
  applied_by: string | null;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AiProviderInput = {
  requestType: AiRequestType;
  prompt: string;
  payload: Record<string, unknown>;
  model: string;
  timeoutMs: number;
};

export type AiProviderResult = {
  output: unknown;
  tokensInput: number;
  tokensOutput: number;
  estimatedCost: number;
  provider: string;
  model: string;
};

export interface AiProvider {
  name: string;
  isConfigured(): boolean;
  generate(input: AiProviderInput): Promise<AiProviderResult>;
}
