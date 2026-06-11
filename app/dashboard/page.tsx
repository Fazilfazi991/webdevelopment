import Link from "next/link";
import { Bell, ChevronRight, CreditCard, Crown, Globe2, Headphones, LayoutGrid, MoreVertical, Plus, Settings, UserRound } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { requireDashboardContext } from "@/lib/data";
import { publicSitePath } from "@/lib/publishing/constants";
import { formatDate } from "@/lib/utils";

function websiteImage(index: number) {
  const images = [
    "/templates/technical-services-modern/cover.webp",
    "/templates/technical-services-modern/page-home.webp",
    "/templates/technical-services-modern/section-services.webp"
  ];
  return images[index % images.length];
}

function websiteAddress(site: { slug: string; primary_subdomain: string | null; publication_status: string }) {
  if (site.publication_status === "published" && site.primary_subdomain) return `${site.primary_subdomain}.yourplatform.com`;
  return `${site.slug}.draft`;
}

export default async function DashboardPage() {
  const { profile, sites } = await requireDashboardContext();
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";
  const sortedSites = [...sites].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  const visibleSites = sortedSites.slice(0, 3);

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1.15fr)_360px] lg:items-start">
      <section className="grid gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-2xl font-bold text-ink">Hi, {firstName}</p>
            <p className="mt-1 max-w-sm text-sm leading-6 text-muted">Manage your websites, account, and subscriptions in one focused workspace.</p>
          </div>
          <button className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-white text-ink shadow-soft" aria-label="Notifications">
            <Bell size={20} />
          </button>
        </div>

        <Link
          href="/dashboard/websites/new"
          className="group grid min-h-[78px] grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl bg-brand-700 p-4 text-white shadow-soft transition hover:bg-brand-900"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-white text-brand-700">
            <Plus size={24} />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-bold">Create New Website</span>
            <span className="mt-0.5 block text-sm text-white/80">Build a new website in 5 minutes</span>
          </span>
          <ChevronRight size={22} className="transition group-hover:translate-x-0.5" />
        </Link>

        <section className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-ink">My Websites</h2>
            <ButtonLink href="/dashboard/websites" variant="ghost" className="min-h-9 px-2 text-brand-700">
              View all
            </ButtonLink>
          </div>

          {visibleSites.length ? (
            <div className="grid gap-3">
              {visibleSites.map((site, index) => {
                const isLive = site.publication_status === "published";
                const href = isLive && site.primary_subdomain ? publicSitePath(site.primary_subdomain) : `/dashboard/websites/${site.id}`;

                return (
                  <article key={site.id} className="grid grid-cols-[116px_1fr_auto] items-center gap-3 rounded-2xl border border-line bg-white p-2.5 shadow-soft">
                    <Link
                      href={`/dashboard/websites/${site.id}`}
                      className="h-[74px] rounded-xl bg-cover bg-center"
                      style={{ backgroundImage: `url('${websiteImage(index)}')` }}
                      aria-label={`${site.name} website overview`}
                    />
                    <Link href={`/dashboard/websites/${site.id}`} className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-ink">{site.name}</h3>
                      <p className="mt-1 truncate text-xs font-semibold text-muted">{websiteAddress(site)}</p>
                      <p className="mt-1 truncate text-xs text-muted">Updated {formatDate(site.updated_at)}</p>
                    </Link>
                    <div className="flex h-full flex-col items-end justify-between gap-2">
                      <Link href={href} className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-brand-50 hover:text-brand-700" aria-label="Open website actions">
                        <MoreVertical size={18} />
                      </Link>
                      <StatusBadge status={site.status} />
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-brand-200 bg-white p-5 text-center shadow-soft">
              <p className="text-sm font-bold text-ink">No websites yet</p>
              <p className="mt-1 text-sm text-muted">Create your first business website from your phone.</p>
            </div>
          )}
        </section>

        <Link
          href="/dashboard/settings"
          className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-ink shadow-soft transition hover:border-brand-200"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-white text-brand-700">
            <Crown size={20} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-brand-700">Unlock more with Studio OS Pro</span>
            <span className="mt-0.5 block text-xs leading-5 text-muted">Connect domain, remove branding, and get premium features.</span>
          </span>
          <ChevronRight size={20} className="text-brand-700" />
        </Link>

        <section className="grid gap-3">
          <h2 className="text-base font-bold text-ink">Quick Access</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Account", href: "/dashboard/settings", icon: UserRound, tone: "text-brand-700 bg-brand-50" },
              { label: "Billing", href: "/dashboard/settings", icon: CreditCard, tone: "text-emerald-700 bg-emerald-50" },
              { label: "Domains", href: "/dashboard/websites", icon: Globe2, tone: "text-sky-700 bg-sky-50" },
              { label: "Support", href: "/dashboard/settings", icon: Headphones, tone: "text-amber-700 bg-amber-50" }
            ].map((item) => (
              <Link key={item.label} href={item.href} className="grid min-h-[104px] place-items-center rounded-2xl border border-line bg-white p-3 text-center shadow-soft transition hover:border-brand-200">
                <span className={`flex size-12 items-center justify-center rounded-2xl ${item.tone}`}>
                  <item.icon size={22} />
                </span>
                <span className="mt-2 text-xs font-bold text-ink">{item.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </section>

      <aside className="hidden rounded-3xl border border-line bg-white p-5 shadow-soft lg:grid lg:gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Dashboard focus</p>
          <h2 className="mt-2 text-xl font-bold text-ink">Simple. Clean. Built for action.</h2>
          <p className="mt-2 text-sm leading-6 text-muted">The main dashboard stays lightweight: create websites, choose a site, open account tools, and continue.</p>
        </div>
        {[
          { title: "Create New Website", body: "Primary CTA, prominent and easy to access.", icon: Plus },
          { title: "My Websites", body: "A compact list with status and last updated.", icon: LayoutGrid },
          { title: "Plans", body: "A small upgrade nudge without taking over the page.", icon: Crown },
          { title: "Quick Access", body: "Shortcuts for account, domains, billing, and support.", icon: Settings },
          { title: "Notifications", body: "Recent updates stay one tap away.", icon: Bell }
        ].map((item) => (
          <div key={item.title} className="grid grid-cols-[44px_1fr] gap-3 border-t border-line pt-4">
            <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <item.icon size={20} />
            </span>
            <span>
              <span className="block text-sm font-bold text-ink">{item.title}</span>
              <span className="mt-0.5 block text-xs leading-5 text-muted">{item.body}</span>
            </span>
          </div>
        ))}
      </aside>
    </div>
  );
}
