import { Bot, CircleAlert, Gauge, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/data";

export default async function AdminAiPage() {
  const { supabase } = await requireAdmin();
  const [{ data: requests }, { data: prompts }, { data: limits }] = await Promise.all([
    supabase.from("ai_generation_requests").select("request_type,provider,status,tokens_input,tokens_output,estimated_cost,created_at,error_summary").order("created_at", { ascending: false }).limit(100),
    supabase.from("ai_prompt_versions").select("id,key,version,is_active").order("key").order("version", { ascending: false }),
    supabase.from("ai_usage_limits").select("request_limit,request_count,token_limit,token_count").limit(100)
  ]);
  const totalTokens = (requests ?? []).reduce((sum, request) => sum + Number(request.tokens_input ?? 0) + Number(request.tokens_output ?? 0), 0);
  const failures = (requests ?? []).filter((request) => request.status === "failed");
  const byStatus = (requests ?? []).reduce<Record<string, number>>((acc, request) => {
    acc[request.status] = (acc[request.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">Platform AI</p>
          <h2 className="text-2xl font-bold text-ink">AI Overview</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/admin/ai/prompts" variant="secondary">Prompt Versions</ButtonLink>
          <ButtonLink href="/admin/ai/usage" variant="secondary">Usage Limits</ButtonLink>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4"><Sparkles size={18} className="text-brand-700" /><p className="mt-2 text-3xl font-bold text-ink">{requests?.length ?? 0}</p><p className="text-sm text-muted">Recent requests</p></Card>
        <Card className="p-4"><Gauge size={18} className="text-brand-700" /><p className="mt-2 text-3xl font-bold text-ink">{totalTokens}</p><p className="text-sm text-muted">Recent tokens</p></Card>
        <Card className="p-4"><CircleAlert size={18} className="text-danger" /><p className="mt-2 text-3xl font-bold text-ink">{failures.length}</p><p className="text-sm text-muted">Failures</p></Card>
        <Card className="p-4"><Bot size={18} className="text-brand-700" /><p className="mt-2 text-3xl font-bold text-ink">{prompts?.filter((prompt) => prompt.is_active).length ?? 0}</p><p className="text-sm text-muted">Active prompts</p></Card>
      </div>
      <Card className="p-4">
        <h3 className="font-bold text-ink">Requests by status</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          {Object.entries(byStatus).map(([status, count]) => <div key={status} className="rounded-app border border-line bg-white p-3 text-sm font-semibold text-ink">{status}: {count}</div>)}
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="font-bold text-ink">Recent AI actions</h3>
        <div className="mt-3 grid gap-2">
          {(requests ?? []).slice(0, 20).map((request, index) => (
            <div key={`${request.created_at}-${index}`} className="rounded-app border border-line bg-white p-3 text-sm">
              <p className="font-semibold text-ink">{request.request_type} · {request.provider ?? "provider"} · {request.status}</p>
              <p className="mt-1 text-muted">{request.status === "failed" ? request.error_summary || "Safe failure recorded" : `${Number(request.tokens_input ?? 0) + Number(request.tokens_output ?? 0)} tokens`}</p>
            </div>
          ))}
          {requests?.length ? null : <p className="text-sm text-muted">No AI requests yet.</p>}
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="font-bold text-ink">Usage limits foundation</h3>
        <p className="mt-2 text-sm text-muted">{limits?.length ?? 0} usage scopes are currently tracked. Billing and credits are intentionally not part of Phase 7.</p>
      </Card>
    </div>
  );
}
