import { Edit3, ExternalLink, Globe2, Monitor, Palette, Smartphone } from "lucide-react";
import Image from "next/image";
import { publishWebsiteAction } from "@/app/publishing-actions";
import { Button, ButtonLink } from "@/components/ui/button";
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
    ? `${template.name} - Professional design ready for your business`
    : null;

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <SetupProgress siteId={site.id} currentStep="template_selected" />

      <div className="grid gap-4 rounded-2xl border border-line bg-white p-6 shadow-soft md:p-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">
              Your website is ready
            </p>
            <h2 className="mt-2 text-3xl font-bold leading-tight text-ink">
              We selected a professional design for your business.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              You can publish it now or make changes anytime. The first preview below shows the mobile website your customers will see on their phones.
            </p>
            {templateDescription ? (
              <p className="mt-4 inline-block rounded-xl bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
                {templateDescription}
              </p>
            ) : null}
          </div>

          {template?.thumbnail_url || template ? (
            <div className="hidden lg:block">
              <div className="relative h-24 w-36 overflow-hidden rounded-xl border border-line shadow-sm">
                <Image
                  src={template.thumbnail_url ?? `/templates/${template.slug}/thumbnail.webp`}
                  alt={template.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 pt-2 sm:flex sm:flex-wrap">
          <form action={publishWebsiteAction}>
            <input type="hidden" name="siteId" value={site.id} />
            <input type="hidden" name="subdomain" value={site.primary_subdomain ?? site.slug} />
            <Button type="submit" className="w-full min-h-[52px] text-base sm:w-auto">
              <Globe2 size={17} />
              Publish Website
            </Button>
          </form>
          <ButtonLink href={`/dashboard/websites/${site.id}/editor/settings`} variant="secondary" className="min-h-[52px]">
            <Edit3 size={16} />
            Edit Details
          </ButtonLink>
          <ButtonLink
            href={`/dashboard/websites/${site.id}/setup/templates${
              selection?.business_category_id ? `?category=${selection.business_category_id}` : ""
            }`}
            variant="ghost"
            className="min-h-[52px]"
          >
            <Palette size={16} />
            Explore Other Designs
          </ButtonLink>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-line bg-canvas p-4 shadow-soft md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-ink">Mobile Preview</h3>
            <p className="mt-1 text-sm text-muted">Phone layout is shown first because most customers will visit from mobile.</p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-brand-700 px-4 text-sm font-semibold text-white">
              <Smartphone size={15} />
              Mobile
            </span>
            <ButtonLink href={`/dashboard/websites/${site.id}/preview?device=desktop`} variant="secondary" className="min-h-10 rounded-full px-4">
              <Monitor size={15} />
              Desktop
            </ButtonLink>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[390px] rounded-[2rem] border-[10px] border-ink bg-ink shadow-2xl">
          <div className="mx-auto mt-2 h-5 w-24 rounded-full bg-black" />
          <div className="mt-2 h-[680px] max-h-[70vh] overflow-x-hidden overflow-y-auto rounded-[1.4rem] bg-white [&_.fixed]:absolute">
            {merged.status === "ready" ? (
              <SiteRenderer preview={merged.preview} pageSlug="home" />
            ) : (
              <div className="flex h-full min-h-[400px] items-center justify-center p-8 text-center">
                <div>
                  <h3 className="text-xl font-bold text-ink">Website preview is being prepared</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-muted">
                    The preview will appear automatically once the template is fully configured.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:flex sm:items-center sm:justify-center">
          <ButtonLink href={`/dashboard/websites/${site.id}/preview?device=mobile`} variant="secondary" target="_blank" rel="noreferrer" className="min-h-[48px]">
            <ExternalLink size={16} />
            Open Full Preview
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
