import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, Eye, MonitorSmartphone, Sparkles, Star } from "lucide-react";
import { selectTemplateAction } from "@/app/setup-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { getCategories, getRecommendedTemplateForCategory, getTemplatesForCategory, requireSiteSetup } from "@/lib/setup";
import type { TemplatePage } from "@/lib/types";

/** Slugs that have a real, deployed thumbnail and renderer. */
const completedSlugs = new Set(["technical-services-modern"]);

function templateImagePath(slug: string, image?: string | null): string | null {
  if (image) return image;
  if (completedSlugs.has(slug)) return `/templates/${slug}/thumbnail.webp`;
  return null;
}

function TemplateScreenshot({ slug, name, src }: { slug: string; name: string; src: string | null }) {
  if (!src) return null; // hide cards without a real image

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
  return pages
    .filter((page) => page.template_id === templateId)
    .sort((a, b) => a.display_order - b.display_order)
    .map((page) => page.page_name);
}

export default async function TemplatesPage({
  params,
  searchParams
}: {
  params: { siteId: string };
  searchParams: { error?: string; category?: string; q?: string; style?: string };
}) {
  const { site, supabase, selection } = await requireSiteSetup(params.siteId);
  const categoryId = searchParams.category ?? selection?.business_category_id;
  const categories = await getCategories(supabase);
  const category = categories.find((item) => item.id === categoryId);

  const { templates, pages } = category
    ? await getTemplatesForCategory(supabase, category.id, {
        search: searchParams.q,
        style: searchParams.style
      })
    : { templates: [], pages: [] };

  // Only show templates that have a usable thumbnail
  const visibleTemplates = templates.filter((t) => templateImagePath(t.slug, t.thumbnail_url) !== null);

  // Resolve recommended template for the category
  const recommendation = category ? await getRecommendedTemplateForCategory(supabase, category.id) : null;
  const recommendedTemplateId = recommendation?.template?.id ?? null;
  const currentTemplateId = selection?.template_id ?? null;

  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">Optional</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">Explore other designs</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {category
              ? `Showing designs for ${category.name}. Your current design stays active until you choose a new one.`
              : "Choose a category to see matching designs."}
          </p>
        </div>
        <ButtonLink
          href={currentTemplateId
            ? `/dashboard/websites/${site.id}/setup/complete`
            : `/dashboard/websites/${site.id}/editor`}
          variant="secondary"
        >
          <ArrowLeft size={16} />
          Continue with current design
        </ButtonLink>
      </div>

      <StatusMessage error={searchParams.error} />

      {/* Category selector */}
      {!category ? (
        <EmptyState
          title="Choose a category first"
          description="Select a business category so we can show matching designs."
          action={<ButtonLink href={`/dashboard/websites/${site.id}/setup/category`}>Choose category</ButtonLink>}
        />
      ) : visibleTemplates.length === 0 ? (
        <Card className="p-8 text-center">
          <Sparkles className="mx-auto text-brand-700" size={32} />
          <h3 className="mt-4 text-lg font-bold text-ink">Your recommended design is ready.</h3>
          <p className="mt-2 text-sm leading-6 text-muted max-w-md mx-auto">
            More designs for this category will be added soon.
          </p>
          <div className="mt-6">
            <ButtonLink href={`/dashboard/websites/${site.id}/setup/complete`}>
              Continue with current design
            </ButtonLink>
          </div>
        </Card>
      ) : (
        <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleTemplates.map((template) => {
            const includedPages = includedPageNames(pages, template.id);
            const image = templateImagePath(template.slug, template.thumbnail_url);
            const isCurrent = template.id === currentTemplateId;
            const isRecommended = !isCurrent && template.id === recommendedTemplateId;

            return (
              <Card
                key={template.id}
                className={`flex h-full overflow-hidden bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg ${isCurrent ? "ring-2 ring-brand-700" : ""}`}
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="relative">
                    <TemplateScreenshot slug={template.slug} name={template.name} src={image} />
                    {/* Badges */}
                    <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-700 px-3 py-1 text-xs font-bold text-white shadow-sm">
                          <CheckCircle2 size={12} />
                          Current design
                        </span>
                      )}
                      {isRecommended && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand-700 shadow-sm">
                          <Star size={12} />
                          Recommended for you
                        </span>
                      )}
                      {template.is_featured && !isCurrent && !isRecommended && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-amber-700 shadow-sm">
                          <Sparkles size={12} />
                          Featured
                        </span>
                      )}
                    </div>
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

                    {includedPages.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {includedPages.slice(0, 5).map((page) => (
                          <span key={page} className="inline-flex items-center gap-1 rounded-full border border-line bg-canvas px-2.5 py-1 text-xs font-semibold text-muted">
                            <CheckCircle2 size={13} className="text-brand-700" />
                            {page}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                      <ButtonLink
                        href={`/dashboard/websites/${site.id}/setup/templates/${template.id}?category=${category.id}`}
                        variant="secondary"
                      >
                        <Eye size={15} />
                        Preview
                      </ButtonLink>
                      {isCurrent ? (
                        <ButtonLink href={`/dashboard/websites/${site.id}/setup/complete`}>
                          Continue
                        </ButtonLink>
                      ) : (
                        <form action={selectTemplateAction}>
                          <input type="hidden" name="siteId" value={site.id} />
                          <input type="hidden" name="categoryId" value={category.id} />
                          <input type="hidden" name="templateId" value={template.id} />
                          <Button type="submit" className="w-full">
                            Use this design
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Always show category change link at bottom */}
      {category && (
        <p className="text-center text-sm text-muted">
          Looking for a different style?{" "}
          <Link
            href={`/dashboard/websites/${site.id}/setup/category${selection?.industry_id ? `?industry=${selection.industry_id}` : ""}`}
            className="font-semibold text-brand-700 hover:underline"
          >
            Change category
          </Link>
        </p>
      )}
    </div>
  );
}
