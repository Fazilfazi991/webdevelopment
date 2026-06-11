import { getSectionSchema } from "@/lib/site-renderer/section-schemas";
import { buildAiPrompt } from "@/lib/ai/prompt-builder";
import { aiMaxRetries, aiModel, aiTimeoutMs, getAiProvider } from "@/lib/ai/provider";
import { controlledContentOutputSchema, rewriteOutputSchema, type ControlledContentOutput } from "@/lib/ai/schemas";
import { assertUsageAvailable, recordUsage } from "@/lib/ai/usage";
import { filteredSectionRecommendations, safeErrorSummary, validateProviderOutput } from "@/lib/ai/safety";
import type { AiRequestType, AiSiteProfile } from "@/lib/ai/types";
import type { requireSiteSetup } from "@/lib/setup";

type Supabase = Awaited<ReturnType<typeof requireSiteSetup>>["supabase"];

type SuggestionInsert = {
  site_id: string;
  request_id: string;
  section_key: string | null;
  field_key: string;
  suggestion_type: string;
  language: string;
  original_value: unknown;
  suggested_value: unknown;
};

function pushSuggestion(suggestions: SuggestionInsert[], base: Omit<SuggestionInsert, "field_key" | "suggested_value" | "original_value">, fieldKey: string, suggestedValue: unknown, originalValue: unknown = null) {
  if (suggestedValue === undefined || suggestedValue === null || suggestedValue === "") return;
  suggestions.push({ ...base, field_key: fieldKey, suggested_value: suggestedValue, original_value: originalValue });
}

function suggestionsFromOutput(siteId: string, requestId: string, output: ControlledContentOutput, language: string): SuggestionInsert[] {
  const suggestions: SuggestionInsert[] = [];
  const businessBase = { site_id: siteId, request_id: requestId, section_key: null, suggestion_type: "business_profile", language };
  pushSuggestion(suggestions, businessBase, "company_name", output.businessProfile.companyName);
  pushSuggestion(suggestions, businessBase, "tagline", output.businessProfile.tagline);
  pushSuggestion(suggestions, businessBase, "short_description", output.businessProfile.shortDescription);
  pushSuggestion(suggestions, businessBase, "full_description", output.businessProfile.fullDescription);

  const heroBase = { site_id: siteId, request_id: requestId, section_key: "hero-split-image", suggestion_type: "section_field", language };
  pushSuggestion(suggestions, heroBase, "title", output.hero.heading);
  pushSuggestion(suggestions, heroBase, "body", output.hero.description);
  pushSuggestion(suggestions, heroBase, "primaryAction.label", output.hero.primaryCtaLabel);
  pushSuggestion(suggestions, heroBase, "secondaryAction.label", output.hero.secondaryCtaLabel);

  const aboutBase = { site_id: siteId, request_id: requestId, section_key: "about-image-right", suggestion_type: "section_field", language };
  pushSuggestion(suggestions, aboutBase, "title", output.about.heading);
  pushSuggestion(suggestions, aboutBase, "body", output.about.description);
  pushSuggestion(suggestions, aboutBase, "bullets", output.about.bullets);

  pushSuggestion(suggestions, { site_id: siteId, request_id: requestId, section_key: "services-card-grid", suggestion_type: "section_field", language }, "items", output.services.map((item) => ({ title: item.title, body: item.description })));
  pushSuggestion(suggestions, { site_id: siteId, request_id: requestId, section_key: "why-choose-us-grid", suggestion_type: "section_field", language }, "items", output.whyChooseUs.map((item) => ({ title: item.title, body: item.description })));
  pushSuggestion(suggestions, { site_id: siteId, request_id: requestId, section_key: "faq-accordion", suggestion_type: "section_field", language }, "items", output.faq);
  pushSuggestion(suggestions, { site_id: siteId, request_id: requestId, section_key: "contact-cta-banner", suggestion_type: "section_field", language }, "title", output.cta.title);
  pushSuggestion(suggestions, { site_id: siteId, request_id: requestId, section_key: "contact-cta-banner", suggestion_type: "section_field", language }, "body", output.cta.body);
  pushSuggestion(suggestions, { site_id: siteId, request_id: requestId, section_key: null, suggestion_type: "seo", language }, "seo_title", output.seo.title);
  pushSuggestion(suggestions, { site_id: siteId, request_id: requestId, section_key: null, suggestion_type: "seo", language }, "seo_description", output.seo.description);
  pushSuggestion(suggestions, { site_id: siteId, request_id: requestId, section_key: null, suggestion_type: "seo", language }, "og_title", output.seo.ogTitle);
  pushSuggestion(suggestions, { site_id: siteId, request_id: requestId, section_key: null, suggestion_type: "seo", language }, "og_description", output.seo.ogDescription);
  pushSuggestion(suggestions, { site_id: siteId, request_id: requestId, section_key: null, suggestion_type: "seo", language }, "seo_keywords", output.seo.keywords?.join(", "));
  pushSuggestion(suggestions, { site_id: siteId, request_id: requestId, section_key: null, suggestion_type: "section_recommendation", language }, "recommended_sections", filteredSectionRecommendations(output));
  pushSuggestion(suggestions, { site_id: siteId, request_id: requestId, section_key: null, suggestion_type: "image_requirement", language }, "image_checklist", output.imageChecklist);
  return suggestions;
}

