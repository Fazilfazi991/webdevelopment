import {
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  Clock3,
  ExternalLink,
  FileText,
  Globe2,
  Home,
  ImageIcon,
  LayoutTemplate,
  Lock,
  Mail,
  MapPin,
  MessageSquareText,
  Palette,
  Pencil,
  Phone,
  Search,
  Settings,
  Sparkles,
  Upload,
  UserRound,
  Users
} from "lucide-react";
import Link from "next/link";
import { publishWebsiteAction } from "@/app/publishing-actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { inputClassName } from "@/components/ui/field";
import { getWebsiteCardState } from "@/app/dashboard/websites/website-card-state";
import { platformDomain } from "@/lib/publishing/constants";
import { getTemplateById, requireSiteSetup } from "@/lib/setup";
import type { ContactLead, SiteBusinessProfile, SiteThemeOverride } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: typeof Home;
  locked?: boolean;
};

function websiteUrl(subdomain: string | null) {
  return subdomain ? `${subdomain}.${platformDomain()}` : null;
}

function addressLabel(profile: SiteBusinessProfile | null) {
  return [profile?.address_line_1, profile?.address_line_2, profile?.city, profile?.state_region, profile?.postal_code]
    .filter(Boolean)
    .join(", ") || "Not added";
}

function workingHoursLabel(value: unknown) {
  if (typeof value === "string" && value.trim()) return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.summary === "string" && record.summary.trim()) return record.summary;
    if (typeof record.description === "string" && record.description.trim()) return record.description;
  }
  return "Not added";
}

