import { ExternalLink, Eye, Globe2, MoreHorizontal, Palette, Pencil, Plus, Settings, Sparkles } from "lucide-react";
import { prepareRecommendedDesignAction } from "@/app/setup-actions";
import { publishWebsiteAction, unpublishWebsiteAction } from "@/app/publishing-actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { inputClassName } from "@/components/ui/field";
import { publicSitePath } from "@/lib/publishing/constants";
import { requireDashboardContext } from "@/lib/data";
import { setupPath } from "@/lib/setup";
import type { BusinessCategory, Industry, Site, SiteTemplateSelection, Template } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { getWebsiteCardState, type WebsiteCardState } from "@/app/dashboard/websites/website-card-state";

const badgeClass: Record<WebsiteCardState["state"], string> = {
  setup_incomplete: "border-amber-200 bg-amber-50 text-amber-800",
  design_required: "border-sky-200 bg-sky-50 text-sky-800",
  ready_to_review: "border-brand-200 bg-brand-50 text-brand-700",
  ready_to_publish: "border-emerald-200 bg-emerald-50 text-emerald-800",
  published_synced: "border-emerald-200 bg-emerald-50 text-emerald-800",
  published_with_changes: "border-amber-200 bg-amber-50 text-amber-800",
  unpublished: "border-slate-200 bg-slate-50 text-slate-700",
  suspended: "border-red-200 bg-red-50 text-red-700"
};

function platformDomain() {
  return process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "yourplatform.com";
}

function publicUrl(subdomain: string | null) {
  if (!subdomain) return null;
  return `${subdomain}.${platformDomain()}`;
}

function changeDesignHref(siteId: string, categoryId?: string | null) {
  return `/dashboard/websites/${siteId}/setup/templates${categoryId ? `?category=${categoryId}` : ""}`;
}

function PrimaryAction({
  state,
  site,
  selection
}: {
  state: WebsiteCardState;
  site: Site;
  selection?: SiteTemplateSelection | null;
}) {
  if (state.primaryAction === "continue_setup") {
    return (
      <ButtonLink href={setupPath(site.id, site.setup_step)}>
        <Pencil size={16} />
        Continue Setup
      </ButtonLink>
    );
  }

  if (state.primaryAction === "prepare_recommended" && selection?.business_category_id) {
    return (
      <form action={prepareRecommendedDesignAction}>
        <input type="hidden" name="siteId" value={site.id} />
        <input type="hidden" name="categoryId" value={selection.business_category_id} />
        <Button type="submit" className="w-full">
          <Sparkles size={16} />
          Prepare Recommended Design
        </Button>
      </form>
    );
  }

  if (state.primaryAction === "preview") {
    return (
      <ButtonLink href={`/dashboard/websites/${site.id}/preview`}>
        <Eye size={16} />
        Preview Website
      </ButtonLink>
    );
  }

  if (state.primaryAction === "view_details") {
    return (
      <ButtonLink href={`/dashboard/websites/${site.id}`} variant="secondary">
        View Details
      </ButtonLink>
    );
  }

  return (
    <ButtonLink href={`/dashboard/websites/${site.id}/editor`}>
      <Pencil size={16} />
      Edit Website
    </ButtonLink>
  );
}

function PublishPanel({ site, state }: { site: Site; state: WebsiteCardState }) {
  if (!state.showPublishAction || !state.publishLabel) return null;

  return (
    <details className="rounded-app border border-line bg-white">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-brand-700 marker:hidden">
        <Globe2 size={16} />
        {state.publishLabel}
      </summary>
      <form action={publishWebsiteAction} className="grid gap-3 border-t border-line p-3">
        <input type="hidden" name="siteId" value={site.id} />
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Website address
          <div className="flex min-w-0 items-center rounded-app border border-line bg-white focus-within:ring-2 focus-within:ring-brand-700">
            <input
              className={`${inputClassName} border-0 focus:ring-0`}
              name="subdomain"
              defaultValue={site.primary_subdomain ?? site.slug}
              pattern="[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?"
            />
            <span className="shrink-0 pr-3 text-sm text-muted">.{platformDomain()}</span>
          </div>
        </label>
        <Button type="submit">
          <Globe2 size={16} />
          {state.publishLabel}
        </Button>
      </form>
    </details>
  );
}

