import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Eye, MonitorSmartphone, Search, Sparkles } from "lucide-react";
import { selectTemplateAction } from "@/app/setup-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { SetupProgress } from "@/components/setup/setup-progress";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { Field, inputClassName } from "@/components/ui/field";
import { getCategories, getTemplatesForCategory, requireSiteSetup } from "@/lib/setup";
import type { TemplatePage } from "@/lib/types";

const completedPreviewSlugs = new Set(["technical-services-modern"]);

function templateImagePath(slug: string, image?: string | null) {
  if (image) return image;
  if (completedPreviewSlugs.has(slug)) return `/templates/${slug}/thumbnail.webp`;
  return null;
}

function TemplateScreenshot({ slug, name, src }: { slug: string; name: string; src: string | null }) {
  if (!src) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center bg-canvas text-sm font-semibold text-muted">
        Preview image pending
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-canvas">
      <Image
        src={src}
        alt={`${name} homepage preview`}
        fill
        sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
        className="object-cover"
        priority={slug === "technical-services-modern"}
      />
    </div>
  );
}

function includedPageNames(pages: TemplatePage[], templateId: string) {
  return pages.filter((page) => page.template_id === templateId).sort((a, b) => a.display_order - b.display_order).map((page) => page.page_name);
}

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
    <div className="mx-auto grid max-w-7xl gap-6">
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
          <form className="grid gap-3 rounded-app border border-line bg-white p-4 shadow-soft md:grid-cols-[minmax(240px,1fr)_220px_auto_auto] md:items-end">
            <input type="hidden" name="category" value={category.id} />
            <Field label="Search templates">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input className={`${inputClassName} pl-9`} name="q" defaultValue={searchParams.q ?? ""} placeholder="Search by name or service" />
              </div>
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
            <label className="flex min-h-11 items-center gap-2 rounded-app border border-line px-3 text-sm font-semibold text-ink">
              <input type="checkbox" name="featured" value="true" defaultChecked={searchParams.featured === "true"} />
              Featured
            </label>
            <Button type="submit" variant="secondary" className="min-h-11">
              Apply filters
            </Button>
          </form>
          {templates.length ? (
            <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
              {templates.map((template) => {
                const includedPages = includedPageNames(pages, template.id);
                const image = templateImagePath(template.slug, template.thumbnail_url);
                return (
                  <Card key={template.id} className="flex h-full overflow-hidden bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="relative">
                        <TemplateScreenshot slug={template.slug} name={template.name} src={image} />
                        {template.is_featured ? (
                          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand-700 shadow-sm">
                            <Sparkles size={13} />
                            Featured
                          </span>
                        ) : null}
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-lg font-bold text-ink">{template.name}</h3>
                            <p className="mt-1 text-sm font-semibold text-brand-700">{template.style_label ?? "Professional"}</p>
                          </div>
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                            <MonitorSmartphone size={14} />
                            Mobile-ready
                          </span>
                        </div>
                        <p className="mt-3 min-h-12 text-sm leading-6 text-muted">{template.short_description}</p>
                        <div className="mt-4">
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Best for</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {[category.name, "Maintenance", "AC", "Electrical"].map((item) => (
                              <span key={item} className="rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold text-muted">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {includedPages.slice(0, 5).map((page) => (
                            <span key={page} className="inline-flex items-center gap-1 rounded-full border border-line bg-canvas px-2.5 py-1 text-xs font-semibold text-muted">
                              <CheckCircle2 size={13} className="text-brand-700" />
                              {page}
                            </span>
                          ))}
                        </div>
                        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                          <ButtonLink href={`/dashboard/websites/${site.id}/setup/templates/${template.id}?category=${category.id}`} variant="secondary">
                            <Eye size={15} />
                            Preview
                          </ButtonLink>
                          <form action={selectTemplateAction}>
                            <input type="hidden" name="siteId" value={site.id} />
                            <input type="hidden" name="categoryId" value={category.id} />
                            <input type="hidden" name="templateId" value={template.id} />
                            <Button type="submit" className="w-full">
                              Use Template
                            </Button>
                          </form>
                        </div>
                      </div>
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
