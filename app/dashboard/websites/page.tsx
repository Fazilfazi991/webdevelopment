import {
  BriefcaseBusiness,
  ChevronRight,
  Ellipsis,
  ExternalLink,
  Eye,
  FileImage,
  Globe2,
  Pencil,
  Plus,
  Sparkles,
  Upload,
  Users
} from "lucide-react";
import { prepareRecommendedDesignAction } from "@/app/setup-actions";
import { publishWebsiteAction } from "@/app/publishing-actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";
import { inputClassName } from "@/components/ui/field";
import { platformDomain } from "@/lib/publishing/constants";
import { requireDashboardContext } from "@/lib/data";
import { setupPath } from "@/lib/setup";
import type { BusinessCategory, ContactLead, Industry, Site, SiteTemplateSelection, Template } from "@/lib/types";
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

type LeadSummary = Pick<ContactLead, "site_id" | "status" | "is_read">;

type WebsiteView = {
  site: Site;
  state: WebsiteCardState;
  selection?: SiteTemplateSelection | null;
  industry?: Industry | null;
  category?: BusinessCategory | null;
  template?: Template | null;
  leadCount: number;
  unreadLeadCount: number;
};

function publicUrl(subdomain: string | null) {
  if (!subdomain) return null;
  return `${subdomain}.${platformDomain()}`;
}

function displayUrl(site: Site, state: WebsiteCardState) {
  const liveUrl = state.showPublicUrl ? publicUrl(site.primary_subdomain) : null;
  return liveUrl ?? `/${site.slug}${site.publication_status === "published" ? "" : ".draft"}`;
}

function changeDesignHref(siteId: string, categoryId?: string | null) {
  return `/dashboard/websites/${siteId}/setup/templates${categoryId ? `?category=${categoryId}` : ""}`;
}

function coverImage(template?: Template | null) {
  if (template?.thumbnail_url) return template.thumbnail_url;
  if (template?.slug) return `/templates/${template.slug}/cover.webp`;
  return "/templates/technical-services-modern/cover.webp";
}

function MainPrimaryAction({ view }: { view: WebsiteView }) {
  const { site, state, selection } = view;

  if (state.primaryAction === "continue_setup") {
    return (
      <ButtonLink href={setupPath(site.id, site.setup_step)} className="min-h-[54px] w-full text-base lg:w-auto lg:px-8">
        <Pencil size={18} />
        Continue Setup
      </ButtonLink>
    );
  }

  if (state.primaryAction === "prepare_recommended" && selection?.business_category_id) {
    return (
      <form action={prepareRecommendedDesignAction}>
        <input type="hidden" name="siteId" value={site.id} />
        <input type="hidden" name="categoryId" value={selection.business_category_id} />
        <Button type="submit" className="min-h-[54px] w-full text-base lg:w-auto lg:px-8">
          <Sparkles size={18} />
          Prepare Recommended Design
        </Button>
      </form>
    );
  }

  return (
    <ButtonLink href={`/dashboard/websites/${site.id}/editor`} className="min-h-[54px] w-full text-base lg:w-auto lg:px-8">
      <Pencil size={18} />
      Edit Website
    </ButtonLink>
  );
}

function PublishDetails({ site, state, compact = false }: { site: Site; state: WebsiteCardState; compact?: boolean }) {
  if (!state.showPublishAction || !state.publishLabel) return null;

  const domain = platformDomain();

  return (
    <details className={compact ? "group" : "group rounded-xl border border-line bg-white"}>
      <summary
        className={
          compact
            ? "inline-flex min-h-[48px] w-full cursor-pointer list-none items-center justify-center gap-2 rounded-app border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-brand-50 marker:hidden"
            : "flex min-h-[52px] cursor-pointer list-none items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-brand-700 marker:hidden"
        }
      >
        <Upload size={16} />
        {compact ? state.publishLabel.replace(" Website", "") : state.publishLabel}
      </summary>
      <form action={publishWebsiteAction} className={compact ? "mt-2 grid gap-3 rounded-xl border border-line bg-white p-4" : "grid gap-3 border-t border-line p-4"}>
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
          <span className="text-xs font-normal text-muted">Your website will be available online immediately.</span>
        </label>
        <Button type="submit" className="min-h-[52px] w-full">
          <Globe2 size={16} />
          {state.publishLabel}
        </Button>
      </form>
    </details>
  );
}

