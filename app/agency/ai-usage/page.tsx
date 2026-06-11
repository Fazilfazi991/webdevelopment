import { Card } from "@/components/ui/card";
import { requireAgencyContext } from "@/lib/access-control";

export default async function AgencyAiUsagePage() {
  const { supabase, agency } = await requireAgencyContext();
  const { data: mappings } = await supabase.from("agency_site_clients").select("site_id,sites(name)").eq("agency_id", agency.id);
  const siteIds = [...new Set((mappings ?? []).map((item) => item.site_id).filter(Boolean))];
  const [{ data: requests }, { data: limits }] = await Promise.all([
    siteIds.length ? supabase.from("ai_generation_requests").select("*").in("site_id", siteIds).order("created_at", { ascending: false }).limit(50) : { data: [] },
    siteIds.length ? supabase.from("ai_usage_limits").select("*").eq("scope_type", "site").in("scope_id", siteIds) : { data: [] }
  ]);
  const requestCount = requests?.length ?? 0;
  const tokenCount = (requests ?? []).reduce((sum, request) => sum + Number(request.tokens_input ?? 0) + Number(request.tokens_output ?? 0), 0);
  const requestLimit = (limits ?? []).reduce((sum, limit) => sum + Number(limit.request_limit ?? 0), 0);
  return (
    <div className="grid gap-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">Agency AI</p>
        <h2 className="text-2xl font-bold text-ink">AI Usage</h2>
        <p className="mt-1 text-sm text-muted">Usage only covers websites connected to this agency.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4"><p className="text-xs font-semibold uppercase tracking-widest text-muted">Requests used</p><p className="mt-2 text-3xl font-bold text-ink">{requestCount}</p></Card>
        <Card className="p-4"><p className="text-xs font-semibold uppercase tracking-widest text-muted">Remaining requests</p><p className="mt-2 text-3xl font-bold text-ink">{Math.max(requestLimit - requestCount, 0)}</p></Card>
        <Card className="p-4"><p className="text-xs font-semibold uppercase tracking-widest text-muted">Token summary</p><p className="mt-2 text-3xl font-bold text-ink">{tokenCount}</p></Card>
      </div>
      <Card className="p-4">
        <h3 className="font-bold text-ink">Recent AI actions</h3>
        <div className="mt-3 grid gap-2">
          {(requests ?? []).map((request) => (
            <div key={request.id} className="rounded-app border border-line bg-white p-3 text-sm">
              <p className="font-semibold text-ink">{request.request_type} · {request.status}</p>
              <p className="text-muted">{request.provider ?? "provider"} · {Number(request.tokens_input ?? 0) + Number(request.tokens_output ?? 0)} tokens</p>
            </div>
          ))}
          {requests?.length ? null : <p className="text-sm text-muted">No AI actions for agency websites yet.</p>}
        </div>
      </Card>
    </div>
  );
}