function leadTime(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function statusClasses(status: ContactLead["status"]) {
  if (status === "new") return "bg-emerald-50 text-emerald-800";
  if (status === "contacted") return "bg-blue-50 text-blue-800";
  if (status === "qualified") return "bg-amber-50 text-amber-800";
  return "bg-canvas text-muted";
}

export default async function WebsiteOverviewPage({ params }: { params: { siteId: string } }) {
  const { site, selection, supabase } = await requireSiteSetup(params.siteId);
  const { template } = selection?.template_id ? await getTemplateById(supabase, selection.template_id) : { template: null };
  const [{ data: profile }, { data: leads }, { count: leadCount }, { data: theme }] = await Promise.all([
    supabase.from("site_business_profiles").select("*").eq("site_id", site.id).maybeSingle<SiteBusinessProfile>(),
    supabase.from("contact_leads").select("*").eq("site_id", site.id).order("submitted_at", { ascending: false }).limit(3).returns<ContactLead[]>(),
    supabase.from("contact_leads").select("id", { count: "exact", head: true }).eq("site_id", site.id),
    supabase.from("site_theme_overrides").select("*").eq("site_id", site.id).maybeSingle<SiteThemeOverride>()
  ]);
  const state = getWebsiteCardState({ site, selection, template });
  const liveUrl = state.showLiveAction ? websiteUrl(site.primary_subdomain) : null;
  const baseUrl = `/dashboard/websites/${site.id}`;
  const previewImage = "/templates/technical-services-modern/preview-desktop.webp";
  const palette = [theme?.primary_color ?? "#176b55", theme?.secondary_color ?? "#0f3d35", theme?.accent_color ?? "#d7b98e"];
  const navItems: NavItem[] = [
    { label: "Overview", href: baseUrl, icon: Home },
    { label: "Edit Website", href: `${baseUrl}/editor`, icon: Pencil },
    { label: "Design", href: `${baseUrl}/editor/design`, icon: Palette },
    { label: "Pages", href: `${baseUrl}/editor/sections`, icon: FileText },
    { label: "Photos", href: `${baseUrl}/media`, icon: ImageIcon },
    { label: "Enquiries", href: `${baseUrl}/leads`, icon: MessageSquareText },
    { label: "Google Search Setup", href: `${baseUrl}/seo`, icon: Search },
    { label: "Blog", href: baseUrl, icon: FileText, locked: true },
    { label: "Settings", href: `${baseUrl}/settings`, icon: Settings }
  ];
  const moreTools = [
    { label: "AI Chatbot", icon: Bot, locked: true },
    { label: "Analytics", icon: BarChart3, locked: true },
    { label: "Bookings", icon: CalendarDays, locked: true },
    { label: "Custom Domain", icon: Globe2, locked: false },
    { label: "Team Access", icon: Users, locked: true }
  ];
  const quickActions = [
    { label: "Update Photos", description: "Keep your gallery fresh", href: `${baseUrl}/media`, icon: ImageIcon },
    { label: "Change Phone Number", description: "Update contact details", href: `${baseUrl}/editor/settings`, icon: Phone },
    { label: "Add Service", description: "Tell customers what you offer", href: `${baseUrl}/editor/pages?page=services`, icon: BriefcaseBusiness },
    { label: "View Enquiries", description: "See and respond to leads", href: `${baseUrl}/leads`, icon: Mail },
    { label: "Update Working Hours", description: "Keep opening hours current", href: `${baseUrl}/editor/settings`, icon: Clock3 },
    { label: "Google Search Setup", description: "Help customers find you", href: `${baseUrl}/seo`, icon: Search }
  ];

  return (
    <div data-site-workspace className="mx-auto max-w-[1500px]">
      <div className="legacy-site-mobile-nav mb-5 flex gap-2 overflow-x-auto pb-2 lg:hidden">
        {navItems.filter((item) => !item.locked).map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-semibold ${item.label === "Overview" ? "border-brand-200 bg-brand-50 text-brand-800" : "border-line bg-white text-muted"}`}
          >
            <item.icon size={17} />
            {item.label}
            {item.label === "Design" ? <span className="flex -space-x-1">{palette.map((color) => <span key={color} className="size-3 rounded-full border border-white" style={{ backgroundColor: color }} />)}</span> : null}
          </Link>
        ))}
      </div>

      <div className="legacy-site-grid grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="legacy-site-sidebar hidden self-start rounded-xl border border-line bg-white p-3 shadow-soft lg:sticky lg:top-6 lg:block">
          <Link href="/dashboard" className="mb-4 flex items-center gap-3 px-2 py-1 text-lg font-bold text-ink">
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand-700 text-white">S</span>
            Studio OS
          </Link>
          <Link href="/dashboard/websites" className="flex items-center gap-3 rounded-lg border border-line p-3 transition hover:bg-canvas">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-800 text-white"><LayoutTemplate size={20} /></span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-ink">{site.name}</span>
              <span className="block truncate text-xs text-muted">Switch website</span>
            </span>
            <ChevronDown size={16} className="text-muted" />
          </Link>

          <nav className="mt-4 grid gap-1" aria-label="Website navigation">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-disabled={item.locked}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${item.label === "Overview" ? "bg-brand-50 text-brand-800" : "text-muted hover:bg-canvas hover:text-ink"} ${item.locked ? "pointer-events-none opacity-55" : ""}`}
              >
                <item.icon size={19} />
                <span className="flex-1">{item.label}</span>
                {item.label === "Design" ? <span className="flex -space-x-1">{palette.map((color) => <span key={color} className="size-4 rounded-full border-2 border-white" style={{ backgroundColor: color }} />)}</span> : null}
                {item.locked ? <Lock size={14} /> : null}
              </Link>
            ))}
          </nav>

          <div className="my-4 border-t border-line" />
          <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-muted">More tools</p>
          <div className="mt-2 grid gap-1">
            {moreTools.map((item) => (
              <Link
                key={item.label}
                href={item.label === "Custom Domain" ? `${baseUrl}/editor/settings` : baseUrl}
                className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm text-muted transition hover:bg-canvas hover:text-ink ${item.locked ? "pointer-events-none opacity-55" : ""}`}
              >
                <item.icon size={17} />
                <span className="flex-1">{item.label}</span>
                {item.locked ? <Lock size={13} /> : null}
              </Link>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Welcome back</p>
              <h1 className="mt-1 text-2xl font-bold text-ink">Manage {site.name}</h1>
            </div>
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 text-sm font-bold text-emerald-800">
              <span className="size-2 rounded-full bg-emerald-600" />
              {state.badge}
            </span>
          </div>

          <section className="grid gap-5 rounded-xl border border-line bg-white p-4 shadow-soft xl:grid-cols-[minmax(300px,0.9fr)_minmax(430px,1.35fr)] xl:p-5">
            <div className="relative min-h-[240px] overflow-hidden rounded-lg bg-slate-900 bg-cover bg-center sm:min-h-[310px] xl:min-h-0" style={{ backgroundImage: `linear-gradient(180deg, rgba(7,24,22,.08), rgba(7,24,22,.4)), url('${previewImage}')` }}>
              <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-lg bg-brand-800/95 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white">
                <Globe2 size={16} /> Main website
              </span>
            </div>

            <div className="flex min-w-0 flex-col">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-bold text-ink sm:text-3xl">{profile?.company_name || site.name}</h2>
                  <span className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">
                    <Sparkles size={16} /> {state.title}
                  </span>
                  <p className="mt-4 text-sm text-muted">{liveUrl ? "Your live website" : "Your draft website"}</p>
                  <p className="mt-1 break-all text-sm font-bold text-brand-700">{liveUrl ? `https://${liveUrl}` : `/${site.slug}.draft`}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-2 2xl:grid-cols-4">
                <ButtonLink href={`${baseUrl}/editor`} className="min-h-[50px]"><Pencil size={17} />Edit Website</ButtonLink>
                <ButtonLink href={`${baseUrl}/preview`} variant="secondary" className="min-h-[50px]"><ExternalLink size={17} />Preview</ButtonLink>
                {liveUrl ? (
                  <a href={`https://${liveUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-app border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-brand-50">
                    <Globe2 size={17} />View Live Site
                  </a>
                ) : null}
                {state.showPublishAction && state.publishLabel ? (
                  <details className={liveUrl ? "" : "sm:col-span-2 2xl:col-span-1"}>
                    <summary className="inline-flex min-h-[50px] w-full cursor-pointer list-none items-center justify-center gap-2 rounded-app border border-line bg-white px-4 text-sm font-semibold text-ink marker:hidden">
                      <Upload size={17} />{state.publishLabel}
                    </summary>
                    <form action={publishWebsiteAction} className="mt-2 grid gap-3 rounded-lg border border-line bg-canvas p-3">
                      <input type="hidden" name="siteId" value={site.id} />
                      <div className="flex min-w-0 items-center rounded-lg border border-line bg-white">
                        <input className={`${inputClassName} min-h-[46px] min-w-0 rounded-lg border-0`} name="subdomain" defaultValue={site.primary_subdomain ?? site.slug} />
                        <span className="shrink-0 pr-3 text-xs text-muted">.{platformDomain()}</span>
                      </div>
                      <Button type="submit" className="w-full">{state.publishLabel}</Button>
                    </form>
                  </details>
                ) : (
                  <Button variant="secondary" disabled className="min-h-[50px]"><Upload size={17} />Publish Updates</Button>
                )}
              </div>

              <div className="mt-auto grid gap-3 border-t border-line pt-5 sm:grid-cols-3">
                <div><p className="text-xs font-semibold text-muted">Status</p><p className="mt-1 text-sm font-bold text-ink">{state.badge}</p></div>
                <div className="border-t border-line pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0"><p className="text-xs font-semibold text-muted">Last updated</p><p className="mt-1 text-sm font-bold text-ink">{formatDate(site.updated_at)}</p></div>
                <div className="border-t border-line pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0"><p className="text-xs font-semibold text-muted">Enquiries</p><p className="mt-1 text-sm font-bold text-brand-700">{leadCount ?? 0}</p></div>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <div className="flex items-end justify-between gap-3"><div><h2 className="text-lg font-bold text-ink">Quick actions</h2><p className="mt-1 text-sm text-muted">The updates customers need most often.</p></div><ButtonLink href={`${baseUrl}/editor/design`} variant="ghost" className="hidden sm:inline-flex"><Palette size={17} />Change Design</ButtonLink></div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href} className="flex min-h-[112px] items-start gap-3 rounded-xl border border-line bg-white p-4 shadow-soft transition hover:border-brand-200 hover:bg-brand-50">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><action.icon size={20} /></span>
                  <span><span className="block text-sm font-bold text-ink">{action.label}</span><span className="mt-1 block text-xs leading-5 text-muted">{action.description}</span></span>
                </Link>
              ))}
            </div>
          </section>

          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            <section className="overflow-hidden rounded-xl border border-line bg-white shadow-soft">
              <div className="flex items-center justify-between border-b border-line px-4 py-4 sm:px-5"><h2 className="font-bold text-ink">Recent enquiries</h2><Link href={`${baseUrl}/leads`} className="text-sm font-bold text-brand-700">View all</Link></div>
              <div className="divide-y divide-line px-4 sm:px-5">
                {leads?.length ? leads.map((lead) => (
                  <div key={lead.id} className="flex items-center gap-3 py-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700"><UserRound size={19} /></span>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-ink">{lead.name}</p><p className="mt-1 truncate text-xs text-muted">{lead.subject || lead.message}</p></div>
                    <div className="hidden text-right sm:block"><p className="text-xs text-muted">{leadTime(lead.submitted_at)}</p><span className={`mt-1 inline-flex rounded-full px-2 py-1 text-[11px] font-bold capitalize ${statusClasses(lead.status)}`}>{lead.status}</span></div>
                  </div>
                )) : (
                  <div className="flex min-h-[190px] flex-col items-center justify-center px-4 py-8 text-center"><Mail size={26} className="text-brand-700" /><p className="mt-3 text-sm font-bold text-ink">No enquiries yet</p><p className="mt-1 max-w-xs text-xs leading-5 text-muted">New website enquiries will appear here as soon as customers get in touch.</p></div>
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-line bg-white shadow-soft">
              <div className="flex items-center justify-between border-b border-line px-4 py-4 sm:px-5"><h2 className="font-bold text-ink">Business information</h2><Link href={`${baseUrl}/editor/settings`} className="text-sm font-bold text-brand-700">Edit</Link></div>
              <div className="divide-y divide-line px-4 sm:px-5">
                {[
                  { label: "Business name", value: profile?.company_name || site.name, icon: BriefcaseBusiness },
                  { label: "Phone", value: profile?.phone || "Not added", icon: Phone },
                  { label: "Email", value: profile?.email || "Not added", icon: Mail },
                  { label: "Address", value: addressLabel(profile), icon: MapPin },
                  { label: "Working hours", value: workingHoursLabel(profile?.working_hours), icon: Clock3 }
                ].map((item) => (
                  <div key={item.label} className="grid gap-2 py-3 text-sm sm:grid-cols-[150px_1fr] sm:items-start">
                    <span className="flex items-center gap-2 text-muted"><item.icon size={17} />{item.label}</span>
                    <span className="break-words font-semibold text-ink">{item.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