function LiveAction({ site, state }: { site: Site; state: WebsiteCardState }) {
  const url = state.showLiveAction && site.primary_subdomain ? `https://${site.primary_subdomain}.${platformDomain()}` : null;
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-app border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-brand-50"
    >
      <ExternalLink size={16} />
      View Live Site
    </a>
  );
}

function MainPreview({ view }: { view: WebsiteView }) {
  const { site, state, template } = view;

  return (
    <div className="relative min-h-[260px] overflow-hidden rounded-t-2xl bg-ink lg:rounded-2xl">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(90deg, rgba(8, 19, 18, 0.76), rgba(8, 19, 18, 0.18)), url('${coverImage(template)}')` }}
        aria-label={`${site.name} website preview`}
      />
      <div className="relative flex h-full min-h-[260px] flex-col justify-between p-5 text-white sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-brand-700/90 px-4 text-xs font-bold uppercase tracking-wide text-white">
            <Globe2 size={16} />
            Main Website
          </span>
          <details className="lg:hidden">
            <summary className="flex size-12 cursor-pointer list-none items-center justify-center rounded-xl border border-white/50 bg-white/15 marker:hidden">
              <Ellipsis size={22} />
            </summary>
            <div className="absolute right-5 top-20 z-10 grid w-56 gap-1 rounded-xl border border-white/20 bg-white p-2 text-ink shadow-soft">
              <ButtonLink href={`/dashboard/websites/${site.id}/editor/settings`} variant="ghost" className="justify-start">
                Edit details
              </ButtonLink>
              {state.showChangeDesign ? (
                <ButtonLink href={changeDesignHref(site.id, view.selection?.business_category_id)} variant="ghost" className="justify-start">
                  Change design
                </ButtonLink>
              ) : null}
            </div>
          </details>
        </div>
        <div className="max-w-sm">
          <p className="text-sm font-semibold text-white/85">{template?.style_label ?? "Business website"}</p>
          <h3 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">{site.seo_title ?? site.name}</h3>
          <p className="mt-3 text-sm leading-6 text-white/85">{site.seo_description ?? "Your website preview is ready to edit, preview, and publish."}</p>
        </div>
      </div>
    </div>
  );
}

function QuickActionGrid({ view }: { view: WebsiteView }) {
  const { site } = view;
  const quickActions = [
    {
      href: `/dashboard/media?site=${site.id}`,
      label: "Update Photos",
      description: "Add or replace photos",
      icon: FileImage
    },
    {
      href: `/dashboard/websites/${site.id}/editor/services`,
      label: "Add Service",
      description: "Expand your offerings",
      icon: BriefcaseBusiness
    },
    {
      href: `/dashboard/websites/${site.id}/leads`,
      label: "View Leads",
      description: "See and manage leads",
      icon: Users
    },
    {
      href: `/dashboard/websites/${site.id}/editor/settings`,
      label: "More Actions",
      description: "Additional tools",
      icon: Ellipsis
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {quickActions.map((action) => (
        <ButtonLink
          key={action.label}
          href={action.href}
          variant="secondary"
          className="min-h-[74px] justify-start rounded-xl px-4 text-left"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <action.icon size={20} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-ink">{action.label}</span>
            <span className="mt-0.5 block text-xs font-normal text-muted">{action.description}</span>
          </span>
        </ButtonLink>
      ))}
    </div>
  );
}

function MainWebsitePanel({ view }: { view: WebsiteView }) {
  const { site, state } = view;

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
      <div className="grid gap-0 lg:grid-cols-[minmax(320px,0.85fr)_1.55fr] lg:p-5">
        <MainPreview view={view} />

        <div className="grid gap-5 p-5 lg:p-4 lg:pl-8">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="break-words text-2xl font-bold text-ink">{site.name}</h2>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${badgeClass[state.state]}`}>{state.badge}</span>
              </div>
              <p className="mt-1 break-all text-base font-semibold text-muted">{displayUrl(site, state)}</p>
            </div>

            <div className="hidden gap-2 lg:flex">
              <MainPrimaryAction view={view} />
              {state.showPreviewAction ? (
                <ButtonLink href={`/dashboard/websites/${site.id}/preview`} variant="secondary" className="min-h-[54px] px-6">
                  <Eye size={17} />
                  Preview
                </ButtonLink>
              ) : null}
              <LiveAction site={site} state={state} />
              <PublishDetails site={site} state={state} compact />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 border-y border-line py-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted">Status</p>
              <p className="mt-1 truncate text-sm font-bold text-ink">{state.badge}</p>
            </div>
            <div className="min-w-0 border-l border-line pl-3">
              <p className="text-xs font-semibold text-muted">Last updated</p>
              <p className="mt-1 truncate text-sm font-bold text-ink">{formatDate(site.updated_at)}</p>
            </div>
            <div className="min-w-0 border-l border-line pl-3">
              <p className="text-xs font-semibold text-muted">Leads</p>
              <p className="mt-1 truncate text-sm font-bold text-brand-700">{view.leadCount}</p>
            </div>
          </div>

          <div className="grid gap-2 lg:hidden">
            <MainPrimaryAction view={view} />
            <div className="grid grid-cols-2 gap-2">
              {state.showPreviewAction ? (
                <ButtonLink href={`/dashboard/websites/${site.id}/preview`} variant="secondary" className="min-h-[50px]">
                  <Eye size={17} />
                  Preview
                </ButtonLink>
              ) : null}
              <LiveAction site={site} state={state} />
              <PublishDetails site={site} state={state} compact />
            </div>
          </div>

          <QuickActionGrid view={view} />
        </div>
      </div>
    </section>
  );
}

