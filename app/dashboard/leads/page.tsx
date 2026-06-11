import { Download } from "lucide-react";
import { updateLeadAction } from "@/app/publishing-actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";
import { requireDashboardContext } from "@/lib/data";
import type { ContactLead } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const leadStatuses = ["new", "contacted", "qualified", "closed", "spam"] as const;
type LeadStatus = (typeof leadStatuses)[number];

const statusStyles: Record<LeadStatus, string> = {
  new: "bg-brand-50 text-brand-700 border-brand-100",
  contacted: "bg-sky-50 text-sky-700 border-sky-100",
  qualified: "bg-emerald-50 text-emerald-700 border-emerald-100",
  closed: "bg-slate-50 text-slate-700 border-slate-200",
  spam: "bg-red-50 text-red-700 border-red-100"
};

const statusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  closed: "Closed",
  spam: "Spam"
};

// ─── Lead card ────────────────────────────────────────────────────────────────

function LeadCard({ lead, siteName }: { lead: ContactLead; siteName: string }) {
  const status = lead.status as LeadStatus;
  const phone = lead.phone ?? lead.whatsapp;
  const waNumber = (lead.whatsapp ?? lead.phone ?? "").replace(/\D/g, "");

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
      {/* Header strip */}
      <div className={`flex items-center justify-between gap-3 border-b px-4 py-3 ${lead.is_read ? "border-line bg-canvas" : "border-brand-100 bg-brand-50"}`}>
        <div className="flex items-center gap-2">
          {!lead.is_read && <div className="h-2 w-2 shrink-0 rounded-full bg-brand-700" />}
          <p className="text-xs font-semibold text-muted">{siteName}</p>
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusStyles[status]}`}>
          {statusLabels[status]}
        </span>
      </div>

      <div className="p-4">
        {/* Lead info */}
        <div className="mb-3">
          <h3 className="text-base font-bold text-ink">{lead.name}</h3>
          {lead.subject && (
            <p className="mt-0.5 text-sm font-semibold text-muted">{lead.subject}</p>
          )}
          <p className="mt-0.5 text-xs text-muted">{formatDate(lead.submitted_at)}</p>
        </div>

        {/* Message */}
        {lead.message && (
          <p className="mb-4 whitespace-pre-wrap rounded-xl bg-canvas px-3 py-2 text-sm leading-6 text-ink">
            {lead.message}
          </p>
        )}

        {/* Primary contact actions */}
        <div className="grid grid-cols-2 gap-2">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-line bg-white text-sm font-bold text-ink transition hover:bg-canvas active:scale-95"
            >
              📞 Call
            </a>
          )}
          {waNumber && (
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 active:scale-95"
            >
              💬 WhatsApp
            </a>
          )}
        </div>

        {/* Contact email */}
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="mt-2 flex min-h-[44px] items-center gap-2 rounded-xl border border-line bg-canvas px-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            ✉️ {lead.email}
          </a>
        )}

        {/* Status update */}
        <form action={updateLeadAction} className="mt-4 flex gap-2 border-t border-line pt-4">
          <input type="hidden" name="leadId" value={lead.id} />
          <input type="hidden" name="isRead" value="true" />
          <select
            name="status"
            defaultValue={lead.status}
            className="min-h-[44px] flex-1 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
          >
            {leadStatuses.map((s) => (
              <option key={s} value={s}>{statusLabels[s]}</option>
            ))}
          </select>
          <Button type="submit" variant="secondary" className="min-h-[44px] shrink-0 text-sm">
            Update
          </Button>
        </form>
      </div>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LeadsPage({ searchParams }: { searchParams: { status?: string; siteId?: string } }) {
  const { supabase, sites } = await requireDashboardContext();

  let query = supabase.from("contact_leads").select("*");
  if (sites.length > 0) {
    query = query.in("site_id", sites.map((s) => s.id));
  } else {
    query = query.eq("site_id", "00000000-0000-0000-0000-000000000000");
  }
  query = query.order("submitted_at", { ascending: false });

  if (searchParams.siteId) query = query.eq("site_id", searchParams.siteId);
  if (searchParams.status && leadStatuses.includes(searchParams.status as LeadStatus)) {
    query = query.eq("status", searchParams.status);
  }

  const { data: leads } = await query.returns<ContactLead[]>();
  const siteName = (siteId: string) => sites.find((site) => site.id === siteId)?.name ?? "Website";

  const activeStatus = searchParams.status as LeadStatus | undefined;
  const newCount = leads?.filter((l) => l.status === "new").length ?? 0;

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">
            Lead inbox{newCount > 0 && <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-700 px-1.5 text-xs font-bold text-white">{newCount}</span>}
          </h2>
          <p className="mt-1 text-sm text-muted">Contact enquiries from your published websites.</p>
        </div>
        <ButtonLink href={`/dashboard/leads/export${searchParams.siteId ? `?siteId=${searchParams.siteId}` : ""}`} variant="secondary" className="min-h-[44px]">
          <Download size={15} /> Export CSV
        </ButtonLink>
      </div>

      {/* Status tab filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <a
          href="/dashboard/leads"
          className={`shrink-0 min-h-[40px] rounded-full border px-4 py-1.5 text-sm font-semibold transition ${!activeStatus ? "border-brand-700 bg-brand-700 text-white" : "border-line bg-white text-muted hover:bg-canvas"}`}
        >
          All
        </a>
        {leadStatuses.filter(s => s !== "spam").map((s) => (
          <a
            key={s}
            href={`/dashboard/leads?status=${s}`}
            className={`shrink-0 min-h-[40px] rounded-full border px-4 py-1.5 text-sm font-semibold transition capitalize ${activeStatus === s ? "border-brand-700 bg-brand-700 text-white" : "border-line bg-white text-muted hover:bg-canvas"}`}
          >
            {statusLabels[s]}
          </a>
        ))}
      </div>

      {/* Site filter (shown only if multiple sites) */}
      {sites.length > 1 && (
        <form className="flex gap-2">
          <select
            name="siteId"
            className="min-h-[44px] flex-1 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
            defaultValue={searchParams.siteId ?? ""}
          >
            <option value="">All websites</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>
          <Button type="submit" variant="secondary" className="min-h-[44px] shrink-0">Filter</Button>
        </form>
      )}

      {/* Lead cards */}
      {leads?.length ? (
        <div className="grid gap-3">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} siteName={siteName(lead.site_id)} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No leads yet"
          description="Contact form enquiries from published websites will appear here."
        />
      )}
    </div>
  );
}
