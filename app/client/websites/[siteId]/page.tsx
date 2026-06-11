import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { hasPermission, requireClientSites } from "@/lib/access-control";
import type { ContactLead, SiteAccessMember, SiteActivityLog } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default async function ClientWebsitePage({ params }: { params: { siteId: string } }) {
  const { supabase, access } = await requireClientSites();
  const member = access.find((item) => item.site_id === params.siteId) as SiteAccessMember | undefined;
  const site = access.find((item) => item.site_id === params.siteId)?.sites;
  if (!member || !site) notFound();

  const [{ data: leads }, { data: activity }] = await Promise.all([
    hasPermission(member, "view_leads") ? supabase.from("contact_leads").select("*").eq("site_id", site.id).order("submitted_at", { ascending: false }).limit(5).returns<ContactLead[]>() : { data: [] as ContactLead[] },
    supabase.from("site_activity_log").select("*").eq("site_id", site.id).order("created_at", { ascending: false }).limit(6).returns<SiteActivityLog[]>()
  ]);

  return (
    <div className="grid gap-6">
      <Card className="p-5">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted">Your website</p>
        <h2 className="mt-2 text-2xl font-bold text-ink">{site.name}</h2>
        <p className="mt-2 text-sm text-muted">Access level: {member.access_role.replaceAll("_", " ")}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {hasPermission(member, "edit_content") ? <ButtonLink href={`/client/websites/${site.id}/editor/content`}>Edit content</ButtonLink> : null}
          {hasPermission(member, "upload_media") ? <ButtonLink href={`/client/websites/${site.id}/editor/images`} variant="secondary">Images</ButtonLink> : null}
          <ButtonLink href={`/dashboard/websites/${site.id}/preview`} variant="secondary">Preview</ButtonLink>
          {hasPermission(member, "publish_site") ? <ButtonLink href="/dashboard/websites" variant="secondary">Publish changes</ButtonLink> : null}
        </div>
      </Card>
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-bold text-ink">Recent leads</h3>
          <div className="mt-4 grid gap-3">
            {leads?.length ? leads.map((lead) => (
              <div key={lead.id} className="rounded-app bg-canvas p-3 text-sm">
                <p className="font-semibold text-ink">{lead.name}</p>
                <p className="mt-1 text-muted">{lead.message}</p>
              </div>
            )) : <p className="text-sm text-muted">No lead access or no enquiries yet.</p>}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-bold text-ink">Recent activity</h3>
          <div className="mt-4 grid gap-3">
            {activity?.length ? activity.map((item) => (
              <div key={item.id} className="rounded-app bg-canvas p-3 text-sm">
                <p className="font-semibold text-ink">{item.action_summary}</p>
                <p className="mt-1 text-muted">{formatDate(item.created_at)}</p>
              </div>
            )) : <p className="text-sm text-muted">No activity yet.</p>}
          </div>
        </Card>
      </section>
    </div>
  );
}
