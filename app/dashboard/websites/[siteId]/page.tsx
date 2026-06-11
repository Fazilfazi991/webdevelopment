import {
  BarChart3,
  Bot,
  Edit3,
  ExternalLink,
  FileImage,
  Globe2,
  Lock,
  MessageSquareText,
  Pencil,
  Search,
  Settings,
  Upload,
  Users
} from "lucide-react";
import Link from "next/link";
import { publishWebsiteAction } from "@/app/publishing-actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { inputClassName } from "@/components/ui/field";
import { platformDomain } from "@/lib/publishing/constants";
import { getWebsiteCardState } from "@/app/dashboard/websites/website-card-state";
import { getTemplateById, requireSiteSetup } from "@/lib/setup";
import { formatDate } from "@/lib/utils";

const websiteTools = [
  { label: "Edit Website", description: "Update pages, sections, and content", href: "editor", icon: Edit3 },
  { label: "Pages", description: "Home, About, Services, Projects, Contact", href: "editor/sections", icon: MessageSquareText },
  { label: "Photos & Images", description: "Logo, hero image, services, gallery", href: "media", icon: FileImage },
  { label: "Enquiries", description: "View and follow up with website leads", href: "leads", icon: Users },
  { label: "Google Search Setup", description: "Titles, descriptions, and previews", href: "seo", icon: Search },
  { label: "Website Settings", description: "Business details and website address", href: "editor/settings", icon: Settings }
];

const advancedTools = [
  { label: "Blog", description: "Publish updates and helpful articles", icon: MessageSquareText },
  { label: "AI Chatbot", description: "Answer questions and capture leads 24/7", icon: Bot },
  { label: "Analytics", description: "Track visitors, pages, and enquiries", icon: BarChart3 },
  { label: "Custom Domain", description: "Connect your own .com or .ae address", icon: Globe2 }
];

function websiteUrl(subdomain: string | null) {
  return subdomain ? `${subdomain}.${platformDomain()}` : null;
}

export default async function WebsiteOverviewPage({ params }: { params: { siteId: string } }) {
  const { site, selection, supabase } = await requireSiteSetup(params.siteId);
  const { template } = selection?.template_id ? await getTemplateById(supabase, selection.template_id) : { template: null };
  const state = getWebsiteCardState({ site, selection, template });
  const liveUrl = state.showLiveAction ? websiteUrl(site.primary_subdomain) : null;

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="min-w-0">
          <Link href="/dashboard/websites" className="text-sm font-bold text-brand-700">
            Back to My Websites
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h2 className="break-words text-3xl font-bold text-ink">{site.name}</h2>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
              {state.badge}
            </span>
          </div>
          <p className="mt-2 break-all text-sm font-semibold text-muted">{liveUrl ?? `/${site.slug}.draft`}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[520px]">
          <ButtonLink href={`/dashboard/websites/${site.id}/editor`} className="min-h-[52px] sm:col-span-3">
            <Pencil size={17} />
            Edit Website
          </ButtonLink>
          <ButtonLink href={`/dashboard/websites/${site.id}/preview`} variant="secondary" className="min-h-[48px]">
            Preview
          </ButtonLink>
          {liveUrl ? (
            <a
              href={`https://${liveUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-app border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-brand-50"
            >
              <ExternalLink size={16} />
              View Live
            </a>
          ) : null}
          {state.showPublishAction && state.publishLabel ? (
            <details>
              <summary className="inline-flex min-h-[48px] w-full cursor-pointer list-none items-center justify-center gap-2 rounded-app border border-line bg-white px-4 text-sm font-semibold text-ink marker:hidden">
                <Upload size={16} />
                {state.publishLabel}
              </summary>
              <form action={publishWebsiteAction} className="mt-2 grid gap-3 rounded-xl border border-line bg-white p-4">
                <input type="hidden" name="siteId" value={site.id} />
                <div className="flex min-w-0 items-center rounded-xl border border-line bg-white">
                  <input className={`${inputClassName} min-h-[48px] rounded-xl border-0`} name="subdomain" defaultValue={site.primary_subdomain ?? site.slug} />
                  <span className="shrink-0 pr-3 text-sm text-muted">.{platformDomain()}</span>
                </div>
                <Button type="submit" className="min-h-[52px] w-full">{state.publishLabel}</Button>
              </form>
            </details>
          ) : null}
        </div>
      </div>

      <section className="grid gap-3 rounded-2xl border border-line bg-white p-4 shadow-soft sm:grid-cols-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Status</p>
          <p className="mt-2 text-lg font-bold text-ink">{state.badge}</p>
        </div>
        <div className="border-t border-line pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Last updated</p>
          <p className="mt-2 text-lg font-bold text-ink">{formatDate(site.updated_at)}</p>
        </div>
        <div className="border-t border-line pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Design</p>
          <p className="mt-2 text-lg font-bold text-ink">{template?.name ?? "Not selected"}</p>
        </div>
      </section>

      <section className="grid gap-3">
        <div>
          <h3 className="text-lg font-bold text-ink">Website tools</h3>
          <p className="mt-1 text-sm text-muted">Manage this website only. Photos, enquiries, SEO, and settings stay attached to this site.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {websiteTools.map((tool) => (
            <ButtonLink
              key={tool.label}
              href={tool.href === "media" ? `/dashboard/media?site=${site.id}` : `/dashboard/websites/${site.id}/${tool.href}`}
              variant="secondary"
              className="min-h-[88px] justify-start rounded-xl px-4 text-left"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <tool.icon size={20} />
              </span>
              <span>
                <span className="block text-sm font-bold text-ink">{tool.label}</span>
                <span className="mt-0.5 block text-xs font-normal text-muted">{tool.description}</span>
              </span>
            </ButtonLink>
          ))}
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-line bg-white p-4 shadow-soft">
        <div>
          <h3 className="text-lg font-bold text-ink">Explore more tools</h3>
          <p className="mt-1 text-sm text-muted">Advanced features can be unlocked later without making the dashboard harder to use now.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {advancedTools.map((tool) => (
            <div key={tool.label} className="rounded-xl border border-line bg-canvas p-4">
              <div className="flex items-center justify-between gap-3">
                <tool.icon size={20} className="text-brand-700" />
                <Lock size={16} className="text-muted" />
              </div>
              <h4 className="mt-4 text-sm font-bold text-ink">{tool.label}</h4>
              <p className="mt-1 text-xs leading-5 text-muted">{tool.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
