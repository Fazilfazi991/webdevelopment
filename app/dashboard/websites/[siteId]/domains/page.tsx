import { CheckCircle2, ExternalLink, Globe2, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { addCustomDomainAction, markPrimaryDomainAction, refreshCustomDomainAction, removeCustomDomainAction, saveStudioAddressAction } from "@/app/domain-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { CopyLinkButton } from "@/components/copy-link-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { inputClassName } from "@/components/ui/field";
import { platformUrl, platformWildcardConfigured, publicSitePath, publicSiteUrl } from "@/lib/publishing/constants";
import { requireSiteSetup } from "@/lib/setup";
import type { SiteDomain } from "@/lib/types";

type DnsRecord = { type?: string; name?: string; value?: string };

function customHostname(domain: SiteDomain) {
  return domain.hostname || domain.domain;
}

function verificationLabel(domain: SiteDomain) {
  if (domain.status === "active" && domain.ssl_status === "active") return "Connected";
  if (domain.status === "failed" || domain.verification_status === "failed" || domain.ssl_status === "failed") return "Needs attention";
  if (domain.verification_status === "verified" && domain.ssl_status !== "active") return "SSL pending";
  if (domain.status === "waiting_dns" || domain.verification_status === "waiting_dns" || domain.verification_status === "pending") return "Waiting for DNS";
  return "Verifying";
}

function dnsRecords(domain: SiteDomain): DnsRecord[] {
  const details = domain.verification_details;
  if (!details || typeof details !== "object" || Array.isArray(details)) return [];
  const records = (details as { dnsRecords?: unknown }).dnsRecords;
  return Array.isArray(records) ? records.filter((record): record is DnsRecord => Boolean(record && typeof record === "object")) : [];
}

export default async function DomainsPage({ params, searchParams }: { params: { siteId: string }; searchParams: { message?: string; error?: string } }) {
  const setup = await requireSiteSetup(params.siteId);
  const { data } = await setup.supabase.from("site_domains").select("*").eq("site_id", setup.site.id).neq("status", "removed").order("created_at").returns<SiteDomain[]>();
  const domains = data ?? [];
  const slug = setup.site.primary_subdomain || setup.site.slug;
  const publicUrl = publicSiteUrl(slug);
  const developmentUrl = `${platformUrl()}${publicSitePath(slug)}`;
  const customDomains = domains.filter((item) => item.domain_type === "custom_domain");

  return <div className="mx-auto max-w-5xl space-y-6">
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Publishing</p>
      <h1 className="mt-2 text-3xl font-bold text-ink [text-wrap:balance]">Website Address</h1>
      <p className="mt-2 text-sm text-muted [text-wrap:pretty]">Choose the address customers use to open this website.</p>
    </div>
    <StatusMessage message={searchParams.message} error={searchParams.error} />

    <Card className="p-5">
      <div className="flex items-start gap-3">
        <Globe2 className="mt-1 text-brand-700" />
        <div>
          <h2 className="text-lg font-bold text-ink">Your Studio OS Address</h2>
          <p className="mt-1 text-sm text-muted">{platformWildcardConfigured() ? "Use a simple Studio OS address while your own domain is optional." : "Temporary development address"}</p>
        </div>
      </div>
      <form action={saveStudioAddressAction} className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input type="hidden" name="siteId" value={setup.site.id} />
        <input className={inputClassName} name="subdomain" defaultValue={slug} aria-label="Studio OS address" />
        <Button type="submit">Save Address</Button>
      </form>
      <div className="mt-4 rounded-lg bg-canvas p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Your website will be available at</p>
        <a href={publicUrl} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm font-bold text-brand-700">{publicUrl}</a>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyLinkButton value={publicUrl} />
          <a href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-700 px-3 text-sm font-semibold text-white active:scale-[0.96]"><ExternalLink size={15} />Open Website</a>
        </div>
      </div>
    </Card>

    <Card className="p-5">
      <h2 className="text-lg font-bold text-ink">Use Your Own Domain</h2>
      <p className="mt-1 text-sm text-muted [text-wrap:pretty]">Connect your own domain to use a professional website address.</p>
      <p className="mt-3 text-sm text-muted">Example: <span className="font-semibold text-ink">www.fusionventuresglobal.com</span></p>
      <form action={addCustomDomainAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input type="hidden" name="siteId" value={setup.site.id} />
        <input className={inputClassName} name="domain" placeholder="www.example.com" />
        <Button type="submit">Connect Domain</Button>
      </form>
    </Card>

    <div className="grid gap-3">
      {customDomains.map((domain) => {
        const hostname = customHostname(domain);
        const records = dnsRecords(domain);
        return <Card key={domain.id} className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-ink">{hostname}</h3>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">{verificationLabel(domain)}</span>
                <span className="rounded-full bg-canvas px-2.5 py-1 text-muted">SSL {domain.ssl_status === "active" ? "active" : "pending"}</span>
                {domain.is_primary ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800"><CheckCircle2 size={12} />Primary</span> : null}
              </div>
            </div>
            <ShieldCheck className="text-brand-700" />
          </div>
          {records.length ? <div className="mt-4 overflow-hidden rounded-lg bg-canvas">
            {records.map((record, index) => <div key={`${record.type}-${record.name}-${index}`} className="grid gap-2 border-b border-line p-3 text-sm last:border-b-0 sm:grid-cols-[80px_120px_1fr_auto] sm:items-center">
              <span className="font-bold text-ink">{record.type}</span>
              <span className="text-muted">{record.name}</span>
              <code className="break-all rounded bg-white px-2 py-1 text-xs text-ink">{record.value}</code>
              {record.value ? <CopyLinkButton value={record.value} /> : null}
            </div>)}
          </div> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <form action={refreshCustomDomainAction}><input type="hidden" name="siteId" value={setup.site.id} /><input type="hidden" name="domainId" value={domain.id} /><input type="hidden" name="hostname" value={hostname} /><Button variant="secondary" type="submit"><RefreshCw size={15} />I Added the Record</Button></form>
            {domain.status === "active" && !domain.is_primary ? <form action={markPrimaryDomainAction}><input type="hidden" name="siteId" value={setup.site.id} /><input type="hidden" name="domainId" value={domain.id} /><Button variant="secondary" type="submit">Make Primary Domain</Button></form> : null}
            <form action={removeCustomDomainAction}><input type="hidden" name="siteId" value={setup.site.id} /><input type="hidden" name="domainId" value={domain.id} /><input type="hidden" name="hostname" value={hostname} /><Button variant="secondary" type="submit"><Trash2 size={15} />Remove</Button></form>
          </div>
        </Card>;
      })}
    </div>

    <details className="rounded-xl bg-white p-5 shadow-[0_12px_36px_rgba(24,33,31,0.1)]">
      <summary className="cursor-pointer text-sm font-bold text-ink">Development URL</summary>
      <a href={developmentUrl} target="_blank" rel="noreferrer" className="mt-3 block break-all text-sm font-bold text-brand-700">{developmentUrl}</a>
    </details>
  </div>;
}
