import { Check, FileText, Image as ImageIcon, Languages, Sparkles, X } from "lucide-react";
import {
  applyAiSuggestionAction,
  generateFieldAiSuggestionAction,
  generateSiteAiSuggestionsAction,
  rejectAiSuggestionAction,
  saveAiProfileAction
} from "@/app/ai-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { Field, inputClassName } from "@/components/ui/field";
import { hasPermission } from "@/lib/access-control";
import { isAiAvailable } from "@/lib/ai/provider";
import { loadEditorContext } from "@/lib/site-editor/editor-loader";
import { requireSiteSetup } from "@/lib/setup";
import type { AiContentSuggestion, AiGenerationRequest, AiSiteProfile } from "@/lib/types";

function displayValue(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => (typeof item === "string" ? item : JSON.stringify(item))).join("\n");
  if (value && typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value ?? "");
}

function routeBase(siteId: string, isClient: boolean) {
  return isClient ? `/client/websites/${siteId}` : `/dashboard/websites/${siteId}`;
}

export async function AiSetupPage({
  siteId,
  searchParams
}: {
  siteId: string;
  searchParams: { message?: string; error?: string };
}) {
  const setup = await requireSiteSetup(siteId);
  const canEdit = hasPermission(setup.siteAccess, "edit_content", setup.membershipRole);
  const isClient = Boolean(setup.siteAccess);
  const base = routeBase(setup.site.id, isClient);
  const { data: profile } = await setup.supabase.from("ai_site_profiles").select("*").eq("site_id", setup.site.id).maybeSingle<AiSiteProfile>();
  const available = isAiAvailable();

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">Controlled AI assistance</p>
          <h2 className="text-2xl font-bold text-ink">Set up content suggestions</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">AI can suggest approved text fields only. You review suggestions before anything is applied.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`${base}/editor`} variant="secondary">Set Up Manually</ButtonLink>
          <ButtonLink href={`${base}/ai-suggestions`} variant="secondary">Review Suggestions</ButtonLink>
        </div>
      </div>
      <StatusMessage message={searchParams.message} error={searchParams.error} />
      {!available ? (
        <Card className="p-4 text-sm leading-6 text-muted">
          AI is not configured for this environment. Set `AI_PROVIDER=mock` for local testing, or configure a server-side provider key. Manual editing remains available.
        </Card>
      ) : null}
      {!canEdit ? (
        <Card className="p-4 text-sm leading-6 text-muted">Your access is preview-only, so AI generation and application controls are disabled.</Card>
      ) : null}

      <Card className="p-5">
        <form action={saveAiProfileAction} className="grid gap-5">
          <input type="hidden" name="siteId" value={setup.site.id} />
          <section className="grid gap-3">
            <h3 className="font-bold text-ink">Business Basics</h3>
            <Field label="Business name"><input className={inputClassName} name="businessName" defaultValue={profile?.business_name ?? setup.site.name} maxLength={80} required disabled={!canEdit} /></Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Business category"><input className={inputClassName} name="businessType" defaultValue={profile?.business_type ?? ""} maxLength={80} disabled={!canEdit} /></Field>
              <Field label="Primary location"><input className={inputClassName} name="primaryLocation" defaultValue={profile?.primary_location ?? ""} maxLength={120} disabled={!canEdit} /></Field>
            </div>
            <Field label="Industry"><input className={inputClassName} name="industry" defaultValue={profile?.industry ?? ""} maxLength={80} disabled={!canEdit} /></Field>
            <Field label="Service areas"><textarea className={inputClassName} name="serviceAreas" defaultValue={(profile?.service_areas ?? []).join("\n")} rows={3} disabled={!canEdit} /></Field>
            <Field label="Main services"><textarea className={inputClassName} name="services" defaultValue={(profile?.services ?? []).join("\n")} rows={4} disabled={!canEdit} /></Field>
          </section>

          <section className="grid gap-3">
            <h3 className="font-bold text-ink">Business Positioning</h3>
            <Field label="What makes the business different?"><textarea className={inputClassName} name="uniqueSellingPoints" defaultValue={(profile?.unique_selling_points ?? []).join("\n")} rows={3} disabled={!canEdit} /></Field>
            <Field label="Ideal customers"><textarea className={inputClassName} name="targetAudience" defaultValue={profile?.target_audience ?? ""} rows={3} disabled={!canEdit} /></Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Main website goal"><input className={inputClassName} name="primaryGoal" defaultValue={profile?.primary_goal ?? ""} disabled={!canEdit} /></Field>
              <Field label="Preferred contact action"><input className={inputClassName} name="ctaPreference" defaultValue={profile?.cta_preference ?? "Request a Quote"} disabled={!canEdit} /></Field>
            </div>
            <Field label="Contact preference"><input className={inputClassName} name="contactPreference" defaultValue={profile?.contact_preference ?? ""} disabled={!canEdit} /></Field>
          </section>

          <section className="grid gap-3">
            <h3 className="font-bold text-ink">Tone and Language</h3>
            <Field label="Tone">
              <select className={inputClassName} name="tone" defaultValue={profile?.tone ?? "Professional"} disabled={!canEdit}>
                {["Professional", "Friendly", "Premium", "Simple and direct", "Technical"].map((tone) => <option key={tone}>{tone}</option>)}
              </select>
            </Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Primary language"><input className={inputClassName} name="preferredLanguage" defaultValue={profile?.preferred_language ?? "English"} required disabled={!canEdit} /></Field>
              <Field label="Additional languages">
                <select className={inputClassName} name="additionalLanguages" multiple defaultValue={profile?.additional_languages ?? []} disabled={!canEdit}>
                  {["English", "Arabic", "Hindi", "Malayalam"].map((language) => <option key={language}>{language}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Special notes"><textarea className={inputClassName} name="specialNotes" defaultValue={profile?.special_notes ?? ""} rows={3} disabled={!canEdit} /></Field>
          </section>
          <Button type="submit" disabled={!canEdit}>Save AI Setup</Button>
        </form>
      </Card>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-ink">Generate Suggestions</h3>
            <p className="mt-1 text-sm leading-6 text-muted">Creates reviewable suggestions for business profile, hero, about, services, FAQ, CTA, SEO, section recommendations, and image checklist.</p>
          </div>
          <form action={generateSiteAiSuggestionsAction}>
            <input type="hidden" name="siteId" value={setup.site.id} />
            <Button type="submit" disabled={!canEdit || !available}>
              <Sparkles size={16} />
              Generate Website Content Suggestions
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

export async function AiSuggestionsPage({
  siteId,
  searchParams
}: {
  siteId: string;
  searchParams: { message?: string; error?: string };
}) {
  const setup = await requireSiteSetup(siteId);
  const canEdit = hasPermission(setup.siteAccess, "edit_content", setup.membershipRole);
  const isClient = Boolean(setup.siteAccess);
  const base = routeBase(setup.site.id, isClient);
  const [{ data: suggestions }, { data: requests }, { data: usage }] = await Promise.all([
    setup.supabase.from("ai_content_suggestions").select("*").eq("site_id", setup.site.id).order("created_at", { ascending: false }).limit(80).returns<AiContentSuggestion[]>(),
    setup.supabase.from("ai_generation_requests").select("*").eq("site_id", setup.site.id).order("created_at", { ascending: false }).limit(20).returns<AiGenerationRequest[]>(),
    setup.supabase.from("ai_usage_limits").select("*").eq("scope_type", "site").eq("scope_id", setup.site.id).order("created_at", { ascending: false }).limit(1).maybeSingle<{ request_limit: number; request_count: number; token_limit: number; token_count: number }>()
  ]);
  const grouped = (suggestions ?? []).reduce<Record<string, AiContentSuggestion[]>>((acc, suggestion) => {
    acc[suggestion.status] = [...(acc[suggestion.status] ?? []), suggestion];
    return acc;
  }, {});

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">AI review queue</p>
          <h2 className="text-2xl font-bold text-ink">Suggestions</h2>
          <p className="mt-1 text-sm leading-6 text-muted">Pending suggestions stay separate from live content until you apply them.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`${base}/ai-setup`} variant="secondary">AI Setup</ButtonLink>
          <ButtonLink href={`${base}/editor`} variant="secondary">Open Editor</ButtonLink>
        </div>
      </div>
      <StatusMessage message={searchParams.message} error={searchParams.error} />
      <div className="grid gap-4 md:grid-cols-4">
        {["pending", "approved", "applied", "rejected"].map((status) => (
          <Card key={status} className="p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">{status}</p>
            <p className="mt-2 text-3xl font-bold text-ink">{grouped[status]?.length ?? 0}</p>
          </Card>
        ))}
      </div>
      <Card className="p-4">
        <h3 className="font-bold text-ink">Usage summary</h3>
        <p className="mt-2 text-sm text-muted">{usage ? `${usage.request_count} of ${usage.request_limit} requests used. ${usage.token_count} of ${usage.token_limit} estimated tokens used.` : "Usage will appear after the first AI request."}</p>
      </Card>
      {(suggestions ?? []).length ? (
        <div className="grid gap-4">
          {(suggestions ?? []).map((suggestion) => (
            <Card key={suggestion.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted">{suggestion.suggestion_type} · {suggestion.status}</p>
                  <h3 className="mt-1 font-bold text-ink">{suggestion.section_key ?? "Website"} / {suggestion.field_key}</h3>
                  <p className="mt-1 text-sm text-muted">Language: {suggestion.language}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={applyAiSuggestionAction}>
                    <input type="hidden" name="siteId" value={setup.site.id} />
                    <input type="hidden" name="suggestionId" value={suggestion.id} />
                    <Button type="submit" disabled={!canEdit || !["pending", "approved"].includes(suggestion.status)}>
                      <Check size={16} />
                      Apply
                    </Button>
                  </form>
                  <form action={rejectAiSuggestionAction}>
                    <input type="hidden" name="siteId" value={setup.site.id} />
                    <input type="hidden" name="suggestionId" value={suggestion.id} />
                    <Button type="submit" variant="secondary" disabled={!canEdit || !["pending", "approved"].includes(suggestion.status)}>
                      <X size={16} />
                      Reject
                    </Button>
                  </form>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-app border border-line bg-canvas p-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted">Current value</p>
                  <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{displayValue(suggestion.original_value)}</pre>
                </div>
                <div className="rounded-app border border-line bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted">Suggested value</p>
                  <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{displayValue(suggestion.suggested_value)}</pre>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No AI suggestions yet" description="Save an AI setup profile, generate suggestions, then review every proposed change here." action={<ButtonLink href={`${base}/ai-setup`}>Use AI Assistance</ButtonLink>} />
      )}

      <Card className="p-4">
        <h3 className="font-bold text-ink">Generation history</h3>
        <div className="mt-3 grid gap-2">
          {(requests ?? []).map((request) => (
            <div key={request.id} className="flex flex-wrap items-center justify-between gap-2 rounded-app border border-line bg-white p-3 text-sm">
              <span className="font-semibold text-ink">{request.request_type}</span>
              <span className="text-muted">{request.provider ?? "provider"} · {request.status} · {request.tokens_input + request.tokens_output} tokens</span>
            </div>
          ))}
          {requests?.length ? null : <p className="text-sm text-muted">No generation requests recorded yet.</p>}
        </div>
      </Card>
    </div>
  );
}

export function EditorAiTools({ siteId, sectionKey, fieldKey, currentValue, canEdit }: { siteId: string; sectionKey?: string; fieldKey: string; currentValue: string; canEdit: boolean }) {
  if (!isAiAvailable()) {
    return <p className="text-xs font-semibold text-muted">AI unavailable. Configure server-side AI settings to enable suggestions.</p>;
  }
  const actions = [
    { type: "rewrite", label: "Improve Writing", icon: Sparkles },
    { type: "shorten", label: "Make It Shorter", icon: FileText },
    { type: "grammar_fix", label: "Fix Grammar", icon: Check },
    { type: "translation", label: "Translate", icon: Languages }
  ] as const;
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <form key={action.type} action={generateFieldAiSuggestionAction}>
            <input type="hidden" name="siteId" value={siteId} />
            <input type="hidden" name="requestType" value={action.type} />
            <input type="hidden" name="sectionKey" value={sectionKey ?? ""} />
            <input type="hidden" name="fieldKey" value={fieldKey} />
            <input type="hidden" name="currentValue" value={currentValue} />
            <input type="hidden" name="language" value={action.type === "translation" ? "Arabic" : "English"} />
            <Button type="submit" variant="secondary" className="min-h-8 px-2 py-1 text-xs" disabled={!canEdit || !currentValue}>
              <Icon size={14} />
              {action.label}
            </Button>
          </form>
        );
      })}
    </div>
  );
}

export async function ImageRequirementCard({ siteId }: { siteId: string }) {
  const setup = await requireSiteSetup(siteId);
  const context = await loadEditorContext(setup.supabase, setup.site.id, true);
  const sections = context.previewResult.status === "ready" ? context.previewResult.preview.sections.map((section) => section.section_key) : [];
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <ImageIcon className="mt-1 text-brand-700" size={20} />
        <div>
          <h3 className="font-bold text-ink">Image checklist basis</h3>
          <p className="mt-1 text-sm leading-6 text-muted">The AI image checklist uses enabled approved sections only. Uploads stay in the existing Images tab.</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted">{sections.join(", ") || "Choose a template first"}</p>
        </div>
      </div>
    </Card>
  );
}
