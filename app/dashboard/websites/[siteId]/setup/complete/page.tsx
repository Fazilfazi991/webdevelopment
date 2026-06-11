import { ArrowRight, Edit3, Palette } from "lucide-react";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { SetupProgress } from "@/components/setup/setup-progress";
import { SiteRenderer } from "@/components/site-renderer/site-renderer";
import { applyEditorMerges, loadEditorContext } from "@/lib/site-editor/editor-loader";
import { getTemplateById, requireSiteSetup } from "@/lib/setup";

export default async function CompletePage({ params }: { params: { siteId: string } }) {
  const { site, supabase, selection } = await requireSiteSetup(params.siteId);
  const context = await loadEditorContext(supabase, site.id, false);
  const merged = applyEditorMerges(context);
  const { template } = selection?.template_id
    ? await getTemplateById(supabase, selection.template_id)
    : { template: null };

  const templateDescription = template
    ? `${template.name} · Professional design ready for your business`
    : null;

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <SetupProgress siteId={site.id} currentStep="template_selected" />

      {/* Hero message */}
      <div className="grid gap-4 rounded-2xl border border-line bg-white p-6 shadow-soft md:p-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">
              ✓ Your website is ready
            </p>
            <h2 className="mt-2 text-3xl font-bold leading-tight text-ink">
              We selected a professional design that matches your business.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Review the prepared website below. Your business details, images, and contact
              information stay saved if you choose another design later.
            </p>
            {templateDescription && (
              <p className="mt-4 inline-block rounded-xl bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
                {templateDescription}
              </p>
            )}
          </div>

          {/* Template thumbnail */}
          {template?.thumbnail_url || (template && `technical-services-modern`) ? (
            <div className="hidden lg:block">
              <div className="relative h-24 w-36 overflow-hidden rounded-xl border border-line shadow-sm">
                <Image
                  src={
                    template.thumbnail_url ??
                    `/templates/${template.slug}/thumbnail.webp`
                  }
                  alt={template.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 pt-2">
          <ButtonLink href={`/dashboard/websites/${site.id}/editor`}>
            Continue with this design
            <ArrowRight size={16} />
          </ButtonLink>
          <ButtonLink
            href={`/dashboard/websites/${site.id}/setup/templates${
              selection?.business_category_id ? `?category=${selection.business_category_id}` : ""
            }`}
            variant="secondary"
          >
            <Palette size={16} />
            Explore other designs
          </ButtonLink>
          <ButtonLink href={`/dashboard/websites/${site.id}/editor/settings`} variant="ghost">
            <Edit3 size={16} />
            Edit business details
          </ButtonLink>
        </div>
      </div>

      {/* Large website preview */}
      <div className="overflow-hidden rounded-2xl border border-line bg-canvas shadow-soft">
        <div className="flex items-center justify-between border-b border-line bg-white/80 px-4 py-2 backdrop-blur">
          <div className="flex gap-1.5">
            <span className="size-3 rounded-full bg-red-400" />
            <span className="size-3 rounded-full bg-amber-400" />
            <span className="size-3 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs font-semibold text-muted">Website preview</span>
          <div className="w-20" />
        </div>
        <div className="h-[780px] max-h-[calc(100vh-280px)] overflow-x-hidden overflow-y-auto [&_.fixed]:absolute">
          {merged.status === "ready" ? (
            <SiteRenderer preview={merged.preview} pageSlug="home" />
          ) : (
            <div className="flex h-full min-h-[400px] items-center justify-center p-8 text-center">
              <div>
                <h3 className="text-xl font-bold text-ink">Website preview is being prepared</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted">
                  The preview will appear automatically once the template is fully configured.
                  You can still continue with this design.
                </p>
                <div className="mt-6">
                  <ButtonLink href={`/dashboard/websites/${site.id}/editor`}>
                    Open editor
                    <ArrowRight size={16} />
                  </ButtonLink>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile preview note */}
      <p className="text-center text-xs text-muted">
        This is a desktop preview. Mobile layout adapts automatically. Use the editor to preview on tablet and mobile.
      </p>
    </div>
  );
}
