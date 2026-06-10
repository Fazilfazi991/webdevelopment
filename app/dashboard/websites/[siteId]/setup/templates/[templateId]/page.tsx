import Link from "next/link";
import { selectTemplateAction } from "@/app/setup-actions";
import { PreviewConcept } from "@/components/setup/preview-concept";
import { SiteRenderer } from "@/components/site-renderer/site-renderer";
import { SetupProgress } from "@/components/setup/setup-progress";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { loadTemplatePreviewByTemplateId } from "@/lib/site-renderer/template-loader";
import { getCategories, getTemplateById, requireSiteSetup } from "@/lib/setup";

export default async function TemplatePreviewPage({
  params,
  searchParams
}: {
  params: { siteId: string; templateId: string };
  searchParams: { category?: string; mobile?: string };
}) {
  const { site, supabase, selection } = await requireSiteSetup(params.siteId);
  const categoryId = searchParams.category ?? selection?.business_category_id;
  const categories = await getCategories(supabase);
  const category = categories.find((item) => item.id === categoryId);
  const { template, pages } = await getTemplateById(supabase, params.templateId);
  const renderedPreview = template ? await loadTemplatePreviewByTemplateId(supabase, template.id) : null;

  if (!template || !category) {
    return (
      <EmptyState
        title="Template preview unavailable"
        description="Choose an active category and template to continue."
        action={<ButtonLink href={`/dashboard/websites/${site.id}/setup/templates`}>Back to templates</ButtonLink>}
      />
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <SetupProgress siteId={site.id} currentStep="template" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-ink">{template.name}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{template.long_description ?? template.short_description}</p>
        </div>
        <Link href={`/dashboard/websites/${site.id}/setup/templates?category=${category.id}`} className="text-sm font-semibold text-brand-700">
          Back to templates
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {renderedPreview?.status === "ready" ? (
          <div className="max-h-[760px] overflow-hidden rounded-app border border-line bg-white shadow-soft">
            <SiteRenderer preview={renderedPreview.preview} pageSlug="home" />
          </div>
        ) : (
          <PreviewConcept title={template.name} style={template.style_label} />
        )}
        <Card className="p-5">
          <p className="text-sm font-semibold text-brand-700">{template.style_label}</p>
          <h3 className="mt-2 text-lg font-bold text-ink">Preview concept</h3>
          <p className="mt-2 text-sm leading-6 text-muted">This is a curated preview placeholder. The real rendered website system is planned for the next phases.</p>
          <p className="mt-4 text-sm font-semibold text-ink">Relevant category</p>
          <p className="mt-1 text-sm text-muted">{category.name}</p>
          <p className="mt-4 text-sm font-semibold text-ink">Included pages</p>
          <ul className="mt-2 grid gap-2 text-sm text-muted">
            {pages.map((page) => (
              <li key={page.id} className="rounded-app border border-line px-3 py-2">
                {page.page_name}
              </li>
            ))}
          </ul>
          <form action={selectTemplateAction} className="mt-5">
            <input type="hidden" name="siteId" value={site.id} />
            <input type="hidden" name="categoryId" value={category.id} />
            <input type="hidden" name="templateId" value={template.id} />
            <Button type="submit" className="w-full">
              Use This Template
            </Button>
          </form>
          {selection?.template_id === template.id && renderedPreview?.status === "ready" ? (
            <ButtonLink href={`/dashboard/websites/${site.id}/preview`} variant="secondary" className="mt-3 w-full">
              Open website preview
            </ButtonLink>
          ) : null}
        </Card>
      </div>
      {renderedPreview?.status === "unconfigured" ? (
        <EmptyState
          title="Preview coming soon"
          description="This template is available for setup, but a full rendered website preview has not been configured yet."
        />
      ) : null}
    </div>
  );
}
