import { sectionRegistry } from "@/components/site-renderer/section-registry";
import { controlledContentOutputSchema, rewriteOutputSchema, type ControlledContentOutput } from "@/lib/ai/schemas";
import type { AiRequestType } from "@/lib/ai/types";

export function listFromTextarea(value?: string) {
  return (value ?? "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function safeErrorSummary(error: unknown) {
  if (error instanceof Error && error.name === "AbortError") return "The AI provider timed out before returning a safe response.";
  return "The AI provider could not return a valid structured response.";
}

export function isKnownSectionKey(sectionKey: string) {
  return Object.prototype.hasOwnProperty.call(sectionRegistry, sectionKey);
}

export function validateProviderOutput(requestType: AiRequestType, output: unknown) {
  if (["rewrite", "shorten", "grammar_fix", "translation"].includes(requestType)) {
    return rewriteOutputSchema.parse(output);
  }
  return controlledContentOutputSchema.parse(output);
}

export function filteredSectionRecommendations(output: ControlledContentOutput) {
  return output.recommendedSections.filter((item) => isKnownSectionKey(item.sectionKey));
}

export function estimateTokens(value: unknown) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return Math.ceil((text?.length ?? 0) / 4);
}
