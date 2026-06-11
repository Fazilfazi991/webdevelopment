import { ExternalLink, Eye, Globe2, Palette, Pencil, Plus, Sparkles } from "lucide-react";
import { prepareRecommendedDesignAction } from "@/app/setup-actions";
import { publishWebsiteAction, unpublishWebsiteAction } from "@/app/publishing-actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";
import { inputClassName } from "@/components/ui/field";
import { platformDomain } from "@/lib/publishing/constants";
import { requireDashboardContext } from "@/lib/data";
import { setupPath } from "@/lib/setup";
import type { BusinessCategory, Industry, Site, SiteTemplateSelection, Template } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { getWebsiteCardState, type WebsiteCardState } from "@/app/dashboard/websites/website-card-state";

// ─── Badge styles ─────────────────────────────────────────────────────────────

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

function publicUrl(subdomain: string | null) {
  if (!subdomain) return null;
  return `${subdomain}.${platformDomain()}`;
}

function changeDesignHref(siteId: string, categoryId?: string | null) {
  return `/dashboard/websites/${siteId}/setup/templates${categoryId ? `?category=${categoryId}` : ""}`;
}

// ─── Primary action button ────────────────────────────────────────────────────

function PrimaryAction({
  state,
  site,
  selection
}: {
  state: WebsiteCardState;
  site: Site;
  selection?: SiteTemplateSelection | null;
}) {
  const btnCls = "w-full min-h-[52px] text-sm";

  if (state.primaryAction === "continue_setup") {
    return (
      <ButtonLink href={setupPath(site.id, site.setup_step)} className={btnCls}>
        <Pencil size={16} /> Continue Setup
      </ButtonLink>
    );
  }

  if (state.primaryAction === "prepare_recommended" && selection?.business_category_id) {
    return (
      <form action={prepareRecommendedDesignAction}>
        <input type="hidden" name="siteId" value={site.id} />
        <input type="hidden" name="categoryId" value={selection.business_category_id} />
        <Button type="submit" className={btnCls}>
          <Sparkles size={16} /> Prepare Recommended Design
        </Button>
      </form>
    );
  }

  if (state.primaryAction === "preview") {
    return (
      <ButtonLink href={`/dashboard/websites/${site.id}/preview`} className={btnCls}>
        <Eye size={16} /> Preview Website
      </ButtonLink>
    );
  }

  if (state.primaryAction === "view_details") {
    return (
      <ButtonLink href={`/dashboard/websites/${site.id}`} variant="secondary" className={btnCls}>
        View Details
      </ButtonLink>
    );
  }

  return (
    <ButtonLink href={`/dashboard/websites/${site.id}/editor`} className={btnCls}>
      <Pencil size={16} /> Edit Website
    </ButtonLink>
  );
}

// ─── Publish panel ────────────────────────────────────────────────────────────

function PublishPanel({ site, state }: { site: Site; state: WebsiteCardState }) {
  if (!state.showPublishAction || !state.publishLabel) return null;

  const domain = platformDomain();

  return (
    <details className="rounded-xl border border-line bg-white">
      <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-brand-700 marker:hidden">
        <Globe2 size={16} />
        {state.publishLabel}
      </summary>
      <form action={publishWebsiteAction} className="grid gap-3 border-t border-line p-4">
        <input type="hidden" name="siteId" value={site.id} />
        <label className="grid gap-1.5 text-sm font-semibold text-ink">
          Website address
          <div className="flex min-w-0 items-center rounded-xl border border-line bg-white focus-within:ring-2 focus-within:ring-brand-100">
            <input
              className={`${inputClassName} rounded-xl border-0 focus:ring-0 min-h-[48px]`}
              name="subdomain"
              defaultValue={site.primary_subdomain ?? site.slug}
              pattern="[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?"
            />
            <span className="shrink-0 pr-3 text-sm text-muted">.{domain}</span>
          </div>
          <span className="text-xs font-normal text-muted">Your website will be available online immediately.</span>
        </label>
        <Button type="submit" className="w-full min-h-[52px]">
          <Globe2 size={16} />
          {state.publishLabel}
        </Button>
      </form>
    </details>
  );
}

// ─── Share bar (shown after publish) ─────────────────────────────────────────

