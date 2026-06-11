import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Globe2,
  Image as ImageIcon,
  Layout,
  Monitor,
  Palette,
  Save,
  Settings,
  Smartphone,
  Tablet
} from "lucide-react";
import { saveVersionAction } from "@/app/editor-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { Button, ButtonLink } from "@/components/ui/button";
import { SiteRenderer } from "@/components/site-renderer/site-renderer";
import { applyEditorMerges, loadEditorContext } from "@/lib/site-editor/editor-loader";
import { requireSiteSetup } from "@/lib/setup";
import { hasPermission } from "@/lib/access-control";
import { cn } from "@/lib/utils";
import { ContentTab } from "@/app/dashboard/websites/[siteId]/editor/tabs/content-tab";
import { ImagesTab } from "@/app/dashboard/websites/[siteId]/editor/tabs/images-tab";
import { DesignTab } from "@/app/dashboard/websites/[siteId]/editor/tabs/design-tab";
import { SectionsTab } from "@/app/dashboard/websites/[siteId]/editor/tabs/sections-tab";
import { SettingsTab } from "@/app/dashboard/websites/[siteId]/editor/tabs/settings-tab";
import { hasUnpublishedChanges } from "@/app/dashboard/websites/website-card-state";
import { publishWebsiteAction } from "@/app/publishing-actions";

const TABS = [
  { key: "pages", label: "Pages", icon: Layout },
  { key: "design", label: "Design", icon: Palette },
  { key: "images", label: "Images", icon: ImageIcon },
  { key: "settings", label: "Settings", icon: Settings },
  { key: "sections", label: "Sections", icon: Layout }
] as const;

type TabKey = (typeof TABS)[number]["key"];

function SaveBar({
  siteId,
  canEdit,
  isPublished,
  hasChanges
}: {
  siteId: string;
  canEdit: boolean;
  isPublished: boolean;
  hasChanges: boolean;
}) {
  if (!canEdit) {
    return (
      <span className="rounded-app bg-canvas px-3 py-2 text-sm font-semibold text-muted">
        Preview only
      </span>
    );
  }

  if (isPublished && !hasChanges) {
    return (
      <span className="rounded-app bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
        <Globe2 className="inline mr-1" size={14} />
        Live and up to date
      </span>
    );
  }

  if (isPublished && hasChanges) {
    return (
      <>
        <span className="rounded-app bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
          Unsaved changes
        </span>
        <form action={saveVersionAction}>
          <input type="hidden" name="siteId" value={siteId} />
          <Button type="submit" variant="secondary">
            <Save size={15} />
            Save Draft
          </Button>
        </form>
        <form action={publishWebsiteAction}>
          <input type="hidden" name="siteId" value={siteId} />
          <Button type="submit">
            <Globe2 size={15} />
            Publish Updates
          </Button>
        </form>
      </>
    );
  }

  // Draft (never published)
  return (
    <>
      <span className="rounded-app bg-canvas px-3 py-2 text-sm font-semibold text-muted">
        Draft
      </span>
      <form action={saveVersionAction}>
        <input type="hidden" name="siteId" value={siteId} />
        <Button type="submit">
          <Save size={15} />
          Save Draft
        </Button>
      </form>
      <form action={publishWebsiteAction}>
        <input type="hidden" name="siteId" value={siteId} />
        <Button type="submit" variant="secondary">
          <Globe2 size={15} />
          Publish Website
        </Button>
      </form>
    </>
  );
}

