import Link from "next/link";
import { ExternalLink, Eye, FileImage, Globe2, Phone, Plus, Wrench } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { requireDashboardContext } from "@/lib/data";
import { publicSitePath } from "@/lib/publishing/constants";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const { profile, sites } = await requireDashboardContext();
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";
  const primarySite = [...sites].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
  const isLive = primarySite?.publication_status === "published";

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted">Welcome back,</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">{firstName}</h2>
        </div>
        {primarySite ? <StatusBadge status={primarySite.status} /> : null}
      </section>

      {!primarySite ? (
        <section className="rounded-2xl border border-dashed border-brand-200 bg-white p-6 text-center shadow-soft">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-700 text-white">
            <Globe2 size={24} />
          </div>
          <h3 className="mt-4 text-xl font-bold text-ink">Create your business website from your phone</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            Add your business details, choose services, preview, and publish without using desktop mode.
          </p>
          <ButtonLink href="/dashboard/websites/new" className="mt-5 min-h-[52px] w-full text-base sm:w-auto">
            <Plus size={18} />
            Create website
          </ButtonLink>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
          <div className={isLive ? "border-b border-emerald-100 bg-emerald-50 px-5 py-3" : "border-b border-amber-100 bg-amber-50 px-5 py-3"}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={isLive ? "size-2.5 rounded-full bg-emerald-500" : "size-2.5 rounded-full bg-amber-500"} />
                <p className="text-sm font-bold text-ink">{isLive ? "Your website is live" : "Your website is in draft"}</p>
              </div>
              <StatusBadge status={primarySite.status} />
            </div>
          </div>

          <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="min-w-0">
              <h3 className="break-words text-2xl font-bold text-ink">{primarySite.name}</h3>
              {isLive && primarySite.primary_subdomain ? (
                <a
                  href={publicSitePath(primarySite.primary_subdomain)}
                  className="mt-1 inline-flex items-center gap-1.5 break-all text-sm font-semibold text-brand-700 underline"
                >
                  <Globe2 size={14} />
                  {primarySite.primary_subdomain}.yourplatform.com
                </a>
              ) : (
                <p className="mt-1 break-all text-sm font-semibold text-muted">/{primarySite.slug}.draft</p>
              )}
              <p className="mt-3 text-sm text-muted">Last updated {formatDate(primarySite.updated_at)}</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[520px]">
              <ButtonLink href={`/dashboard/websites/${primarySite.id}/editor`} className="min-h-[52px] sm:col-span-3">
                <Wrench size={17} />
                Edit Website
              </ButtonLink>
              <ButtonLink href={`/dashboard/websites/${primarySite.id}/preview`} variant="secondary" className="min-h-[48px]">
                <Eye size={16} />
                Preview
              </ButtonLink>
              {isLive && primarySite.primary_subdomain ? (
                <a
                  href={publicSitePath(primarySite.primary_subdomain)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-app border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-brand-50"
                >
                  <ExternalLink size={16} />
                  View Live
                </a>
              ) : (
                <ButtonLink href="/dashboard/websites" variant="secondary" className="min-h-[48px]">
                  <Globe2 size={16} />
                  Publish
                </ButtonLink>
              )}
              <ButtonLink href="/dashboard/websites" variant="secondary" className="min-h-[48px]">
                <Plus size={16} />
                More
              </ButtonLink>
            </div>
          </div>

          <div className="border-t border-line p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Quick actions</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Change Phone", icon: Phone, href: `/dashboard/websites/${primarySite.id}/editor/settings` },
                { label: "Update Photos", icon: FileImage, href: `/dashboard/media?site=${primarySite.id}` },
                { label: "Add Service", icon: Plus, href: `/dashboard/websites/${primarySite.id}/editor/services` },
                { label: "View Leads", icon: Globe2, href: `/dashboard/websites/${primarySite.id}/leads` }
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex min-h-[52px] items-center gap-3 rounded-xl border border-line bg-canvas px-4 text-sm font-bold text-ink transition hover:border-brand-200 hover:bg-brand-50"
                >
                  <action.icon size={18} className="shrink-0 text-brand-700" />
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {sites.length > 1 ? (
        <section className="rounded-2xl border border-line bg-white p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-ink">Other websites</h3>
            <ButtonLink href="/dashboard/websites" variant="ghost" className="min-h-10 px-3">
              View all
            </ButtonLink>
          </div>
          <div className="grid gap-2">
            {sites.slice(1, 4).map((site) => (
              <Link
                key={site.id}
                href={`/dashboard/websites/${site.id}/editor`}
                className="flex min-h-[64px] items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 transition hover:bg-brand-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink">{site.name}</p>
                  <p className="truncate text-xs text-muted">/{site.slug}</p>
                </div>
                <StatusBadge status={site.status} />
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
