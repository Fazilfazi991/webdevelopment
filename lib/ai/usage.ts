import type { requireSiteSetup } from "@/lib/setup";

type Supabase = Awaited<ReturnType<typeof requireSiteSetup>>["supabase"];

export async function ensureUsageLimit(supabase: Supabase, siteId: string) {
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const requestLimit = Number(process.env.AI_DEFAULT_REQUEST_LIMIT || 50);
  const tokenLimit = Number(process.env.AI_DEFAULT_TOKEN_LIMIT || 100000);

  const { data } = await supabase
    .from("ai_usage_limits")
    .select("*")
    .eq("scope_type", "site")
    .eq("scope_id", siteId)
    .lte("period_start", now.toISOString())
    .gt("period_end", now.toISOString())
    .maybeSingle<{ id: string; request_limit: number; request_count: number; token_limit: number; token_count: number }>();

  if (data) return data;

  const { data: inserted } = await supabase
    .from("ai_usage_limits")
    .insert({
      scope_type: "site",
      scope_id: siteId,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      request_limit: requestLimit,
      token_limit: tokenLimit
    })
    .select("*")
    .single<{ id: string; request_limit: number; request_count: number; token_limit: number; token_count: number }>();
  return inserted;
}

export async function assertUsageAvailable(supabase: Supabase, siteId: string) {
  const limit = await ensureUsageLimit(supabase, siteId);
  if (!limit) return;
  if (limit.request_count >= limit.request_limit) throw new Error("AI_USAGE_LIMIT_REQUESTS");
  if (limit.token_count >= limit.token_limit) throw new Error("AI_USAGE_LIMIT_TOKENS");
}

export async function recordUsage(supabase: Supabase, siteId: string, tokens: number) {
  const limit = await ensureUsageLimit(supabase, siteId);
  if (!limit) return;
  await supabase
    .from("ai_usage_limits")
    .update({
      request_count: limit.request_count + 1,
      token_count: limit.token_count + tokens
    })
    .eq("id", limit.id);
}
