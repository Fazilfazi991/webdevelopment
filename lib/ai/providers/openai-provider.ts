import type { AiProvider, AiProviderInput, AiProviderResult } from "@/lib/ai/types";
import { estimateTokens } from "@/lib/ai/safety";

export class OpenAiProvider implements AiProvider {
  name = "openai";

  isConfigured() {
    return Boolean(process.env.AI_API_KEY);
  }

  async generate(input: AiProviderInput): Promise<AiProviderResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), input.timeoutMs);
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AI_API_KEY}`
        },
        body: JSON.stringify({
          model: input.model,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: input.prompt },
            { role: "user", content: JSON.stringify(input.payload) }
          ]
        })
      });
      if (!response.ok) throw new Error("AI_PROVIDER_ERROR");
      const body = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      };
      const content = body.choices?.[0]?.message?.content;
      if (!content) throw new Error("AI_EMPTY_RESPONSE");
      const output = JSON.parse(content);
      return {
        output,
        tokensInput: body.usage?.prompt_tokens ?? estimateTokens(input.payload),
        tokensOutput: body.usage?.completion_tokens ?? estimateTokens(output),
        estimatedCost: 0,
        provider: this.name,
        model: input.model
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
