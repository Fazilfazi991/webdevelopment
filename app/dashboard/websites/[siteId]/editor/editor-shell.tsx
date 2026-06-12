import { ArrowLeft, ExternalLink, Globe2, Save } from "lucide-react";
import Link from "next/link";
import { saveVersionAction } from "@/app/editor-actions";
import { publishWebsiteAction } from "@/app/publishing-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { Button, ButtonLink } from "@/components/ui/button";
import { SiteRenderer } from "@/components/site-renderer/site-renderer";
import { hasPermission } from "@/lib/access-control";
import { applyEditorMerges, loadEditorContext } from "@/lib/site-editor/editor-loader";
import { requireSiteSetup } from "@/lib/setup";
import { hasUnpublishedChanges } from "@/app/dashboard/websites/website-card-state";
import { ContentTab } from "@/app/dashboard/websites/[siteId]/editor/tabs/content-tab";
import { DesignTab } from "@/app/dashboard/websites/[siteId]/editor/tabs/design-tab";
import { ImagesTab } from "@/app/dashboard/websites/[siteId]/editor/tabs/images-tab";
import { SectionsTab } from "@/app/dashboard/websites/[siteId]/editor/tabs/sections-tab";
import { SettingsTab } from "@/app/dashboard/websites/[siteId]/editor/tabs/settings-tab";

export async function EditorShell({
  siteId, activeTab, searchParams
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
  const canPublish = hasPermission(setup.siteAccess, "publish_site", setup.membershipRole);
  const context = await loadEditorContext(setup.supabase, setup.site.id, canEdit);
  const merged = applyEditorMerges(context);
  const isPublished = setup.site.publication_status === "published";
  const hasChanges = hasUnpublishedChanges(setup.site);
  const base = `/dashboard/websites/${setup.site.id}`;
  const resolvedTab = activeTab === "design" && canDesign ? "design" : activeTab === "images" && canUpload ? "images" : activeTab === "settings" && canEdit ? "settings" : activeTab === "sections" && canSections ? "sections" : "pages";
  const selectedPage = searchParams.page ?? "home";

  return (
    <div className="mx-auto max-w-[1500px]">
      <header className="sticky top-0 z-30 -mx-3 mb-5 flex flex-wrap items-center gap-3 border-b border-line bg-white/95 px-3 py-3 backdrop-blur sm:-mx-5 sm:px-5 lg:-mx-7 lg:px-7">
        <ButtonLink href={base} variant="ghost" className="px-2"><ArrowLeft size={17} /><span className="hidden sm:inline">Back to Website</span></ButtonLink>
        <div className="min-w-0 flex-1"><h1 className="truncate text-base font-bold text-ink">{setup.site.name}</h1><p className={`text-xs font-semibold ${isPublished && !hasChanges ? "text-emerald-700" : "text-amber-700"}`}>{isPublished && !hasChanges ? "Live and up to date" : hasChanges ? "Unpublished changes" : "Website draft"}</p></div>
        <ButtonLink href={`${base}/preview`} variant="secondary"><ExternalLink size={16} /><span className="hidden sm:inline">Preview</span></ButtonLink>
        {canPublish ? <form action={publishWebsiteAction}><input type="hidden" name="siteId" value={setup.site.id} /><Button type="submit"><Globe2 size={16} /><span className="hidden sm:inline">{isPublished ? "Publish Updates" : "Publish Website"}</span><span className="sm:hidden">Publish</span></Button></form> : null}
      </header>

      <StatusMessage error={searchParams.error} message={searchParams.message} />
      {!canEdit && resolvedTab === "pages" ? <div className="mb-4 rounded-lg border border-line bg-white p-4 text-sm text-muted">You can preview this website, but editing is not available with your current access.</div> : null}

      <div className="grid gap-5 lg:grid-cols-[400px_minmax(0,1fr)] lg:items-start">
        <section className="min-w-0 rounded-xl border border-line bg-white p-4 shadow-soft sm:p-5">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">{resolvedTab === "design" ? "Website Style" : resolvedTab === "settings" ? "Website Settings" : resolvedTab === "images" ? "Photos & Images" : "Edit Website"}</p>
            <h2 className="mt-2 text-xl font-bold text-ink">{resolvedTab === "pages" ? (searchParams.section ? "Update this section" : searchParams.page ? "Choose a section to update" : "Choose a page to update") : resolvedTab === "design" ? "Choose how your website should look" : "Update this website"}</h2>
            {resolvedTab === "pages" ? <p className="mt-1 text-sm text-muted">Work through one page and one section at a time.</p> : null}
          </div>
          {resolvedTab === "pages" ? <ContentTab siteId={setup.site.id} context={context} searchParams={searchParams} /> : null}
          {resolvedTab === "design" ? <DesignTab siteId={setup.site.id} context={context} /> : null}
          {resolvedTab === "images" ? <ImagesTab siteId={setup.site.id} organizationId={setup.organization.id} context={context} /> : null}
          {resolvedTab === "settings" ? <SettingsTab siteId={setup.site.id} site={setup.site} context={context} /> : null}
          {resolvedTab === "sections" ? <SectionsTab siteId={setup.site.id} context={context} /> : null}
          {canEdit && resolvedTab === "pages" ? <form action={saveVersionAction} className="mt-5 border-t border-line pt-4"><input type="hidden" name="siteId" value={setup.site.id} /><Button type="submit" variant="secondary" className="w-full"><Save size={16} />Save Website Draft</Button></form> : null}
        </section>

        <section className="hidden min-w-0 lg:block">
          <div className="sticky top-24 overflow-hidden rounded-xl border border-line bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-line px-4 py-3"><div><p className="text-sm font-bold text-ink">Website preview</p><p className="text-xs text-muted">Updates after saving</p></div><Link href={`${base}/preview`} className="text-sm font-bold text-brand-700">Open full preview</Link></div>
            <div className="max-h-[calc(100vh-180px)] overflow-auto bg-[#edf1ef] p-4"><div className="mx-auto min-h-[620px] overflow-hidden rounded-lg bg-white shadow-lg">{merged.status === "ready" ? <SiteRenderer preview={merged.preview} pageSlug={selectedPage} /> : <div className="flex min-h-[500px] items-center justify-center p-8 text-center"><div><h3 className="font-bold text-ink">Choose a design first</h3><p className="mt-2 text-sm text-muted">The website preview will appear here.</p></div></div>}</div></div>
          </div>
        </section>
      </div>
    </div>
  );
}
