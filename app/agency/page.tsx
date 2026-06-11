import { Card, EmptyState } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { requireAgencyContext } from "@/lib/access-control";
import type { Client, ClientInvitation, Site, SiteActivityLog } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default async function AgencyPage() {
  const { supabase, agency } = await requireAgencyContext();
  const [{ data: clients }, { data: ownership }, { data: invitations }, { data: activity }, { count: domainsAttention }] = await Promise.all([
    supabase.from("clients").select("*").eq("agency_id", agency.id).returns<Client[]>(),
    supabase.from("site_ownership").select("*, sites(*)").eq("owner_agency_id", agency.id),
    supabase.from("client_invitations").select("*").eq("invitation_status", "pending").returns<ClientInvitation[]>(),
    supabase.from("site_activity_log").select("*").order("created_at", { ascending: false }).limit(8).returns<SiteActivityLog[]>(),
    supabase.from("site_domains").select("id", { count: "exact", head: true }).in("status", ["pending", "failed"])
  ]);
  const sites = (ownership ?? []).map((item) => item.sites).filter(Boolean) as Site[];

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["Total clients", clients?.length ?? 0],
          ["Draft websites", sites.filter((site) => site.status === "draft").length],
          ["Published websites", sites.filter((site) => site.publication_status === "published").length],
          ["Pending invitations", invitations?.length ?? 0],
          ["Domains attention", domainsAttention ?? 0]
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-sm font-semibold text-muted">{label}</p>
            <p className="mt-3 text-3xl font-bold text-ink">{value}</p>
          </Card>
        ))}
      </section>
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-ink">Recent activity</h2>
          <ButtonLink href="/agency/websites" variant="secondary">Manage websites</ButtonLink>
        </div>
        <div className="mt-4 grid gap-3">
          {activity?.length ? activity.map((item) => (
            <div key={item.id} className="rounded-app border border-line p-3 text-sm">
              <p className="font-semibold text-ink">{item.action_summary}</p>
              <p className="mt-1 text-muted">{formatDate(item.created_at)}</p>
            </div>
          )) : <EmptyState title="No activity yet" description="Client invitations, edits, publishing, and handovers will appear here." />}
        </div>
      </Card>
    </div>
  );
}
