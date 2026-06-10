import { MoreHorizontal, Pencil, Plus } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { requireDashboardContext } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function WebsitesPage() {
  const { sites } = await requireDashboardContext();

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">My Websites</h2>
          <p className="mt-1 text-sm text-muted">Manage website drafts for this organisation.</p>
        </div>
        <ButtonLink href="/dashboard/websites/new">
          <Plus size={16} />
          Create website
        </ButtonLink>
      </div>
      {sites.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sites.map((site) => (
            <Card key={site.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-ink">{site.name}</h3>
                  <p className="mt-1 text-sm text-muted">/{site.slug}</p>
                </div>
                <StatusBadge status={site.status} />
              </div>
              <dl className="mt-5 grid gap-2 text-sm text-muted">
                <div className="flex justify-between gap-3">
                  <dt>Created</dt>
                  <dd className="font-medium text-ink">{formatDate(site.created_at)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Updated</dt>
                  <dd className="font-medium text-ink">{formatDate(site.updated_at)}</dd>
                </div>
              </dl>
              <div className="mt-5 grid grid-cols-[1fr_1fr_auto] gap-2">
                <ButtonLink href={`/dashboard/websites/${site.id}/setup`} variant="secondary">
                  <Pencil size={16} />
                  Edit
                </ButtonLink>
                <ButtonLink href={`/dashboard/websites/${site.id}/setup`} variant="ghost">
                  Preview
                </ButtonLink>
                <ButtonLink href={`/dashboard/websites/${site.id}/setup`} variant="ghost" aria-label="Settings menu">
                  <MoreHorizontal size={18} />
                </ButtonLink>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Create your first website draft"
          description="The first milestone creates the project shell. Template selection and content guidance arrive in Phase 2."
          action={<ButtonLink href="/dashboard/websites/new">Create website</ButtonLink>}
        />
      )}
    </div>
  );
}
