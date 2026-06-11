import { updateUsageLimitAction } from "@/app/ai-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, inputClassName } from "@/components/ui/field";
import { requireAdmin } from "@/lib/data";

export default async function AdminAiUsagePage({ searchParams }: { searchParams: { message?: string; error?: string } }) {
  const { supabase } = await requireAdmin();
  const { data: limits } = await supabase.from("ai_usage_limits").select("*").order("created_at", { ascending: false }).limit(100);
  return (
    <div className="grid gap-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">Usage controls</p>
        <h2 className="text-2xl font-bold text-ink">AI Usage Limits</h2>
      </div>
      <StatusMessage message={searchParams.message} error={searchParams.error} />
      <div className="grid gap-4">
        {(limits ?? []).map((limit) => (
          <Card key={limit.id} className="p-4">
            <form action={updateUsageLimitAction} className="grid gap-3 md:grid-cols-[1fr_160px_160px_auto] md:items-end">
              <input type="hidden" name="id" value={limit.id} />
              <div>
                <p className="font-bold text-ink">{limit.scope_type}</p>
                <p className="text-sm text-muted">{limit.scope_id}</p>
                <p className="mt-1 text-sm text-muted">{limit.request_count} requests · {limit.token_count} tokens used</p>
              </div>
              <Field label="Request limit"><input className={inputClassName} name="requestLimit" type="number" defaultValue={limit.request_limit} /></Field>
              <Field label="Token limit"><input className={inputClassName} name="tokenLimit" type="number" defaultValue={limit.token_limit} /></Field>
              <Button type="submit">Save</Button>
            </form>
          </Card>
        ))}
        {limits?.length ? null : <Card className="p-4 text-sm text-muted">Usage rows appear after AI is used by a site.</Card>}
      </div>
    </div>
  );
}
