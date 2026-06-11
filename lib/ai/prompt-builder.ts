import type { AiRequestType, AiSiteProfile } from "@/lib/ai/types";

const baseSafety = [
  "Return strict JSON only.",
  "Never include arbitrary HTML, CSS, scripts, provider secrets, domain changes, publishing actions, invitations, ownership transfers, billing changes, or permission changes.",
  "Use only approved structured fields and keep every suggestion reviewable before application.",
  "Respect existing website character limits."
].join(" ");

export function buildAiPrompt(requestType: AiRequestType, profile: AiSiteProfile | null, promptTemplate?: string | null) {
  const business = profile?.business_name ? `Business: ${profile.business_name}.` : "Business details are provided in the JSON payload.";
  const tone = profile?.tone ? `Tone: ${profile.tone}.` : "";
  const language = profile?.preferred_language ? `Primary language: ${profile.preferred_language}.` : "";
  return [baseSafety, promptTemplate, `Request type: ${requestType}.`, business, tone, language].filter(Boolean).join("\n");
}