export async function EditorShell({
  siteId,
  activeTab,
  searchParams
}: {
  siteId: string;
  activeTab: string;
  searchParams: { message?: string; error?: string; device?: string; page?: string; section?: string };
}) {
  const setup = await requireSiteSetup(siteId);
  const canEdit = hasPermission(setup.siteAccess, "edit_content", setup.membershipRole);
  const canUpload = hasPermission(setup.siteAccess, "upload_media", setup.membershipRole);
  const canDesign = hasPermission(setup.siteAccess, "edit_design", setup.membershipRole);
  const canSections = hasPermission(setup.siteAccess, "manage_sections", setup.membershipRole);

  const context = await loadEditorContext(setup.supabase, setup.site.id, canEdit);
  const merged = applyEditorMerges(context);

  const isPublished = setup.site.publication_status === "published";
  const hasChanges = hasUnpublishedChanges(setup.site);

  // Filter allowed tabs
  const allowedTabs = TABS.filter((tab) => {
    if (tab.key === "pages") return canEdit;
    if (tab.key === "images") return canUpload;
    if (tab.key === "design") return canDesign;
    if (tab.key === "sections") return canSections;
    if (tab.key === "settings") return canEdit;
    return true;
  });

  const resolvedTab = (allowedTabs.some((t) => t.key === activeTab) ? activeTab : "pages") as TabKey;

  const isClientAccess = Boolean(setup.siteAccess);
  const editorBase = isClientAccess
    ? `/client/websites/${setup.site.id}/editor`
    : `/dashboard/websites/${setup.site.id}/editor`;
  const previewHref = isClientAccess
    ? `/client/websites/${setup.site.id}/preview`
    : `/dashboard/websites/${setup.site.id}/preview`;
  const backHref = isClientAccess ? `/client/websites/${setup.site.id}` : "/dashboard/websites";

  // Device preview class
  const deviceClass =
    searchParams.device === "mobile"
      ? "max-w-[390px]"
      : searchParams.device === "tablet"
      ? "max-w-[768px]"
      : "w-full";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas">
      {/* ── Top Bar ────────────────────────────────────────────────────────── */}
      <header className="z-40 flex shrink-0 items-center gap-2 border-b border-line bg-white/95 px-3 py-2 backdrop-blur sm:gap-3 sm:px-4">
        {/* Left: back + site name */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <ButtonLink href={backHref} variant="secondary" aria-label="Back to dashboard">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </ButtonLink>
          <div className="min-w-0">
            <p className="hidden text-xs font-semibold uppercase tracking-widest text-muted sm:block">
              Website editor
            </p>
            <h1 className="max-w-[160px] truncate text-sm font-bold text-ink sm:max-w-xs sm:text-base">
              {setup.site.name}
            </h1>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: save state + preview */}
        <div className="flex shrink-0 items-center gap-2">
          <SaveBar
            siteId={setup.site.id}
            canEdit={canEdit}
            isPublished={isPublished}
            hasChanges={hasChanges}
          />
          <ButtonLink href={previewHref} variant="secondary" aria-label="Open full preview">
            <ExternalLink size={15} />
            <span className="hidden sm:inline">Preview</span>
          </ButtonLink>
        </div>
      </header>

      {/* ── Body: Sidebar + Preview ────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside className="flex w-full shrink-0 flex-col overflow-hidden border-r border-line bg-white sm:w-80 lg:w-[340px] xl:w-[360px]">
          {/* Tab navigation */}
          <nav
            className="grid shrink-0 border-b border-line px-2 py-2"
            style={{ gridTemplateColumns: `repeat(${allowedTabs.length}, 1fr)` }}
            aria-label="Editor tabs"
          >
            {allowedTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.key}
                  href={`${editorBase}/${tab.key}`}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-app px-1 py-2 text-center text-xs font-semibold transition",
                    resolvedTab === tab.key
                      ? "bg-brand-700 text-white"
                      : "text-muted hover:bg-canvas hover:text-ink"
                  )}
                  aria-current={resolvedTab === tab.key ? "page" : undefined}
                >
                  <Icon size={16} />
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          {/* Tab content — scrollable */}
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <StatusMessage error={searchParams.error} message={searchParams.message} />
            {!canEdit && resolvedTab !== "design" && resolvedTab !== "sections" ? (
              <div className="mb-3 rounded-app bg-canvas p-3 text-sm text-muted">
                You can view and preview, but editing is not available with your current access.
              </div>
            ) : null}

            {resolvedTab === "pages" && (
              <ContentTab siteId={setup.site.id} context={context} searchParams={searchParams} />
            )}
            {resolvedTab === "images" && (
              <ImagesTab
                siteId={setup.site.id}
                organizationId={setup.organization.id}
                context={context}
              />
            )}
            {resolvedTab === "design" && (
              <DesignTab siteId={setup.site.id} context={context} />
            )}
            {resolvedTab === "settings" && (
              <SettingsTab siteId={setup.site.id} site={setup.site} context={context} />
            )}
            {resolvedTab === "sections" && (
              <SectionsTab siteId={setup.site.id} context={context} />
            )}
          </div>

          {/* Mobile: Preview button */}
          <div className="shrink-0 border-t border-line p-3 sm:hidden">
            <ButtonLink href={previewHref} variant="secondary" className="w-full justify-center">
              <ExternalLink size={16} />
              Preview Website
            </ButtonLink>
          </div>
        </aside>

        {/* ── Live Preview ─────────────────────────────────────────────── */}
        <section className="hidden min-w-0 flex-1 flex-col overflow-hidden sm:flex">
          {/* Device toggle + label */}
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line bg-white/80 px-4 py-2 backdrop-blur">
            <p className="text-xs font-semibold text-muted">
              Live preview updates after saving.
            </p>
            <div className="flex gap-1 rounded-app border border-line bg-white p-1">
              {[
                { key: "desktop", icon: Monitor, label: "Desktop" },
                { key: "tablet", icon: Tablet, label: "Tablet" },
                { key: "mobile", icon: Smartphone, label: "Mobile" }
              ].map((device) => {
                const Icon = device.icon;
                const isActive =
                  searchParams.device === device.key ||
                  (!searchParams.device && device.key === "desktop");
                return (
                  <ButtonLink
                    key={device.key}
                    href={`${editorBase}/${resolvedTab}?device=${device.key}`}
                    variant={isActive ? "primary" : "ghost"}
                    aria-label={`${device.label} preview`}
                    aria-pressed={isActive}
                  >
                    <Icon size={16} />
                  </ButtonLink>
                );
              })}
            </div>
          </div>

          {/* Preview viewport */}
          <div className="flex min-h-0 flex-1 items-start justify-center overflow-auto bg-[#f0f0f0] p-4">
            <div
              className={cn(
                "min-h-full overflow-x-hidden rounded-lg bg-white shadow-xl transition-all duration-300 [&_.fixed]:absolute",
                deviceClass
              )}
            >
              {merged.status === "ready" ? (
                <SiteRenderer preview={merged.preview} pageSlug="home" />
              ) : (
                <div className="flex min-h-[400px] items-center justify-center p-8 text-center">
                  <div>
                    <h2 className="text-lg font-bold text-ink">Choose a design template first</h2>
                    <p className="mt-2 text-sm text-muted">
                      The preview becomes available after a template is selected.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
