import { ArrowRight, Edit3, Palette } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SetupProgress } from "@/components/setup/setup-progress";
import { SiteRenderer } from "@/components/site-renderer/site-renderer";
import { applyEditorMerges, loadEditorContext } from "@/lib/site-editor/editor-loader";
import { getTemplateById, requireSiteSetup } from "@/lib/setup";

export default async function CompletePage({ params }: { params: { siteId: string } }) {
  const { site, supabase, selection } = await requireSiteSetup(params.siteId);
  const context = await loadEditorContext(supabase, site.id, false);
  const merged = applyEditorMerges(context);
  const { template } = selection?.template_id ? await getTemplateById(supabase, selection.template_id) : { template: null };

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <SetupProgress siteId={site.id} currentStep="template_selected" />
      <Card className="overflow-hidden bg-white">
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">Your website is ready</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-ink">We selected a professional design that matches your business.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Review the prepared website below. Your business details, images, and contact information stay saved if you choose another design later.
            </p>
            {template ? (
              <p className="mt-4 rounded-app bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700">
                {template.name} · Recommended for technical-services businesses
              </p>
            ) : null}
          </div>
          <div className="grid gap-3 sm:flex sm:flex-wrap lg:justify-end">
            <ButtonLink href={`/dashboard/websites/${site.id}/editor`}>
              Continue with this design
              <ArrowRight size={16} />
            </ButtonLink>
            <ButtonLink href={`/dashboard/websites/${site.id}/setup/templates${selection?.business_category_id ? `?category=${selection.business_category_id}` : ""}`} variant="secondary">
              <Palette size={16} />
              Choose another design
            </ButtonLink>
            <ButtonLink href={`/dashboard/websites/${site.id}/editor/content`} variant="ghost">
              <Edit3 size={16} />
              Edit details
            </ButtonLink>
          </div>
        </div>
        {!selection ? <p className="mt-4 text-sm font-semibold text-danger">Select a template before continuing.</p> : null}
        <div className="border-t border-line bg-canvas p-3 md:p-5">
          <div className="mx-auto h-[760px] max-h-[calc(100vh-220px)] max-w-[1080px] overflow-x-hidden overflow-y-auto rounded-app bg-white shadow-soft [&_.fixed]:absolute">
            {merged.status === "ready" ? (
              <SiteRenderer preview={merged.preview} pageSlug="home" />
            ) : (
              <div className="flex min-h-full items-center justify-center p-8 text-center">
                <div>
                  <h3 className="text-xl font-bold text-ink">Website preview is being prepared</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-muted">Choose another design or return to setup if the preview does not appear.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
