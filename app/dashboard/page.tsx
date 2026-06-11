import Link from "next/link";
import { ExternalLink, Globe2, Phone, Plus, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { requireDashboardContext } from "@/lib/data";
import { publicSitePath } from "@/lib/publishing/constants";

export default async function DashboardPage() {
  const { profile, sites } = await requireDashboardContext();
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  // For mobile, focus on the primary (most recently updated) website
  const primarySite = sites.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
  const isLive = primarySite?.publication_status === "published";

  return (
    <div className="grid gap-5">
      {/* Welcome */}
      <section>
        <p className="text-sm text-muted">Welcome back,</p>
        <h2 className="mt-0.5 text-xl font-bold text-ink">{firstName} 👋</h2>
      </section>

      {/* No websites yet */}
      {!primarySite && (
        <section className="rounded-2xl border-2 border-dashed border-brand-100 bg-gradient-to-br from-brand-50 to-white p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 text-white text-2xl shadow-soft">
            🌐
          </div>
          <h3 className="mt-4 text-lg font-bold text-ink">Create your business website in five minutes</h3>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted">
            Enter your business details, pick your services, and publish — all from your phone.
          </p>
          <ButtonLink href="/dashboard/websites/new" className="mt-5 w-full min-h-[52px] text-base">
            <Sparkles size={18} />
            Start Now
          </ButtonLink>
        </section>
      )}

      {/* Primary website card */}
      {primarySite && (
        <section className="rounded-2xl border border-line bg-white shadow-soft overflow-hidden">
          {/* Status strip */}
          <div className={`px-5 py-3 flex items-center justify-between gap-3 ${isLive ? "bg-emerald-50 border-b border-emerald-100" : "bg-amber-50 border-b border-amber-100"}`}>
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              <p className="text-sm font-bold text-ink">{isLive ? "Live" : "Draft"}</p>
            </div>
            <StatusBadge status={primarySite.status} />
          </div>

          <div className="p-5">
            <h3 className="text-lg font-bold text-ink">{primarySite.name}</h3>
            {isLive && primarySite.primary_subdomain ? (
              <a
                href={publicSitePath(primarySite.primary_subdomain)}
                className="mt-1 flex items-center gap-1.5 text-sm font-medium text-brand-700 underline"
              >
                <Globe2 size={13} />
                {primarySite.primary_subdomain}.yourplatform.com
              </a>
            ) : (
              <p className="mt-1 text-sm text-muted">/{primarySite.slug} — draft</p>
            )}

            {/* Primary actions */}
            <div className="mt-4 grid gap-2">
              <ButtonLink
                href={`/dashboard/websites/${primarySite.id}/editor`}
                className="w-full min-h-[52px] text-base"
              >
                ✏️ Edit Website
              </ButtonLink>

              <div className="grid grid-cols-2 gap-2">
                <ButtonLink
                  href={`/dashboard/websites/${primarySite.id}/preview`}
                  variant="secondary"
                  className="min-h-[48px] text-sm"
                >
                  👁 Preview
                </ButtonLink>
                {isLive && primarySite.primary_subdomain ? (
                  <a
                    href={publicSitePath(primarySite.primary_subdomain)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-app border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-canvas"
                  >
                    <ExternalLink size={15} />
                    View Live
                  </a>
                ) : (
                  <ButtonLink
                    href="/dashboard/websites"
                    variant="secondary"
                    className="min-h-[48px] text-sm"
                  >
                    Publish
                  </ButtonLink>
                )}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="border-t border-line px-5 py-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Quick actions</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Change Phone", icon: <Phone size={15} />, href: `/dashboard/websites/${primarySite.id}/editor` },
                { label: "Update Photos", icon: <span>🖼️</span>, href: `/dashboard/websites/${primarySite.id}/editor` },
                { label: "Add Service", icon: <Plus size={15} />, href: `/dashboard/websites/${primarySite.id}/editor` },
                { label: "View Leads", icon: <span>📬</span>, href: "/dashboard/leads" }
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex min-h-[48px] items-center gap-2 rounded-xl border border-line bg-canvas px-3 text-sm font-semibold text-ink transition hover:border-brand-600 hover:bg-brand-50"
                >
                  <span className="shrink-0 text-brand-700">{action.icon}</span>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Additional sites (if more than 1) */}
      {sites.length > 1 && (
        <section className="rounded-2xl border border-line bg-white shadow-soft p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink">Other websites</h3>
            <ButtonLink href="/dashboard/websites" variant="ghost" className="text-xs px-2 min-h-8">
              View all
            </ButtonLink>
          </div>
          <div className="grid gap-2">
            {sites.slice(1, 4).map((site) => (
              <Link
                key={site.id}
                href={`/dashboard/websites/${site.id}/editor`}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-canvas px-3 py-3 transition hover:bg-brand-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{site.name}</p>
                  <p className="text-xs text-muted capitalize">{site.publication_status}</p>
                </div>
                <StatusBadge status={site.status} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New website button when there are existing sites */}
      {sites.length > 0 && (
        <ButtonLink href="/dashboard/websites/new" variant="secondary" className="w-full min-h-[48px]">
          <Plus size={16} />
          Create another website
        </ButtonLink>
      )}
    </div>
  );
}
