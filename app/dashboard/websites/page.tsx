import { ExternalLink, Eye, Globe2, Pencil, Plus, Sparkles, Upload } from "lucide-react";
import { prepareRecommendedDesignAction } from "@/app/setup-actions";
import { publishWebsiteAction } from "@/app/publishing-actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";
import { inputClassName } from "@/components/ui/field";
import { platformDomain } from "@/lib/publishing/constants";
import { requireDashboardContext } from "@/lib/data";
import { setupPath } from "@/lib/setup";
import type { BusinessCategory, Industry, Site, SiteTemplateSelection, Template } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { getWebsiteCardState, type WebsiteCardState } from "@/app/dashboard/websites/website-card-state";

const badgeClass: Record<WebsiteCardState["state"], string> = {
  setup_incomplete: "border-amber-200 bg-amber-50 text-amber-800",
  design_required: "border-sky-200 bg-sky-50 text-sky-800",
  ready_to_review: "border-emerald-200 bg-emerald-50 text-emerald-800",
  ready_to_publish: "border-emerald-200 bg-emerald-50 text-emerald-800",
  published_synced: "border-emerald-200 bg-emerald-50 text-emerald-800",
  published_with_changes: "border-amber-200 bg-amber-50 text-amber-800",
  unpublished: "border-slate-200 bg-slate-50 text-slate-700",
  suspended: "border-red-200 bg-red-50 text-red-700"
};

type WebsiteView = {
  site: Site;
  state: WebsiteCardState;
  selection?: SiteTemplateSelection | null;
  industry?: Industry | null;
  category?: BusinessCategory | null;
  template?: Template | null;
};

function publicUrl(subdomain: string | null) {
  if (!subdomain) return null;
  return `${subdomain}.${platformDomain()}`;
}

function displayUrl(site: Site, state: WebsiteCardState) {
  return state.showPublicUrl ? publicUrl(site.primary_subdomain) ?? `/${site.slug}` : `/${site.slug}.draft`;
}

function coverImage(template?: Template | null) {
  if (template?.slug) return `/templates/${template.slug}/cover.webp`;
  return "/templates/technical-services-modern/cover.webp";
}

function PublishAction({ site, state }: { site: Site; state: WebsiteCardState }) {
  if (!state.showPublishAction || !state.publishLabel) return null;
  const domain = platformDomain();

  return (
    <details className="group">
      <summary className="inline-flex min-h-[48px] w-full cursor-pointer list-none items-center justify-center gap-2 rounded-app border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-brand-50 marker:hidden">
        <Upload size={16} />
        {state.publishLabel}
      </summary>
      <form action={publishWebsiteAction} className="mt-2 grid gap-3 rounded-xl border border-line bg-white p-4">
        <input type="hidden" name="siteId" value={site.id} />
        <label className="grid gap-1.5 text-sm font-semibold text-ink">
          Website address
          <div className="flex min-w-0 items-center rounded-xl border border-line bg-white focus-within:ring-2 focus-within:ring-brand-100">
            <input
              className={`${inputClassName} min-h-[48px] rounded-xl border-0 focus:ring-0`}
              name="subdomain"
              defaultValue={site.primary_subdomain ?? site.slug}
              pattern="[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?"
            />
            <span className="shrink-0 pr-3 text-sm text-muted">.{domain}</span>
          </div>
        </label>
        <Button type="submit" className="min-h-[52px] w-full">
          <Globe2 size={16} />
          {state.publishLabel}
        </Button>
      </form>
    </details>
  );
}

function WebsitePrimaryAction({ view }: { view: WebsiteView }) {
  const { site, state, selection } = view;

  if (state.primaryAction === "continue_setup") {
    return (
      <ButtonLink href={setupPath(site.id, site.setup_step)} className="min-h-[48px] w-full">
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
        <Button type="submit" className="min-h-[48px] w-full">
          <Sparkles size={16} />
          Prepare Recommended Design
        </Button>
      </form>
    );
  }

  return (
    <ButtonLink href={`/dashboard/websites/${site.id}`} className="min-h-[48px] w-full">
      <Globe2 size={16} />
      Manage Website
    </ButtonLink>
  );
}

function WebsiteCard({ view }: { view: WebsiteView }) {
  const { site, state, template, category } = view;
  const liveUrl = state.showLiveAction && site.primary_subdomain ? `https://${site.primary_subdomain}.${platformDomain()}` : null;

  return (
    <article className="grid overflow-hidden rounded-2xl border border-line bg-white shadow-soft md:grid-cols-[240px_1fr]">
      <div className="relative min-h-[170px] bg-ink md:min-h-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(180deg, rgba(8, 19, 18, 0.08), rgba(8, 19, 18, 0.42)), url('${coverImage(template)}')` }}
          aria-label={`${site.name} preview`}
        />
        <span className="absolute left-4 top-4 inline-flex min-h-9 items-center gap-2 rounded-xl bg-brand-700/95 px-3 text-xs font-bold uppercase tracking-wide text-white">
          <Globe2 size={15} />
          Website
        </span>
      </div>

      <div className="grid gap-4 p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="break-words text-xl font-bold text-ink">{site.name}</h3>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${badgeClass[state.state]}`}>{state.badge}</span>
            </div>
            <p className="mt-1 truncate text-sm font-semibold text-muted">{displayUrl(site, state)}</p>
            <p className="mt-2 text-xs text-muted">
              {category ? `Category: ${category.name}` : "Business website"} · Updated {formatDate(site.updated_at)}
            </p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[1fr_auto_auto_auto]">
          <WebsitePrimaryAction view={view} />
          <ButtonLink href={`/dashboard/websites/${site.id}/preview`} variant="secondary" className="min-h-[48px]">
            <Eye size={16} />
            Preview
          </ButtonLink>
          {liveUrl ? (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-app border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-brand-50"
            >
              <ExternalLink size={16} />
              View Live Site
            </a>
          ) : null}
          <PublishAction site={site} state={state} />
        </div>
      </div>
    </article>
  );
}

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

  const views = sites.map((site) => {
    const selection = selections?.find((item) => item.site_id === site.id);
    const industry = industries?.find((item) => item.id === selection?.industry_id);
    const category = categories?.find((item) => item.id === selection?.business_category_id);
    const template = templates?.find((item) => item.id === selection?.template_id);
    const state = getWebsiteCardState({ site, selection, industry, category, template });
    return { site, state, selection, industry, category, template };
  });

  const publishedCount = sites.filter((site) => site.publication_status === "published").length;
  const draftCount = sites.length - publishedCount;

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h2 className="text-2xl font-bold text-ink">My Websites</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Choose a website to manage. Photos, enquiries, SEO, and settings live inside each website workspace.</p>
        </div>
        <ButtonLink href="/dashboard/websites/new" className="min-h-[48px] w-full lg:w-auto">
          <Plus size={16} />
          Create website
        </ButtonLink>
      </div>

      {sites.length ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-widest text-muted">Websites</p>
              <p className="mt-2 text-2xl font-bold text-ink">{sites.length}</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-widest text-muted">Published</p>
              <p className="mt-2 text-2xl font-bold text-brand-700">{publishedCount}</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-widest text-muted">Drafts</p>
              <p className="mt-2 text-2xl font-bold text-amber-700">{draftCount}</p>
            </div>
          </div>

          <div className="grid gap-4">
            {views.map((view) => (
              <WebsiteCard key={view.site.id} view={view} />
            ))}
          </div>
        </>
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
