import { ArrowLeft, ExternalLink, Globe2, Save } from "lucide-react";
import { saveVersionAction } from "@/app/editor-actions";
import { publishWebsiteAction } from "@/app/publishing-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { Button, ButtonLink } from "@/components/ui/button";
import { LivePreviewWorkspace } from "@/components/site-editor/live-preview-context";
import { hasPermission } from "@/lib/access-control";
import { applyEditorMerges, loadEditorContext } from "@/lib/site-editor/editor-loader";
import { normaliseEditorPageSlug } from "@/lib/site-editor/page-structure";
import { requireSiteSetup } from "@/lib/setup";
import { hasUnpublishedChanges } from "@/app/dashboard/websites/website-card-state";
import { ContentTab } from "@/app/dashboard/websites/[siteId]/editor/tabs/content-tab";
import { DesignTab } from "@/app/dashboard/websites/[siteId]/editor/tabs/design-tab";
import { ImagesTab } from "@/app/dashboard/websites/[siteId]/editor/tabs/images-tab";
import { SectionsTab } from "@/app/dashboard/websites/[siteId]/editor/tabs/sections-tab";
import { SettingsTab } from "@/app/dashboard/websites/[siteId]/editor/tabs/settings-tab";
import Link from "next/link";

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
  const selectedPage = normaliseEditorPageSlug(searchParams.page);
  const initialSectionId = merged.status === "ready" ? merged.preview.sections.find((section) => section.page_slug === selectedPage && section.section_key === searchParams.section)?.id : undefined;

  return (
    <div className="mx-auto max-w-[1500px]">
      <header className="sticky top-0 z-30 -mx-3 mb-5 flex flex-wrap items-center gap-3 border-b border-line bg-white/95 px-3 py-3 backdrop-blur sm:-mx-5 sm:px-5 lg:-mx-7 lg:px-7">
        <ButtonLink href={base} variant="ghost" className="px-2"><ArrowLeft size={17} /><span className="hidden sm:inline">Back to Website</span></ButtonLink>
        <div className="min-w-0 flex-1"><h1 className="truncate text-base font-bold text-ink">{setup.site.name}</h1><p className={`text-xs font-semibold ${isPublished && !hasChanges ? "text-emerald-700" : "text-amber-700"}`}>{isPublished && !hasChanges ? "Live and up to date" : hasChanges ? "Unpublished changes" : "Website draft"}</p></div>
        <ButtonLink href={`${base}/preview`} variant="secondary"><ExternalLink size={16} /><span className="hidden sm:inline">Preview</span></ButtonLink>
        {canPublish ? <form action={publishWebsiteAction}><input type="hidden" name="siteId" value={setup.site.id} /><Button type="submit"><Globe2 size={16} /><span className="hidden sm:inline">{isPublished ? "Publish Updates" : "Publish Website"}</span><span className="sm:hidden">Publish</span></Button></form> : null}
      </header>

      <nav className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-[0_8px_24px_rgba(24,33,31,0.08),inset_0_0_0_1px_rgba(0,0,0,0.05)]" aria-label="Website editor">
        {[
          ["Pages", `${base}/editor/pages`],
          ["Photos", `${base}/editor/images`],
          ["Style", `${base}/editor/design`],
          ["Settings", `${base}/editor/settings`]
        ].map(([label, href]) => <Link key={label} href={href} className={`inline-flex min-h-10 min-w-max flex-1 items-center justify-center rounded-lg px-4 text-sm font-bold transition-colors active:scale-[0.96] ${resolvedTab === (label === "Pages" ? "pages" : label === "Photos" ? "images" : label.toLowerCase()) ? "bg-brand-50 text-brand-800" : "text-muted hover:bg-canvas hover:text-ink"}`}>{label}</Link>)}
      </nav>

      <StatusMessage error={searchParams.error} message={searchParams.message} />
      {!canEdit && resolvedTab === "pages" ? <div className="mb-4 rounded-lg border border-line bg-white p-4 text-sm text-muted">You can preview this website, but editing is not available with your current access.</div> : null}

      <LivePreviewWorkspace initialPreview={merged.status === "ready" ? merged.preview : null} pageSlug={selectedPage} siteId={setup.site.id} initialSectionId={initialSectionId}>
        <section className="min-w-0 rounded-xl bg-white p-4 shadow-[0_12px_36px_rgba(24,33,31,0.1)] sm:p-5">
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
      </LivePreviewWorkspace>
    </div>
  );
}
