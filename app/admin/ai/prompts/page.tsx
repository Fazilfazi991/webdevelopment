import { updatePromptVersionAction } from "@/app/ai-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, inputClassName } from "@/components/ui/field";
import { requireAdmin } from "@/lib/data";

export default async function AdminAiPromptsPage({ searchParams }: { searchParams: { message?: string; error?: string } }) {
  const { supabase } = await requireAdmin();
  const { data: prompts } = await supabase.from("ai_prompt_versions").select("*").order("key").order("version", { ascending: false });
  return (
    <div className="grid gap-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">Internal metadata</p>
        <h2 className="text-2xl font-bold text-ink">Prompt Versions</h2>
        <p className="mt-1 text-sm text-muted">Prompt templates are platform-admin only. Provider secrets never belong here.</p>
      </div>
      <StatusMessage message={searchParams.message} error={searchParams.error} />
      <div className="grid gap-4">
        {(prompts ?? []).map((prompt) => (
          <Card key={prompt.id} className="p-4">
            <form action={updatePromptVersionAction} className="grid gap-3">
              <input type="hidden" name="id" value={prompt.id} />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-ink">{prompt.key} v{prompt.version}</h3>
                <label className="flex items-center gap-2 text-sm font-semibold text-ink"><input type="checkbox" name="isActive" defaultChecked={prompt.is_active} /> Active</label>
              </div>
              <Field label="Purpose"><input className={inputClassName} name="purpose" defaultValue={prompt.purpose} /></Field>
              <Field label="Prompt template"><textarea className={inputClassName} name="promptTemplate" defaultValue={prompt.prompt_template} rows={5} /></Field>
              <Button type="submit">Save Prompt Metadata</Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
