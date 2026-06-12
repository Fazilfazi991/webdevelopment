import { Activity, AlertTriangle, Globe2, LockKeyhole } from "lucide-react";
import { Card } from "@/components/ui/card";
import { domainProviderMode } from "@/lib/domains/provider";
import { platformDomain, platformWildcardConfigured } from "@/lib/publishing/constants";
import { requireAdmin } from "@/lib/data";
import type { SiteDomain } from "@/lib/types";

export default async function AdminDomainsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("site_domains").select("*").neq("status", "removed").order("updated_at", { ascending: false }).limit(200).returns<SiteDomain[]>();
  const domains = data ?? [];
  const platformSubdomains = domains.filter((domain) => domain.domain_type === "platform_subdomain");
  const pendingDns = domains.filter((domain) => domain.status === "waiting_dns" || domain.verification_status === "waiting_dns" || domain.verification_status === "pending");
  const sslPending = domains.filter((domain) => domain.ssl_status === "pending");
  const failed = domains.filter((domain) => domain.status === "failed" || domain.verification_status === "failed" || domain.ssl_status === "failed");

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">Platform Domains</p>
        <h2 className="text-2xl font-bold text-ink">Domain Diagnostics</h2>
        <p className="mt-1 text-sm text-muted">Internal provider and DNS status for platform admins only.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4"><Globe2 size={18} className="text-brand-700" /><p className="mt-2 text-2xl font-bold text-ink">{platformWildcardConfigured() ? platformDomain() : "Not configured"}</p><p className="text-sm text-muted">Platform wildcard domain</p></Card>
        <Card className="p-4"><Activity size={18} className="text-brand-700" /><p className="mt-2 text-2xl font-bold text-ink">{domainProviderMode()}</p><p className="text-sm text-muted">Provider mode</p></Card>
        <Card className="p-4"><LockKeyhole size={18} className="text-brand-700" /><p className="mt-2 text-2xl font-bold text-ink">{platformSubdomains.length}</p><p className="text-sm text-muted">Active platform subdomains</p></Card>
        <Card className="p-4"><AlertTriangle size={18} className="text-danger" /><p className="mt-2 text-2xl font-bold text-ink">{failed.length}</p><p className="text-sm text-muted">Failed domains</p></Card>
      </div>
      <Card className="p-4">
        <h3 className="font-bold text-ink">Domain queues</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-canvas p-3"><p className="text-2xl font-bold text-ink">{pendingDns.length}</p><p className="text-sm text-muted">Pending DNS</p></div>
          <div className="rounded-lg bg-canvas p-3"><p className="text-2xl font-bold text-ink">{sslPending.length}</p><p className="text-sm text-muted">SSL pending</p></div>
          <div className="rounded-lg bg-canvas p-3"><p className="text-2xl font-bold text-ink">{domains.length}</p><p className="text-sm text-muted">Tracked domains</p></div>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="font-bold text-ink">Recent domain records</h3>
        <div className="mt-3 grid gap-2">
          {domains.slice(0, 20).map((domain) => <div key={domain.id} className="rounded-lg border border-line bg-white p-3 text-sm">
            <p className="font-semibold text-ink">{domain.hostname || domain.domain}</p>
            <p className="mt-1 text-muted">{domain.domain_type} · {domain.status} · DNS {domain.verification_status} · SSL {domain.ssl_status}</p>
          </div>)}
          {domains.length ? null : <p className="text-sm text-muted">No domain records yet.</p>}
        </div>
      </Card>
    </div>
  );
}
