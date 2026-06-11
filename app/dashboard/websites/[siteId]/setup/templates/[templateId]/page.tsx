import Link from "next/link";
import { ArrowLeft, CheckCircle2, ExternalLink, Monitor, Smartphone, Tablet } from "lucide-react";
import { selectTemplateAction } from "@/app/setup-actions";
import { SiteRenderer } from "@/components/site-renderer/site-renderer";
import { SetupProgress } from "@/components/setup/setup-progress";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { loadTemplatePreviewByTemplateId } from "@/lib/site-renderer/template-loader";
import { getCategories, getTemplateById, requireSiteSetup } from "@/lib/setup";
import { cn } from "@/lib/utils";

const previewDevices = [
  { key: "desktop", label: "Desktop", width: 1440, icon: Monitor },
  { key: "tablet", label: "Tablet", width: 768, icon: Tablet },
  { key: "mobile", label: "Mobile", width: 390, icon: Smartphone }
] as const;

type PreviewDevice = (typeof previewDevices)[number]["key"];

function currentDevice(value?: string): PreviewDevice {
  return previewDevices.some((device) => device.key === value) ? (value as PreviewDevice) : "desktop";
}

export default async function TemplatePreviewPage({
  params,
  searchParams
}: {
  params: { siteId: string; templateId: string };
  searchParams: { category?: string; device?: string };
}) {
  const { site, supabase, selection } = await requireSiteSetup(params.siteId);
  const categoryId = searchParams.category ?? selection?.business_category_id;
  const categories = await getCategories(supabase);
  const category = categories.find((item) => item.id === categoryId);
  const { template, pages } = await getTemplateById(supabase, params.templateId);
  const renderedPreview = template ? await loadTemplatePreviewByTemplateId(supabase, template.id) : null;
  const device = currentDevice(searchParams.device);
  const selectedDevice = previewDevices.find((item) => item.key === device) ?? previewDevices[0];

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
    <div className="grid gap-5">
      <SetupProgress siteId={site.id} currentStep="template" />
      <div className="sticky top-0 z-30 -mx-4 border-b border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <Link href={`/dashboard/websites/${site.id}/setup/templates?category=${category.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-brand-700">
              <ArrowLeft size={16} />
              Back to Templates
            </Link>
            <div className="hidden h-6 w-px bg-line md:block" />
            <div>
              <h2 className="text-lg font-bold text-ink">{template.name}</h2>
              <p className="text-sm text-muted">A clean, professional website template for maintenance and technical-service businesses.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-app border border-line bg-white p-1" aria-label="Preview device">
              {previewDevices.map((item) => {
                const Icon = item.icon;
                const active = item.key === device;
                return (
                  <ButtonLink
                    key={item.key}
                    href={`/dashboard/websites/${site.id}/setup/templates/${template.id}?category=${category.id}&device=${item.key}`}
                    variant={active ? "primary" : "ghost"}
                    className={cn("min-h-9 px-3", active && "pointer-events-none")}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </ButtonLink>
                );
              })}
            </div>
            <ButtonLink href={`/dashboard/websites/${site.id}/preview?device=${device}`} variant="secondary" target="_blank" rel="noreferrer">
              <ExternalLink size={16} />
              Open Full Preview
            </ButtonLink>
            <form action={selectTemplateAction}>
              <input type="hidden" name="siteId" value={site.id} />
              <input type="hidden" name="categoryId" value={category.id} />
              <input type="hidden" name="templateId" value={template.id} />
              <Button type="submit">Use This Template</Button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1500px] gap-5 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,3fr)_minmax(290px,1fr)]">
        <section className="min-w-0 rounded-app border border-line bg-white shadow-soft">
          <div className="flex items-center gap-2 border-b border-line bg-canvas px-4 py-3">
            <span className="size-3 rounded-full bg-red-300" />
            <span className="size-3 rounded-full bg-amber-300" />
            <span className="size-3 rounded-full bg-emerald-400" />
            <span className="ml-3 truncate rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-muted">
              {template.slug}.preview
            </span>
          </div>
          <div className="overflow-auto bg-[#eef3ef] p-3 md:p-5">
            <div
              className="relative mx-auto h-[760px] max-h-[calc(100vh-220px)] min-h-[560px] overflow-auto rounded-app bg-white shadow-soft transform-gpu [&_.fixed]:absolute"
              style={{ width: selectedDevice.width, maxWidth: "100%" }}
            >
              {renderedPreview?.status === "ready" ? (
                <SiteRenderer preview={renderedPreview.preview} pageSlug="home" />
              ) : (
                <div className="flex min-h-full items-center justify-center p-8 text-center">
                  <div>
                    <h3 className="text-xl font-bold text-ink">Full preview coming soon</h3>
                    <p className="mt-2 max-w-md text-sm leading-6 text-muted">This template is available for setup, but a full rendered website preview has not been configured yet.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden bg-white">
            <div className="border-b border-line p-5">
              <p className="text-sm font-semibold text-brand-700">{template.style_label ?? "Professional"}</p>
              <h3 className="mt-1 text-xl font-bold text-ink">{template.name}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{template.short_description ?? template.long_description}</p>
            </div>
            <div className="grid gap-5 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Category</p>
                <p className="mt-1 text-sm font-semibold text-ink">{category.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Included Pages</p>
                <ul className="mt-2 grid gap-2">
                  {pages.map((page) => (
                    <li key={page.id} className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <CheckCircle2 size={16} className="text-brand-700" />
                      {page.page_name}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Included Features</p>
                <ul className="mt-2 grid gap-2 text-sm font-semibold text-ink">
                  {["Mobile responsive", "Contact form included", "WhatsApp included", "SEO-ready", "Customisable colours"].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-brand-700" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="sticky bottom-0 border-t border-line bg-white p-5">
              <form action={selectTemplateAction}>
                <input type="hidden" name="siteId" value={site.id} />
                <input type="hidden" name="categoryId" value={category.id} />
                <input type="hidden" name="templateId" value={template.id} />
                <Button type="submit" className="w-full">
                  Use This Template
                </Button>
              </form>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
