import Link from "next/link";
import Image from "next/image";
import { existsSync } from "fs";
import { join } from "path";
import { ArrowLeft, CheckCircle2, ExternalLink, Monitor, Smartphone, Tablet } from "lucide-react";
import { selectTemplateAction } from "@/app/setup-actions";
import { SiteRenderer } from "@/components/site-renderer/site-renderer";
import { SetupProgress } from "@/components/setup/setup-progress";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";
import { applyEditorMerges, loadEditorContext } from "@/lib/site-editor/editor-loader";
import { loadTemplatePreviewByTemplateId } from "@/lib/site-renderer/template-loader";
import { getCategories, getTemplateById, requireSiteSetup } from "@/lib/setup";
import { cn } from "@/lib/utils";

const previewDevices = [
  { key: "desktop", label: "Desktop", width: 1440, icon: Monitor },
  { key: "tablet", label: "Tablet", width: 768, icon: Tablet },
  { key: "mobile", label: "Mobile", width: 390, icon: Smartphone }
] as const;

const templateAssetBase = "/templates/technical-services-modern";

const pageGallery = [
  { title: "Home", slug: "home", image: `${templateAssetBase}/page-home.webp` },
  { title: "About", slug: "about", image: `${templateAssetBase}/page-about.webp` },
  { title: "Services", slug: "services", image: `${templateAssetBase}/page-services.webp` },
  { title: "Projects", slug: "projects", image: `${templateAssetBase}/page-projects.webp` },
  { title: "Contact", slug: "contact", image: `${templateAssetBase}/page-contact.webp` }
];

const sectionGallery = [
  { title: "Hero Section", description: "Strong service headline, real image, and quotation CTA.", image: `${templateAssetBase}/section-hero.webp` },
  { title: "Service Highlights", description: "Quick service categories for fast customer scanning.", image: `${templateAssetBase}/section-services.webp` },
  { title: "About", description: "Trust-building company story with practical proof points.", image: `${templateAssetBase}/page-about.webp` },
  { title: "Services Grid", description: "Readable service cards with matching technical imagery.", image: `${templateAssetBase}/section-services.webp` },
  { title: "Why Choose Us", description: "Compact credibility cards for decision support.", image: `${templateAssetBase}/cover.webp` },
  { title: "Projects Gallery", description: "Visual project examples for maintenance work.", image: `${templateAssetBase}/section-projects.webp` },
  { title: "Testimonials", description: "Customer feedback cards that add reassurance.", image: `${templateAssetBase}/preview-desktop.webp` },
  { title: "FAQ", description: "Common questions presented in a clean accordion style.", image: `${templateAssetBase}/page-contact.webp` },
  { title: "Contact", description: "Lead form, contact details, and service-area panel.", image: `${templateAssetBase}/section-contact.webp` },
  { title: "Footer", description: "Simple final navigation and business contact details.", image: `${templateAssetBase}/section-footer.webp` }
];

const includedFeatures = [
  "Mobile responsive",
  "Contact form",
  "WhatsApp action",
  "SEO-ready",
  "Editable content",
  "Image uploads",
  "Custom colours",
  "Custom domain ready"
];

type PreviewDevice = (typeof previewDevices)[number]["key"];

function currentDevice(value?: string): PreviewDevice {
  return previewDevices.some((device) => device.key === value) ? (value as PreviewDevice) : "desktop";
}