function OtherWebsiteRow({ view }: { view: WebsiteView }) {
  const { site, state, template } = view;

  return (
    <a
      href={`/dashboard/websites/${site.id}/editor`}
      className="grid min-h-[76px] grid-cols-[72px_1fr_auto] items-center gap-3 rounded-xl border border-line bg-white p-2 transition hover:border-brand-200 hover:bg-brand-50/40"
    >
      <div
        className="h-[58px] rounded-lg bg-cover bg-center"
        style={{ backgroundImage: `url('${coverImage(template)}')` }}
        aria-label={`${site.name} preview`}
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-ink">{site.name}</p>
        <p className="mt-0.5 truncate text-sm text-muted">{displayUrl(site, state)}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`hidden rounded-full border px-3 py-1 text-xs font-bold sm:inline-flex ${badgeClass[state.state]}`}>{state.badge}</span>
        <ChevronRight size={18} className="text-muted" />
      </div>
    </a>
  );
}

function OtherWebsites({ views }: { views: WebsiteView[] }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-ink">Other websites</h3>
        <ButtonLink href="/dashboard/websites/new" variant="ghost" className="min-h-10 px-3">
          <Plus size={16} />
          Create
        </ButtonLink>
      </div>
      <div className="grid gap-2">
        {views.map((view) => (
          <OtherWebsiteRow key={view.site.id} view={view} />
        ))}
        <ButtonLink href="/dashboard/websites/new" variant="secondary" className="min-h-[58px] rounded-xl">
          <Plus size={18} />
          Create another website
        </ButtonLink>
      </div>
    </section>
  );
}

export default async function WebsitesPage() {
  const { supabase, sites, profile } = await requireDashboardContext();
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
  const { data: leads } = siteIds.length
    ? await supabase.from("contact_leads").select("site_id,status,is_read").in("site_id", siteIds).returns<LeadSummary[]>()
    : { data: [] as LeadSummary[] };

  const views = sites.map((site) => {
    const selection = selections?.find((item) => item.site_id === site.id);
    const industry = industries?.find((item) => item.id === selection?.industry_id);
    const category = categories?.find((item) => item.id === selection?.business_category_id);
    const template = templates?.find((item) => item.id === selection?.template_id);
    const state = getWebsiteCardState({ site, selection, industry, category, template });
    const siteLeads = (leads ?? []).filter((lead) => lead.site_id === site.id);

    return {
      site,
      state,
      selection,
      industry,
      category,
      template,
      leadCount: siteLeads.length,
      unreadLeadCount: siteLeads.filter((lead) => !lead.is_read).length
    };
  });

  const mainView = views[0];
  const otherViews = views.slice(1);
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted">Welcome back,</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">{firstName}</h2>
        </div>
        {mainView ? (
          <span className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-bold ${badgeClass[mainView.state.state]}`}>
            <span className="size-2 rounded-full bg-current" />
            {mainView.state.badge}
          </span>
        ) : null}
      </div>

      {mainView ? (
        <>
          <MainWebsitePanel view={mainView} />
          {otherViews.length ? <OtherWebsites views={otherViews} /> : null}
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