function ShareBar({ subdomain }: { subdomain: string }) {
  const url = `https://${subdomain}.${platformDomain()}`;
  const waText = encodeURIComponent(`Check out my website: ${url}`);
  return (
    <div className="grid grid-cols-3 gap-2">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl border border-line bg-canvas text-xs font-semibold text-ink transition hover:bg-brand-50"
      >
        <ExternalLink size={16} />
        Open
      </a>
      <a
        href={`https://wa.me/?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
      >
        <span className="text-base">💬</span>
        WhatsApp
      </a>
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(url)}
        className="flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl border border-line bg-canvas text-xs font-semibold text-ink transition hover:bg-brand-50"
      >
        <span className="text-base">📋</span>
        Copy link
      </button>
    </div>
  );
}

// ─── More actions ─────────────────────────────────────────────────────────────

function MoreActions({
  site,
  state,
  selection
}: {
  site: Site;
  state: WebsiteCardState;
  selection?: SiteTemplateSelection | null;
}) {
  return (
    <details className="rounded-xl border border-line bg-white">
      <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-center gap-2 px-4 text-sm font-semibold text-muted marker:hidden">
        More options
      </summary>
      <div className="grid gap-1 border-t border-line p-2">
        {state.showChangeDesign && (
          <ButtonLink href={changeDesignHref(site.id, selection?.business_category_id)} variant="ghost" className="justify-start min-h-[44px]">
            <Palette size={16} /> Change Design
          </ButtonLink>
        )}
        <ButtonLink href={`/dashboard/websites/${site.id}/editor/design`} variant="ghost" className="justify-start min-h-[44px]">
          Website Settings
        </ButtonLink>
        <ButtonLink href={`/dashboard/websites/${site.id}/leads`} variant="ghost" className="justify-start min-h-[44px]">
          View Leads
        </ButtonLink>
        {site.publication_status === "published" && (
          <form action={unpublishWebsiteAction}>
            <input type="hidden" name="siteId" value={site.id} />
            <Button type="submit" variant="ghost" className="w-full justify-start text-muted min-h-[44px]">
              Unpublish
            </Button>
          </form>
        )}
      </div>
    </details>
  );
}

// ─── Website card ─────────────────────────────────────────────────────────────

function WebsiteCard({
  site,
  state,
  selection,
  template,
  category
}: {
  site: Site;
  state: WebsiteCardState;
  selection?: SiteTemplateSelection | null;
  template?: Template | null;
  category?: BusinessCategory | null;
}) {
  const url = publicUrl(site.primary_subdomain);
  const isLive = site.publication_status === "published";

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
      {/* Status strip */}
      <div className={`flex items-center justify-between gap-3 px-4 py-3 border-b ${isLive ? "border-emerald-100 bg-emerald-50" : "border-line bg-canvas"}`}>
        <div className="flex items-center gap-2">
          {isLive && <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
          <span className={`text-xs font-bold rounded-full border px-2.5 py-0.5 ${badgeClass[state.state]}`}>
            {state.badge}
          </span>
        </div>
        <p className="text-xs text-muted">Updated {formatDate(site.updated_at)}</p>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Name + URL */}
        <div>
          <h3 className="break-words text-lg font-bold text-ink">{site.name}</h3>
          {state.showPublicUrl && url ? (
            <p className="mt-0.5 break-all text-sm text-brand-700">{url}</p>
          ) : (
            <p className="mt-0.5 text-sm text-muted">/{site.slug}</p>
          )}
        </div>

        {/* State description */}
        <div className="rounded-xl bg-canvas px-4 py-3">
          <p className="text-xs font-bold text-muted">{state.title}</p>
          <p className="mt-1 text-sm leading-5 text-muted">{state.description}</p>
          {category && (
            <p className="mt-1.5 text-xs text-muted">
              {template ? `Design: ${template.name}` : `Category: ${category.name}`}
            </p>
          )}
        </div>

        {/* Share bar when published */}
        {isLive && site.primary_subdomain && (
          <ShareBar subdomain={site.primary_subdomain} />
        )}

        {/* Actions */}
        <div className="mt-auto grid gap-2">
          <PrimaryAction state={state} site={site} selection={selection} />

          {state.showPreviewAction && state.previewLabel && state.primaryAction !== "preview" && (
            <ButtonLink href={`/dashboard/websites/${site.id}/preview`} variant="secondary" className="w-full min-h-[48px]">
              <Eye size={16} /> {state.previewLabel}
            </ButtonLink>
          )}

          <PublishPanel site={site} state={state} />
          <MoreActions site={site} state={state} selection={selection} />
        </div>
      </div>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function WebsitesPage() {
  const { supabase, sites } = await requireDashboardContext();
  const siteIds = sites.map((site) => site.id);

  const { data: selections } = siteIds.length
    ? await supabase.from("site_template_selections").select("*").in("site_id", siteIds).returns<SiteTemplateSelection[]>()
    : { data: [] as SiteTemplateSelection[] };

  const industryIds = [...new Set((selections ?? []).map((s) => s.industry_id))];
  const categoryIds = [...new Set((selections ?? []).map((s) => s.business_category_id).filter(Boolean))] as string[];
  const templateIds = [...new Set((selections ?? []).map((s) => s.template_id).filter(Boolean))] as string[];

  const { data: industries } = industryIds.length
    ? await supabase.from("industries").select("*").in("id", industryIds).returns<Industry[]>()
    : { data: [] as Industry[] };
  const { data: categories } = categoryIds.length
    ? await supabase.from("business_categories").select("*").in("id", categoryIds).returns<BusinessCategory[]>()
    : { data: [] as BusinessCategory[] };
  const { data: templates } = templateIds.length
    ? await supabase.from("templates").select("*").in("id", templateIds).returns<Template[]>()
    : { data: [] as Template[] };

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">My Websites</h2>
          <p className="mt-1 text-sm text-muted">Review, preview, and publish your websites.</p>
        </div>
        <ButtonLink href="/dashboard/websites/new" className="min-h-[48px]">
          <Plus size={16} /> Create website
        </ButtonLink>
      </div>

      {sites.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sites.map((site) => {
            const selection = selections?.find((item) => item.site_id === site.id);
            const industry = industries?.find((item) => item.id === selection?.industry_id);
            const category = categories?.find((item) => item.id === selection?.business_category_id);
            const template = templates?.find((item) => item.id === selection?.template_id);
            const state = getWebsiteCardState({ site, selection, industry, category, template });

            return (
              <WebsiteCard
                key={site.id}
                site={site}
                state={state}
                selection={selection}
                template={template}
                category={category}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Create your first website"
          description="Enter your business basics and we'll prepare a recommended website design automatically."
          action={<ButtonLink href="/dashboard/websites/new">Create website</ButtonLink>}
        />
      )}
    </div>
  );
}
