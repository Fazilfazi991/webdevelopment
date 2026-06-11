import { MoreHorizontal, Pencil, Plus } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { requireDashboardContext } from "@/lib/data";
import { setupPath } from "@/lib/setup";
import type { BusinessCategory, Industry, SiteTemplateSelection, Template } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default async function WebsitesPage() {
  const { supabase, sites } = await requireDashboardContext();
  const siteIds = sites.map((site) => site.id);
  const { data: selections } = siteIds.length
    ? await supabase.from("site_template_selections").select("*").in("site_id", siteIds).returns<SiteTemplateSelection[]>()
    : { data: [] as SiteTemplateSelection[] };
  const industryIds = [...new Set((selections ?? []).map((selection) => selection.industry_id))];
  const categoryIds = [...new Set((selections ?? []).map((selection) => selection.business_category_id).filter(Boolean))] as string[];
  const templateIds = [...new Set((selections ?? []).map((selection) => selection.template_id).filter(Boolean))] as string[];
  const { data: industries } = industryIds.length ? await supabase.from("industries").select("*").in("id", industryIds).returns<Industry[]>() : { data: [] as Industry[] };
  const { data: categories } = categoryIds.length
    ? await supabase.from("business_categories").select("*").in("id", categoryIds).returns<BusinessCategory[]>()
    : { data: [] as BusinessCategory[] };
  const { data: templates } = templateIds.length ? await supabase.from("templates").select("*").in("id", templateIds).returns<Template[]>() : { data: [] as Template[] };

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">My Websites</h2>
          <p className="mt-1 text-sm text-muted">Continue setup, review draft progress, and select design templates.</p>
        </div>
        <ButtonLink href="/dashboard/websites/new">
          <Plus size={16} />
          Create website
        </ButtonLink>
      </div>
      {sites.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sites.map((site) => {
            const selection = selections?.find((item) => item.site_id === site.id);
            const industry = industries?.find((item) => item.id === selection?.industry_id);
            const category = categories?.find((item) => item.id === selection?.business_category_id);
            const template = templates?.find((item) => item.id === selection?.template_id);
            return (
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
                    <dt>Setup</dt>
                    <dd className="font-medium capitalize text-ink">{site.setup_step.replaceAll("_", " ")}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Created</dt>
                    <dd className="font-medium text-ink">{formatDate(site.created_at)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Updated</dt>
                    <dd className="font-medium text-ink">{formatDate(site.updated_at)}</dd>
                  </div>
                </dl>
                <div className="mt-4 grid gap-2 rounded-app bg-canvas p-3 text-sm">
                  <p className="text-muted">
                    Industry: <span className="font-semibold text-ink">{industry?.name ?? "Not selected"}</span>
                  </p>
                  <p className="text-muted">
                    Category: <span className="font-semibold text-ink">{category?.name ?? "Not selected"}</span>
                  </p>
                  <p className="text-muted">
                    Template: <span className="font-semibold text-ink">{template?.name ?? "Not selected"}</span>
                  </p>
                </div>
                <div className="mt-5 grid grid-cols-[1fr_1fr_auto] gap-2">
                  <ButtonLink href={setupPath(site.id, site.setup_step)} variant="secondary">
                    <Pencil size={16} />
                    {template ? "Edit Website" : "Continue Setup"}
                  </ButtonLink>
                  {template ? (
                    <ButtonLink href={`/dashboard/websites/${site.id}/preview`} variant="ghost">
                      Preview Website
                    </ButtonLink>
                  ) : (
                    <ButtonLink href={setupPath(site.id, site.setup_step)} variant="ghost">
                      Continue Setup
                    </ButtonLink>
                  )}
                  <ButtonLink href={setupPath(site.id, site.setup_step)} variant="ghost" aria-label="Settings menu">
                    <MoreHorizontal size={18} />
                  </ButtonLink>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Create your first website draft"
          description="Create a website and follow the guided steps to choose a category and design template."
          action={<ButtonLink href="/dashboard/websites/new">Create website</ButtonLink>}
        />
      )}
    </div>
  );
}