export async function generateAiSuggestions({
  supabase,
  siteId,
  userId,
  requestType,
  profile,
  payload,
  promptTemplate
}: {
  supabase: Supabase;
  siteId: string;
  userId: string;
  requestType: AiRequestType;
  profile: AiSiteProfile | null;
  payload: Record<string, unknown>;
  promptTemplate?: string | null;
}) {
  const provider = getAiProvider();
  if (!provider?.isConfigured()) throw new Error("AI_PROVIDER_NOT_CONFIGURED");
  await assertUsageAvailable(supabase, siteId);

  const { data: request, error: insertError } = await supabase
    .from("ai_generation_requests")
    .insert({
      site_id: siteId,
      requested_by: userId,
      request_type: requestType,
      provider: provider.name,
      model: aiModel(),
      input_snapshot: { requestType, profile, payload },
      status: "pending"
    })
    .select("id")
    .single<{ id: string }>();
  if (insertError || !request) throw new Error("AI_REQUEST_CREATE_FAILED");

  let lastError: unknown = null;
  for (let attempt = 0; attempt <= aiMaxRetries(); attempt += 1) {
    try {
      const result = await provider.generate({
        requestType,
        prompt: buildAiPrompt(requestType, profile, promptTemplate),
        payload: { ...payload, profile },
        model: aiModel(),
        timeoutMs: aiTimeoutMs()
      });
      const validated = validateProviderOutput(requestType, result.output);
      const outputSnapshot = ["rewrite", "shorten", "grammar_fix", "translation"].includes(requestType)
        ? rewriteOutputSchema.parse(validated)
        : controlledContentOutputSchema.parse(validated);
      const { error: updateError } = await supabase
        .from("ai_generation_requests")
        .update({
          provider: result.provider,
          model: result.model,
          output_snapshot: outputSnapshot,
          status: "completed",
          tokens_input: result.tokensInput,
          tokens_output: result.tokensOutput,
          estimated_cost: result.estimatedCost,
          completed_at: new Date().toISOString()
        })
        .eq("id", request.id);
      if (updateError) throw updateError;

      await recordUsage(supabase, siteId, result.tokensInput + result.tokensOutput);
      const language = profile?.preferred_language ?? "English";
      const suggestions = ["rewrite", "shorten", "grammar_fix", "translation"].includes(requestType)
        ? [
            {
              site_id: siteId,
              request_id: request.id,
              section_key: typeof payload.sectionKey === "string" ? payload.sectionKey : null,
              field_key: String(payload.fieldKey ?? "text"),
              suggestion_type: requestType === "translation" ? "translation" : "section_field",
              language: String(payload.language ?? language),
              original_value: payload.currentValue ?? null,
              suggested_value: rewriteOutputSchema.parse(outputSnapshot).value
            }
          ]
        : suggestionsFromOutput(siteId, request.id, controlledContentOutputSchema.parse(outputSnapshot), language);

      const safeSuggestions = suggestions.filter((item) => {
        if (!item.section_key) return true;
        const schema = getSectionSchema(item.section_key);
        return Boolean(schema);
      });
      if (safeSuggestions.length) await supabase.from("ai_content_suggestions").insert(safeSuggestions);
      return request.id;
    } catch (error) {
      lastError = error;
    }
  }

  await supabase
    .from("ai_generation_requests")
    .update({
      status: "failed",
      error_code: "AI_SAFE_FAILURE",
      error_summary: safeErrorSummary(lastError),
      completed_at: new Date().toISOString()
    })
    .eq("id", request.id);
  throw new Error("AI_SAFE_FAILURE");
}
