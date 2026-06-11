import Link from "next/link";
import { ArrowLeft, ExternalLink, Monitor, Save, Smartphone, Tablet } from "lucide-react";
import { saveVersionAction } from "@/app/editor-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteRenderer } from "@/components/site-renderer/site-renderer";
import { applyEditorMerges, loadEditorContext } from "@/lib/site-editor/editor-loader";
import { requireSiteSetup } from "@/lib/setup";
import { hasPermission } from "@/lib/access-control";
import { cn } from "@/lib/utils";
import { ContentTab } from "@/app/dashboard/websites/[siteId]/editor/tabs/content-tab";
import { ImagesTab } from "@/app/dashboard/websites/[siteId]/editor/tabs/images-tab";
import { DesignTab } from "@/app/dashboard/websites/[siteId]/editor/tabs/design-tab";
import { SectionsTab } from "@/app/dashboard/websites/[siteId]/editor/tabs/sections-tab";

const tabs = [
  { key: "content", label: "Content" },
  { key: "images", label: "Images" },
  { key: "design", label: "Design" },
  { key: "sections", label: "Sections" }
];

function EditorTabContent({
  activeTab,
  siteId,
  site,
  organizationId,
  context
}: {
  activeTab: string;
  siteId: string;
  site: Awaited<ReturnType<typeof requireSiteSetup>>["site"];
  organizationId: string;
  context: Awaited<ReturnType<typeof loadEditorContext>>;
}) {
  if (activeTab === "images") return <ImagesTab siteId={siteId} organizationId={organizationId} context={context} />;
  if (activeTab === "design") return <DesignTab siteId={siteId} site={site} context={context} />;
  if (activeTab === "sections") return <SectionsTab siteId={siteId} context={context} />;
  return <ContentTab siteId={siteId} context={context} />;
}

export async function EditorShell({
  siteId,
  activeTab,
  searchParams
}: {
  siteId: string;
  activeTab: string;
  searchParams: { message?: string; error?: string; device?: string };
}) {
  const setup = await requireSiteSetup(siteId);
  const canEdit = hasPermission(setup.siteAccess, "edit_content", setup.membershipRole);
  const canUpload = hasPermission(setup.siteAccess, "upload_media", setup.membershipRole);
  const canDesign = hasPermission(setup.siteAccess, "edit_design", setup.membershipRole);
  const canSections = hasPermission(setup.siteAccess, "manage_sections", setup.membershipRole);
  const context = await loadEditorContext(setup.supabase, setup.site.id, canEdit);
  const merged = applyEditorMerges(context);
  const deviceClass = searchParams.device === "mobile" ? "max-w-[390px]" : searchParams.device === "tablet" ? "max-w-[768px]" : "max-w-none";
  const allowedTabs = tabs.filter((tab) => tab.key === "content" || (tab.key === "images" && canUpload) || (tab.key === "design" && canDesign) || (tab.key === "sections" && canSections));
  const active = allowedTabs.some((tab) => tab.key === activeTab) ? activeTab : "content";
  const editorBase = setup.siteAccess ? `/client/websites/${setup.site.id}/editor` : `/dashboard/websites/${setup.site.id}/editor`;
  const previewHref = setup.siteAccess ? `/client/websites/${setup.site.id}/preview` : `/dashboard/websites/${setup.site.id}/preview`;
  const backHref = setup.siteAccess ? `/client/websites/${setup.site.id}` : "/dashboard/websites";

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <ButtonLink href={backHref} variant="secondary">
              <ArrowLeft size={16} />
              Back
            </ButtonLink>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">Website editor</p>
              <h1 className="break-words text-lg font-bold text-ink">{setup.site.name}</h1>
            </div>
          </div>
          <div className="grid gap-2 min-[420px]:flex min-[420px]:flex-wrap min-[420px]:items-center">
            <span className="rounded-app bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700">
              {canEdit ? "Draft saved manually" : "Preview only"}
            </span>
            <ButtonLink href={previewHref} variant="secondary">
              <ExternalLink size={16} />
              Open Full Preview
            </ButtonLink>
            <form action={saveVersionAction}>
              <input type="hidden" name="siteId" value={setup.site.id} />
              <Button type="submit" disabled={!canEdit}>
                <Save size={16} />
                Save Version
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-4 p-3 sm:p-4 xl:grid-cols-[390px_1fr]">
        <aside className="min-w-0 grid gap-4">
          <Card className="p-3">
            <nav className="grid grid-cols-2 gap-2" aria-label="Editor tabs">
              {allowedTabs.map((tab) => (
                <Link
                  key={tab.key}
                  href={`${editorBase}/${tab.key}`}
                  className={cn(
                    "rounded-app px-3 py-2 text-center text-sm font-semibold transition",
                    active === tab.key ? "bg-brand-700 text-white" : "bg-canvas text-muted hover:text-ink"
                  )}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>
          </Card>
          <StatusMessage error={searchParams.error} message={searchParams.message} />
          {!canEdit ? (
            <Card className="p-4 text-sm leading-6 text-muted">
              You can view this editor and preview, but your access does not include this editing action.
            </Card>
          ) : null}
          <EditorTabContent activeTab={active} siteId={setup.site.id} site={setup.site} organizationId={setup.organization.id} context={context} />
        </aside>

        <section className="min-w-0 grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-muted">Live preview updates after saving changes.</p>
            <div className="flex gap-1 rounded-app border border-line bg-white p-1">
              {[
                { key: "desktop", icon: Monitor },
                { key: "tablet", icon: Tablet },
                { key: "mobile", icon: Smartphone }
              ].map((device) => {
                const Icon = device.icon;
                return (
                  <ButtonLink key={device.key} href={`${editorBase}/${active}?device=${device.key}`} variant={searchParams.device === device.key || (!searchParams.device && device.key === "desktop") ? "primary" : "ghost"} aria-label={`${device.key} preview`}>
                    <Icon size={16} />
                  </ButtonLink>
                );
              })}
            </div>
          </div>
          <div className={cn("mx-auto w-full overflow-hidden rounded-app border border-line bg-white shadow-soft", deviceClass)}>
            {merged.status === "ready" ? (
              <SiteRenderer preview={merged.preview} pageSlug="home" />
            ) : (
              <div className="p-8 text-center">
                <h2 className="text-lg font-bold text-ink">Choose a design template first</h2>
                <p className="mt-2 text-sm text-muted">The editor becomes available after a template is selected.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