function MoreActions({
  site,
  state,
  selection
}: {
  site: Site;
  state: WebsiteCardState;
  selection?: SiteTemplateSelection | null;
}) {
  const hasAny =
    state.showChangeDesign ||
    state.showLiveAction ||
    state.showPreviewAction ||
    site.publication_status === "published" ||
    Boolean(selection?.business_category_id);
  if (!hasAny) return null;

  return (
    <details className="rounded-app border border-line bg-white">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-ink marker:hidden">
        <MoreHorizontal size={16} />
        More actions
      </summary>
      <div className="grid gap-1 border-t border-line p-2">
        {state.showChangeDesign ? (
          <ButtonLink href={changeDesignHref(site.id, selection?.business_category_id)} variant="ghost" className="justify-start">
            <Palette size={16} />
            Change Design
          </ButtonLink>
        ) : null}
        <ButtonLink href={`/dashboard/websites/${site.id}/editor/design`} variant="ghost" className="justify-start">
          <Settings size={16} />
          Website Settings
        </ButtonLink>
        <ButtonLink href={`/dashboard/websites/${site.id}/editor/design`} variant="ghost" className="justify-start">
          <Settings size={16} />
          SEO Settings
        </ButtonLink>
        <ButtonLink href={`/dashboard/websites/${site.id}/leads`} variant="ghost" className="justify-start">
          Leads
        </ButtonLink>
        {site.publication_status === "published" ? (
          <form action={unpublishWebsiteAction}>
            <input type="hidden" name="siteId" value={site.id} />
            <Button type="submit" variant="ghost" className="w-full justify-start text-ink">
              Unpublish
            </Button>
          </form>
        ) : null}
      </div>
    </details>
  );
}

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
          <p className="mt-1 text-sm text-muted">Review each website, preview drafts, and publish when ready.</p>
        </div>
        <ButtonLink href="/dashboard/websites/new">
          <Plus size={16} />
          Create website
        </ButtonLink>
      </div>
      {sites.length ? (
        <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sites.map((site) => {
            const selection = selections?.find((item) => item.site_id === site.id);
            const industry = industries?.find((item) => item.id === selection?.industry_id);
            const category = categories?.find((item) => item.id === selection?.business_category_id);
            const template = templates?.find((item) => item.id === selection?.template_id);
            const state = getWebsiteCardState({ site, selection, industry, category, template });
            const url = publicUrl(site.primary_subdomain);

            return (
              <Card key={site.id} className="flex min-w-0 flex-col p-5">
                <div className="flex min-w-0 items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="break-words text-lg font-bold text-ink">{site.name}</h3>
                    <p className="mt-1 break-words text-sm text-muted">{state.showPublicUrl && url ? url : `Draft /${site.slug}`}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${badgeClass[state.state]}`}>{state.badge}</span>
                </div>

                <div className="mt-4 rounded-app bg-canvas p-4">
                  <h4 className="font-bold text-ink">{state.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-muted">{state.description}</p>
                  {state.showPublicUrl && url ? (
                    <ButtonLink href={publicSitePath(site.primary_subdomain ?? "")} variant="ghost" className="mt-3 justify-start px-0">
                      <ExternalLink size={16} />
                      View Live Site
                    </ButtonLink>
                  ) : null}
                </div>

                <dl className="mt-5 grid gap-2 text-sm text-muted">
                  <div className="flex justify-between gap-3">
                    <dt>Category</dt>
                    <dd className="text-right font-semibold text-ink">{category?.name ?? "Not added yet"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Design</dt>
                    <dd className="text-right font-semibold text-ink">{template?.name ?? (category ? "Preparing" : "Not selected")}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Last updated</dt>
                    <dd className="font-semibold text-ink">{formatDate(site.updated_at)}</dd>
                  </div>
                  {site.published_at ? (
                    <div className="flex justify-between gap-3">
                      <dt>Last published</dt>
                      <dd className="font-semibold text-ink">{formatDate(site.published_at)}</dd>
                    </div>
                  ) : null}
                </dl>

                {industry ? <p className="mt-3 text-xs font-semibold text-muted">Industry: {industry.name}</p> : null}

                <div className="mt-auto grid gap-2 pt-5">
                  <PrimaryAction state={state} site={site} selection={selection} />
                  <div className="grid gap-2 min-[460px]:grid-cols-2">
                    {state.showPreviewAction && state.previewLabel && state.primaryAction !== "preview" ? (
                      <ButtonLink href={`/dashboard/websites/${site.id}/preview`} variant="secondary">
                        <Eye size={16} />
                        {state.previewLabel}
                      </ButtonLink>
                    ) : null}
                    {state.showLiveAction && site.primary_subdomain ? (
                      <ButtonLink href={publicSitePath(site.primary_subdomain)} variant="secondary">
                        <ExternalLink size={16} />
                        View Live Site
                      </ButtonLink>
                    ) : null}
                  </div>
                  <PublishPanel site={site} state={state} />
                  <MoreActions site={site} state={state} selection={selection} />
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Create your first website"
          description="Enter your business basics and we will prepare a recommended website design automatically."
          action={<ButtonLink href="/dashboard/websites/new">Create website</ButtonLink>}
        />
      )}
    </div>
  );
}
