import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";
import { SiteRenderer } from "@/components/site-renderer/site-renderer";
import { PreviewToolbar, previewDeviceClass } from "@/components/site-renderer/preview-toolbar";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";
import { applyEditorMerges, loadEditorContext } from "@/lib/site-editor/editor-loader";
import { requireSiteSetup } from "@/lib/setup";
import { cn } from "@/lib/utils";

function PreviewNotice({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <EmptyState title={title} description={description} action={action} />
    </div>
  );
}

export async function WebsitePreviewShell({
  siteId,
  pageSlug,
  device
}: {
  siteId: string;
  pageSlug?: string;
  device?: string;
}) {
  let setup: Awaited<ReturnType<typeof requireSiteSetup>>;
  let result: ReturnType<typeof applyEditorMerges>;

  try {
    setup = await requireSiteSetup(siteId);
    const editorContext = await loadEditorContext(setup.supabase, setup.site.id, false);
    result = applyEditorMerges(editorContext);
  } catch (error) {
    console.error("Preview load failed", { siteId, pageSlug, error });
    return (
      <PreviewNotice
        title="We could not load this preview"
        description="Please try again. If this keeps happening, return to the dashboard and reopen the website."
        action={<ButtonLink href="/dashboard/websites">Back to dashboard</ButtonLink>}
      />
    );
  }

  const { site } = setup;

  if (result.status === "no-template") {
    return (
      <PreviewNotice
        title="Choose a design template first"
        description="Select a template in setup before opening a full website preview."
        action={<ButtonLink href={`/dashboard/websites/${site.id}/setup/templates`}>Continue setup</ButtonLink>}
      />
    );
  }

  if (result.status === "unconfigured") {
    return (
      <PreviewNotice
        title="Preview coming soon"
        description="This template does not have seeded website sections yet. Choose Technical Services Modern to view the first rendered preview."
        action={<ButtonLink href={`/dashboard/websites/${site.id}/setup/templates`}>Back to templates</ButtonLink>}
      />
    );
  }

  const pages = result.preview.pages;
  const requestedSlug = pageSlug ?? "home";
  const activePage = pages.find((page) => page.page_slug === requestedSlug) ?? pages.find((page) => page.is_default) ?? pages[0];

  if (!activePage) {
    return (
      <PreviewNotice
        title="No pages configured"
        description="This selected template does not have any active pages ready for preview."
        action={<ButtonLink href="/dashboard/websites">Back to dashboard</ButtonLink>}
      />
    );
  }

  const missingRequestedPage = pageSlug && pageSlug !== activePage.page_slug;

  return (
    <div className="min-h-screen bg-canvas">
      <PreviewToolbar siteId={site.id} pages={pages} currentPageSlug={activePage.page_slug} device={device} />
      {missingRequestedPage ? (
        <div className="mx-auto max-w-7xl px-4 pt-4">
          <div className="flex items-start gap-3 rounded-app border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <p>The requested page is not part of this template, so the default page is shown.</p>
          </div>
        </div>
      ) : null}
      <div className="mx-auto px-0 py-4 sm:px-4">
        <div className={cn("mx-auto min-h-[70vh] overflow-hidden border-y border-line bg-white shadow-soft sm:rounded-app sm:border", previewDeviceClass(device))}>
          <SiteRenderer preview={result.preview} pageSlug={activePage.page_slug} />
        </div>
      </div>
    </div>
  );
}
