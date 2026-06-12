import { Card, EmptyState } from "@/components/ui/card";
import { requireAdmin } from "@/lib/data";
import type { Site } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function AdminPage() {
  const { supabase } = await requireAdmin();
  const [
    { count: customers },
    { count: organizations },
    { count: websites },
    { count: drafts },
    { count: published },
    { count: leads },
    { count: domains },
    { count: agencies },
    { count: clients },
    { count: invitations },
    { count: transfers },
    { count: activity }
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("organizations").select("id", { count: "exact", head: true }),
    supabase.from("sites").select("id", { count: "exact", head: true }),
    supabase.from("sites").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("sites").select("id", { count: "exact", head: true }).eq("publication_status", "published"),
    supabase.from("contact_leads").select("id", { count: "exact", head: true }),
    supabase.from("site_domains").select("id", { count: "exact", head: true }),
    supabase.from("agencies").select("id", { count: "exact", head: true }),
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("client_invitations").select("id", { count: "exact", head: true }),
    supabase.from("site_ownership_transfers").select("id", { count: "exact", head: true }),
    supabase.from("site_activity_log").select("id", { count: "exact", head: true })
  ]);
  const { data: recentSites } = await supabase
    .from("sites")
    .select("*")
    .eq("publication_status", "published")
    .order("published_at", { ascending: false })
    .limit(5)
    .returns<Site[]>();

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total customers", customers ?? 0],
          ["Organisations", organizations ?? 0],
          ["Total websites", websites ?? 0],
          ["Draft websites", drafts ?? 0],
          ["Published websites", published ?? 0],
          ["Leads", leads ?? 0],
          ["Domains", domains ?? 0],
          ["Agencies", agencies ?? 0],
          ["Clients", clients ?? 0],
          ["Invitations", invitations ?? 0],
          ["Transfers", transfers ?? 0],
          ["Activity events", activity ?? 0]
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-sm font-semibold text-muted">{label}</p>
            <p className="mt-3 text-3xl font-bold text-ink">{value}</p>
            {label === "Domains" ? <Link href="/admin/domains" className="mt-3 inline-flex text-sm font-bold text-brand-700">Open diagnostics</Link> : null}
          </Card>
        ))}
      </section>
      <Card className="p-5">
        <h2 className="text-lg font-bold text-ink">Recently published websites</h2>
        <div className="mt-4 grid gap-3">
          {recentSites?.length ? (
            recentSites.map((site) => (
              <div key={site.id} className="flex flex-wrap items-center justify-between gap-3 rounded-app bg-canvas p-3 text-sm">
                <div>
                  <p className="font-semibold text-ink">{site.name}</p>
                  <p className="text-muted">{site.primary_subdomain ?? site.slug}</p>
                </div>
                <p className="text-muted">{site.published_at ? formatDate(site.published_at) : "Not dated"}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">No published websites yet.</p>
          )}
        </div>
      </Card>
      <EmptyState
        title="Publishing operations are visible"
        description="Domain verification, lead volume, and recently published websites now have an admin overview while deeper moderation tools remain for later milestones."
      />
    </div>
  );
}
