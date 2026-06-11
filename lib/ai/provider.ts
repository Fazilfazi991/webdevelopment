import type { AiProvider } from "@/lib/ai/types";
import { MockAiProvider } from "@/lib/ai/providers/mock-provider";
import { OpenAiProvider } from "@/lib/ai/providers/openai-provider";

export function getAiProvider(): AiProvider | null {
  const provider = (process.env.AI_PROVIDER || "mock").toLowerCase();
  if (provider === "mock") return new MockAiProvider();
  if (provider === "openai") return new OpenAiProvider();
  return null;
}

export function aiModel() {
  return process.env.AI_MODEL || "mock-controlled-content-v1";
}

export function aiTimeoutMs() {
  return Number(process.env.AI_REQUEST_TIMEOUT_MS || 15000);
}

export function aiMaxRetries() {
  return Math.max(0, Number(process.env.AI_MAX_RETRIES || 1));
}

export function isAiAvailable() {
  const provider = getAiProvider();
  return Boolean(provider?.isConfigured());
}