function publicAssetExists(src: string) {
  return existsSync(join(process.cwd(), "public", src.replace(/^\//, "")));
}

function TemplateImage({
  src,
  alt,
  className,
  sizes,
  priority = false
}: {
  src: string;
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  if (!publicAssetExists(src)) {
    return (
      <div className="flex h-full min-h-[220px] w-full items-center justify-center bg-canvas text-sm font-semibold text-muted">
        Preview image pending
      </div>
    );
  }

  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className ?? "object-cover"} />;
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
  const { template } = await getTemplateById(supabase, params.templateId);
  const selectedTemplatePreview =
    template && selection?.template_id === template.id ? applyEditorMerges(await loadEditorContext(supabase, site.id, false)) : null;
  const renderedPreview = selectedTemplatePreview ?? (template ? await loadTemplatePreviewByTemplateId(supabase, template.id) : null);
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

  const coverImage = publicAssetExists(`${templateAssetBase}/cover.webp`) ? `${templateAssetBase}/cover.webp` : `${templateAssetBase}/preview-desktop.webp`;
  const fullPreviewHref = `/dashboard/websites/${site.id}/preview?device=${device}`;
  const templateDescription =
    template.short_description ?? "A clean, professional website template for maintenance and technical-service businesses.";

  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-8">
      <SetupProgress siteId={site.id} currentStep="template" />

      <section className="grid gap-6 rounded-app bg-white p-5 shadow-soft md:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <Link href={`/dashboard/websites/${site.id}/setup/templates?category=${category.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-brand-700">
            <ArrowLeft size={16} />
            Back to Templates
          </Link>
          <p className="mt-6 text-sm font-semibold text-brand-700">{template.style_label ?? "Modern Service"}</p>
          <h1 className="mt-2 max-w-4xl text-3xl font-bold leading-tight text-ink md:text-5xl">{template.name}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            A clean, professional website template for maintenance and technical-service businesses.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold text-muted">
            {["Technical services", "AC maintenance", "Electrical", "Plumbing"].map((item) => (
              <span key={item} className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:flex sm:flex-wrap sm:justify-end">
          <form action={selectTemplateAction}>
            <input type="hidden" name="siteId" value={site.id} />
            <input type="hidden" name="categoryId" value={category.id} />
            <input type="hidden" name="templateId" value={template.id} />
            <Button type="submit" className="w-full sm:w-auto">
              Use This Template
            </Button>
          </form>
          <ButtonLink href={fullPreviewHref} variant="secondary" target="_blank" rel="noreferrer">
            <ExternalLink size={16} />
            Open Full Live Preview
          </ButtonLink>
        </div>
      </section>

      <section className="overflow-hidden rounded-app bg-white shadow-soft">
        <div className="relative aspect-[16/9] min-h-[260px] w-full bg-canvas md:min-h-[520px]">
          <TemplateImage src={coverImage} alt={`${template.name} large cover preview`} sizes="100vw" priority className="object-cover" />
        </div>
      </section>

      <section className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-ink">Explore the pages</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{templateDescription}</p>
          </div>
          <ButtonLink href={fullPreviewHref} variant="secondary" target="_blank" rel="noreferrer">
            <ExternalLink size={16} />
            Open Full Live Preview
          </ButtonLink>
        </div>
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-5">
          {pageGallery.map((page) => (
            <article key={page.slug} className="min-w-[250px] overflow-hidden rounded-app bg-white shadow-soft sm:min-w-0">
              <div className="relative aspect-[4/3] bg-canvas">
                <TemplateImage src={page.image} alt={`${page.title} page preview`} sizes="(min-width: 1024px) 20vw, 70vw" />
              </div>
              <div className="grid gap-3 p-4">
                <h3 className="font-bold text-ink">{page.title}</h3>
                <ButtonLink href={`/dashboard/websites/${site.id}/preview/${page.slug === "home" ? "" : page.slug}?device=${device}`} variant="secondary" target="_blank" rel="noreferrer">
                  Open preview
                </ButtonLink>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink">Homepage sections included</h2>
          <p className="mt-2 text-sm leading-6 text-muted">A complete service-business homepage structure with practical conversion sections.</p>
        </div>
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-5">
          {sectionGallery.map((section) => (
            <article key={section.title} className="min-w-[260px] overflow-hidden rounded-app bg-white shadow-soft sm:min-w-0">
              <div className="relative aspect-[4/3] bg-canvas">
                <TemplateImage src={section.image} alt={`${section.title} screenshot`} sizes="(min-width: 1024px) 20vw, 70vw" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-ink">{section.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{section.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-app bg-white p-5 shadow-soft md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-ink">Try the live preview</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Switch device sizes and scroll the rendered homepage.</p>
          </div>
          <div className="flex rounded-app border border-line bg-canvas p-1" aria-label="Preview device">
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
        </div>
        <div className="overflow-auto rounded-app bg-[#eef3ef] p-3 md:p-5">
          <div
            className="relative mx-auto h-[760px] max-h-[calc(100vh-180px)] min-h-[560px] min-w-0 overflow-x-hidden overflow-y-auto rounded-app bg-white shadow-soft [&_.fixed]:absolute"
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

      <section className="grid gap-5 rounded-app bg-white p-5 shadow-soft md:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <h2 className="text-2xl font-bold text-ink">Included features</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {includedFeatures.map((feature) => (
              <p key={feature} className="flex items-center gap-2 rounded-app bg-canvas px-3 py-2 text-sm font-semibold text-ink">
                <CheckCircle2 size={16} className="shrink-0 text-brand-700" />
                {feature}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 rounded-app bg-brand-700 p-6 text-white shadow-soft md:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <h2 className="text-2xl font-bold">Ready to use this design?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">Apply the template now, then customise text, colours, services, and images in the guided editor.</p>
        </div>
        <div className="grid gap-3 sm:flex sm:flex-wrap">
          <form action={selectTemplateAction}>
            <input type="hidden" name="siteId" value={site.id} />
            <input type="hidden" name="categoryId" value={category.id} />
            <input type="hidden" name="templateId" value={template.id} />
            <Button type="submit" className="w-full bg-white text-brand-700 hover:bg-brand-50 sm:w-auto">
              Use This Template
            </Button>
          </form>
          <ButtonLink href={fullPreviewHref} variant="secondary" target="_blank" rel="noreferrer" className="border-white/30 bg-white/10 text-white hover:bg-white/15">
            <ExternalLink size={16} />
            Open Full Live Preview
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
