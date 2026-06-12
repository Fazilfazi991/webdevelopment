import { CheckCircle2, ExternalLink, Globe2, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { addCustomDomainAction, markPrimaryDomainAction, refreshCustomDomainAction, removeCustomDomainAction, saveStudioAddressAction } from "@/app/domain-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { CopyLinkButton } from "@/components/copy-link-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { inputClassName } from "@/components/ui/field";
import { publicSiteUrl } from "@/lib/publishing/constants";
import { requireSiteSetup } from "@/lib/setup";
import type { SiteDomain } from "@/lib/types";

export default async function DomainsPage({ params, searchParams }: { params: { siteId: string }; searchParams: { message?: string; error?: string } }) {
  const setup = await requireSiteSetup(params.siteId);
  const { data } = await setup.supabase.from("site_domains").select("*").eq("site_id", setup.site.id).neq("status", "removed").order("created_at").returns<SiteDomain[]>();
  const domains = data ?? [];
  const slug = setup.site.primary_subdomain || setup.site.slug;
  const publicUrl = publicSiteUrl(slug);
  return <div className="mx-auto max-w-5xl space-y-6">
    <div><p className="text-xs font-bold uppercase tracking-widest text-brand-700">Publishing</p><h1 className="mt-2 text-3xl font-bold text-ink [text-wrap:balance]">Website Address</h1><p className="mt-2 text-sm text-muted">Manage the Studio OS address and connect a domain you own.</p></div>
    <StatusMessage message={searchParams.message} error={searchParams.error} />
    <Card className="p-5">
      <div className="flex items-start gap-3"><Globe2 className="mt-1 text-brand-700" /><div><h2 className="text-lg font-bold text-ink">Studio OS Address</h2><p className="mt-1 text-sm text-muted">This address works on the current deployment.</p></div></div>
      <form action={saveStudioAddressAction} className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]"><input type="hidden" name="siteId" value={setup.site.id} /><input className={inputClassName} name="subdomain" defaultValue={slug} aria-label="Studio OS address" /><Button type="submit">Save address</Button></form>
      <div className="mt-4 rounded-lg bg-canvas p-4"><p className="text-xs font-bold uppercase tracking-widest text-muted">Your website is available at</p><a href={publicUrl} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm font-bold text-brand-700">{publicUrl}</a><div className="mt-3 flex flex-wrap gap-2"><CopyLinkButton value={publicUrl} /><a href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-700 px-3 text-sm font-semibold text-white"><ExternalLink size={15} />Open Website</a></div></div>
    </Card>
    <Card className="p-5"><h2 className="text-lg font-bold text-ink">Connect Your Domain</h2><p className="mt-1 text-sm text-muted">Remote provisioning stays in mock mode unless explicitly enabled on the server.</p><form action={addCustomDomainAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"><input type="hidden" name="siteId" value={setup.site.id} /><input className={inputClassName} name="domain" placeholder="www.example.com" /><Button type="submit">Continue</Button></form></Card>
    <div className="grid gap-3">{domains.filter((item) => item.domain_type === "custom_domain").map((domain) => <Card key={domain.id} className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-ink">{domain.domain}</h3><div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">{domain.verification_status === "verified" ? "Connected" : domain.verification_status === "failed" ? "Needs attention" : domain.verification_status === "verifying" ? "Verifying" : "Waiting for DNS"}</span><span className="rounded-full bg-canvas px-2.5 py-1 text-muted">SSL {domain.ssl_status}</span>{domain.is_primary ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800"><CheckCircle2 size={12} />Primary</span> : null}</div></div><ShieldCheck className="text-brand-700" /></div>
      <div className="mt-4 flex flex-wrap gap-2"><form action={refreshCustomDomainAction}><input type="hidden" name="siteId" value={setup.site.id} /><input type="hidden" name="domainId" value={domain.id} /><input type="hidden" name="hostname" value={domain.domain} /><Button variant="secondary" type="submit"><RefreshCw size={15} />Check status</Button></form>{domain.status === "active" && !domain.is_primary ? <form action={markPrimaryDomainAction}><input type="hidden" name="siteId" value={setup.site.id} /><input type="hidden" name="domainId" value={domain.id} /><Button variant="secondary" type="submit">Make primary</Button></form> : null}<form action={removeCustomDomainAction}><input type="hidden" name="siteId" value={setup.site.id} /><input type="hidden" name="domainId" value={domain.id} /><input type="hidden" name="hostname" value={domain.domain} /><Button variant="secondary" type="submit"><Trash2 size={15} />Remove</Button></form></div>
    </Card>)}</div>
  </div>;
}
