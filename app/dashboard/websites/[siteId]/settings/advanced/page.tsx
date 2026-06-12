import { AlertTriangle, History } from "lucide-react";
import { StatusMessage } from "@/app/auth/status-message";
import { rollbackDeveloperCodeAction, saveDeveloperCodeAction } from "@/app/website-settings-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { inputClassName } from "@/components/ui/field";
import { requireSiteSetup } from "@/lib/setup";
import type { SiteDeveloperSettings, SiteDeveloperSettingVersion } from "@/lib/types";

export default async function AdvancedSettingsPage({ params, searchParams }: { params: { siteId: string }; searchParams: { message?: string; error?: string } }) {
  const setup = await requireSiteSetup(params.siteId);
  const allowed = ["owner", "admin"].includes(setup.membershipRole ?? "") || ["agency_owner", "agency_admin", "developer"].includes(setup.siteAccess?.access_role ?? "");
  if (!allowed) return <Card className="mx-auto max-w-3xl p-5"><h1 className="font-bold text-ink">Advanced settings unavailable</h1><p className="mt-2 text-sm text-muted">Only administrators and developers can manage custom code.</p></Card>;
  const [{ data }, { data: versions }] = await Promise.all([
    setup.supabase.from("site_developer_settings").select("*").eq("site_id", setup.site.id).maybeSingle<SiteDeveloperSettings>(),
    setup.supabase.from("site_developer_setting_versions").select("*").eq("site_id", setup.site.id).order("version_number", { ascending: false }).limit(8).returns<SiteDeveloperSettingVersion[]>()
  ]);
  return <div className="mx-auto max-w-4xl space-y-6"><div><p className="text-xs font-bold uppercase tracking-widest text-brand-700">Settings</p><h1 className="mt-2 text-3xl font-bold text-ink">Advanced</h1></div><StatusMessage message={searchParams.message} error={searchParams.error} /><Card className="border-amber-200 bg-amber-50 p-4"><div className="flex gap-3"><AlertTriangle className="shrink-0 text-amber-700" /><p className="text-sm text-amber-950">Custom code can affect performance and security. Inline scripts, event handlers, javascript URLs, and iframes are blocked. Every change creates an audit entry and restorable version.</p></div></Card><form action={saveDeveloperCodeAction}><input type="hidden" name="siteId" value={setup.site.id} /><Card className="grid gap-4 p-5"><label className="grid gap-2 text-sm font-bold text-ink">Custom header code<textarea name="customHeaderCode" className={inputClassName} rows={7} defaultValue={data?.custom_header_code ?? ""} /></label><label className="grid gap-2 text-sm font-bold text-ink">Custom footer code<textarea name="customFooterCode" className={inputClassName} rows={7} defaultValue={data?.custom_footer_code ?? ""} /></label><p className="text-xs text-muted">Current version: {data?.version_number ?? 0}</p><Button type="submit" className="w-full sm:w-auto">Save new version</Button></Card></form>{versions?.length ? <Card className="p-5"><div className="flex items-center gap-2"><History className="text-brand-700" /><h2 className="font-bold text-ink">Version history</h2></div><div className="mt-4 divide-y divide-line">{versions.map((version) => <div key={version.id} className="flex min-h-14 items-center justify-between gap-3 py-2"><div><p className="text-sm font-bold text-ink">Version {version.version_number}</p><p className="text-xs text-muted">{new Date(version.created_at).toLocaleString()}</p></div><form action={rollbackDeveloperCodeAction}><input type="hidden" name="siteId" value={setup.site.id} /><input type="hidden" name="versionId" value={version.id} /><Button type="submit" variant="secondary">Restore</Button></form></div>)}</div></Card> : null}</div>;
}
