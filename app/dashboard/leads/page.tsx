import { Download, ExternalLink } from "lucide-react";
import { updateLeadAction } from "@/app/publishing-actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { inputClassName } from "@/components/ui/field";
import { requireDashboardContext } from "@/lib/data";
import type { ContactLead } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const leadStatuses = ["new", "contacted", "qualified", "closed", "spam"] as const;

export default async function LeadsPage({ searchParams }: { searchParams: { status?: string; siteId?: string } }) {
  const { supabase, organization, sites } = await requireDashboardContext();
  let query = supabase
    .from("contact_leads")
    .select("*")
    .eq("organization_id", organization.id)
    .order("submitted_at", { ascending: false });

  if (searchParams.siteId) query = query.eq("site_id", searchParams.siteId);
  if (searchParams.status && leadStatuses.includes(searchParams.status as (typeof leadStatuses)[number])) query = query.eq("status", searchParams.status);

  const { data: leads } = await query.returns<ContactLead[]>();
  const siteName = (siteId: string) => sites.find((site) => site.id === siteId)?.name ?? "Website";

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">Lead inbox</h2>
          <p className="mt-1 text-sm text-muted">Review contact form enquiries from published websites.</p>
        </div>
        <ButtonLink href={`/dashboard/leads/export${searchParams.siteId ? `?siteId=${searchParams.siteId}` : ""}`} variant="secondary">
          <Download size={16} />
          Export CSV
        </ButtonLink>
      </div>

      <Card className="p-4">
        <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <select name="siteId" className={inputClassName} defaultValue={searchParams.siteId ?? ""}>
            <option value="">All websites</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
          <select name="status" className={inputClassName} defaultValue={searchParams.status ?? ""}>
            <option value="">All statuses</option>
            {leadStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary">Filter</Button>
        </form>
      </Card>

      {leads?.length ? (
        <div className="grid gap-3">
          {leads.map((lead) => (
            <Card key={lead.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted">{siteName(lead.site_id)}</p>
                  <h3 className="mt-1 text-lg font-bold text-ink">{lead.name}</h3>
                  <p className="mt-1 text-sm text-muted">{formatDate(lead.submitted_at)}</p>
                </div>
                <span className="rounded-app bg-canvas px-3 py-1 text-sm font-semibold capitalize text-ink">{lead.status}</span>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-ink">{lead.message}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted">
                {lead.email ? <a href={`mailto:${lead.email}`} className="font-semibold text-brand-700">{lead.email}</a> : null}
                {lead.phone ? <a href={`tel:${lead.phone}`} className="font-semibold text-brand-700">{lead.phone}</a> : null}
                {lead.whatsapp ? <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`} className="font-semibold text-brand-700">WhatsApp</a> : null}
                {lead.source_url ? <a href={lead.source_url} className="inline-flex items-center gap-1 font-semibold text-brand-700"><ExternalLink size={14} /> Source</a> : null}
              </div>
              <form action={updateLeadAction} className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                <input type="hidden" name="leadId" value={lead.id} />
                <input type="hidden" name="isRead" value="true" />
                <select name="status" className={inputClassName} defaultValue={lead.status}>
                  {leadStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <Button type="submit" variant="secondary">Update</Button>
              </form>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No leads yet" description="Published contact forms will appear here after visitors submit enquiries." />
      )}
    </div>
  );
}
