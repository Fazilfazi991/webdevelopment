import Link from "next/link";
import { selectTemplateAction } from "@/app/setup-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { PreviewConcept } from "@/components/setup/preview-concept";
import { SetupProgress } from "@/components/setup/setup-progress";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { Field, inputClassName } from "@/components/ui/field";
import { getCategories, getTemplatesForCategory, requireSiteSetup } from "@/lib/setup";

export default async function TemplatesPage({
  params,
  searchParams
}: {
  params: { siteId: string };
  searchParams: { error?: string; category?: string; q?: string; style?: string; featured?: string };
}) {
  const { site, supabase, selection } = await requireSiteSetup(params.siteId);
  const categoryId = searchParams.category ?? selection?.business_category_id;
  const categories = await getCategories(supabase);
  const category = categories.find((item) => item.id === categoryId);
  const { templates, pages } = category
    ? await getTemplatesForCategory(supabase, category.id, {
        search: searchParams.q,
        style: searchParams.style,
        featuredOnly: searchParams.featured === "true"
      })
    : { templates: [], pages: [] };
  const styles = [...new Set(templates.map((template) => template.style_label).filter(Boolean))] as string[];

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <SetupProgress siteId={site.id} currentStep="template" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-ink">Choose a design template</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{category ? `Templates for ${category.name}.` : "Choose a category before browsing templates."}</p>
        </div>
        <Link href={`/dashboard/websites/${site.id}/setup/category${selection?.industry_id ? `?industry=${selection.industry_id}` : ""}`} className="text-sm font-semibold text-brand-700">
          Change category
        </Link>
      </div>
      <StatusMessage error={searchParams.error} />
      {category ? (
        <>
          <form className="grid gap-3 rounded-app border border-line bg-white p-4 md:grid-cols-[1fr_220px_auto]">
            <input type="hidden" name="category" value={category.id} />
            <Field label="Search templates">
              <input className={inputClassName} name="q" defaultValue={searchParams.q ?? ""} placeholder="Search by template name" />
            </Field>
            <Field label="Style">
              <select className={inputClassName} name="style" defaultValue={searchParams.style ?? ""}>
                <option value="">All styles</option>
                {styles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </Field>
            <label className="flex items-end gap-2 pb-3 text-sm font-semibold text-ink">
              <input type="checkbox" name="featured" value="true" defaultChecked={searchParams.featured === "true"} />
              Featured
            </label>
            <Button type="submit" variant="secondary" className="md:col-span-3">
              Apply filters
            </Button>
          </form>
          {templates.length ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {templates.map((template) => {
                const pageCount = pages.filter((page) => page.template_id === template.id).length;
                return (
                  <Card key={template.id} className="p-4">
                    <PreviewConcept title={template.name} style={template.style_label} compact />
                    <h3 className="mt-5 text-lg font-bold text-ink">{template.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-brand-700">{template.style_label}</p>
                    <p className="mt-2 min-h-12 text-sm leading-6 text-muted">{template.short_description}</p>
                    <p className="mt-3 text-sm font-semibold text-muted">{pageCount} included pages</p>
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <ButtonLink href={`/dashboard/websites/${site.id}/setup/templates/${template.id}?category=${category.id}`} variant="secondary">
                        Preview
                      </ButtonLink>
                      <form action={selectTemplateAction}>
                        <input type="hidden" name="siteId" value={site.id} />
                        <input type="hidden" name="categoryId" value={category.id} />
                        <input type="hidden" name="templateId" value={template.id} />
                        <Button type="submit" className="w-full">
                          Use
                        </Button>
                      </form>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No templates match this category" description="Try clearing filters or choose another business category." />
          )}
        </>
      ) : (
        <EmptyState title="Choose a category first" description="Select a business category so we can show matching templates." action={<ButtonLink href={`/dashboard/websites/${site.id}/setup/category`}>Choose category</ButtonLink>} />
      )}
    </div>
  );
}
