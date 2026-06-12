"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, Bell, Bot, CalendarDays, Check, ChevronDown, ChevronRight,
  FileText, Globe2, Home, ImageIcon, LayoutTemplate, Lock, Menu,
  MessageSquareText, Palette, Pencil, Plus, Search, Settings, UserRound,
  Users, X
} from "lucide-react";
import type { Site } from "@/lib/types";
import type { LucideIcon } from "lucide-react";

type Permissions = { edit: boolean; design: boolean; media: boolean; leads: boolean; publish: boolean };

function siteStatus(site: Site) {
  if (site.publication_status === "published") return "Live";
  if (site.setup_step !== "content" && site.setup_step !== "template_selected") return "Setup incomplete";
  return "Draft";
}

function siteAddress(site: Site) {
  return site.primary_subdomain ? site.primary_subdomain : `/${site.slug}.draft`;
}

export function WebsiteWorkspaceShell({
  children, site, sites, palette, permissions, profile
}: {
  children: React.ReactNode;
  site: Site;
  sites: Site[];
  palette: string[];
  permissions: Permissions;
  profile: { name: string; email: string; avatarUrl: string | null };
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [websiteListOpen, setWebsiteListOpen] = useState(false);
  const [tabletSwitcherOpen, setTabletSwitcherOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [drawerOpen]);
  const isSetup = pathname.includes("/setup/");
  if (isSetup) return <>{children}</>;

  const base = `/dashboard/websites/${site.id}`;
  const nav = [
    { label: "Overview", href: base, icon: Home, show: true },
    { label: "Edit Website", href: `${base}/editor`, icon: Pencil, show: permissions.edit },
    { label: "Website Style", href: `${base}/editor/design`, icon: Palette, show: permissions.design },
    { label: "Pages", href: `${base}/editor/pages`, icon: FileText, show: permissions.edit },
    { label: "Photos & Images", href: `${base}/media`, icon: ImageIcon, show: permissions.media },
    { label: "Enquiries", href: `${base}/leads`, icon: MessageSquareText, show: permissions.leads },
    { label: "Google Search Setup", href: `${base}/seo`, icon: Search, show: permissions.edit },
    { label: "Blog", href: base, icon: FileText, show: true, locked: true },
    { label: "Settings", href: `${base}/settings`, icon: Settings, show: permissions.edit }
  ];
  const mobileNav = [
    { label: "Home", href: base, icon: Home, show: true },
    { label: "Edit", href: `${base}/editor`, icon: Pencil, show: permissions.edit },
    { label: "Photos", href: `${base}/media`, icon: ImageIcon, show: permissions.media },
    { label: "Enquiries", href: `${base}/leads`, icon: MessageSquareText, show: permissions.leads }
  ].filter((item) => item.show);
  const mobileTools: Array<{ label: string; icon: LucideIcon; locked: boolean }> = [
    { label: "AI Chatbot", icon: Bot, locked: true },
    { label: "Analytics", icon: BarChart3, locked: true },
    { label: "Bookings", icon: CalendarDays, locked: true },
    { label: "Custom Domain", icon: Globe2, locked: false },
    { label: "Team Access", icon: Users, locked: true }
  ];

  function switchHref(nextSiteId: string) {
    const suffix = pathname.slice(base.length);
    const safeSuffix = ["", "/editor", "/media", "/leads", "/seo", "/settings", "/preview"].some(
      (allowed) => suffix === allowed || (allowed === "/editor" && suffix.startsWith("/editor/"))
    ) ? suffix : "";
    return `/dashboard/websites/${nextSiteId}${safeSuffix}`;
  }

  const websiteRows = (highlightSelected = false, close: () => void = () => setDrawerOpen(false)) => (
    <div className="grid gap-1">
      {sites.map((item) => (
        <Link key={item.id} href={switchHref(item.id)} onClick={close} className={`flex min-h-[66px] items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-canvas ${highlightSelected && item.id === site.id ? "bg-brand-50" : ""}`}>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 font-bold text-brand-700">{item.name.slice(0, 1).toUpperCase()}</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-ink">{item.name}</span><span className="mt-0.5 block truncate text-xs text-muted">{siteAddress(item)}</span></span>
          <span className="text-right"><span className="block text-xs font-bold text-brand-700">{siteStatus(item)}</span>{item.id === site.id ? <Check className="ml-auto mt-1" size={16} /> : null}</span>
        </Link>
      ))}
    </div>
  );

  return (
    <div data-site-workspace className="min-h-screen bg-canvas lg:grid lg:grid-cols-[244px_minmax(0,1fr)]">
      <aside className="hidden min-h-screen border-r border-line bg-white p-3 lg:flex lg:flex-col">
        <Link href="/dashboard" className="flex min-h-14 items-center gap-3 px-2 text-lg font-bold text-ink"><span className="flex size-9 items-center justify-center rounded-lg bg-brand-700 text-white">S</span>Studio OS</Link>
        <details className="group relative mt-3">
          <summary className="flex min-h-[68px] cursor-pointer list-none items-center gap-3 rounded-lg border border-line p-3 marker:hidden hover:bg-canvas">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-800 text-white"><LayoutTemplate size={19} /></span>
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-ink">{site.name}</span><span className="block text-xs text-muted">Switch website</span></span><ChevronDown size={16} />
          </summary>
          <div className="absolute left-0 top-[74px] z-50 w-[340px] rounded-xl border border-line bg-white p-3 shadow-xl">
            <p className="px-3 pb-2 text-xs font-bold uppercase tracking-widest text-muted">Your websites</p>{websiteRows(false)}
            <div className="mt-2 grid gap-2 border-t border-line pt-3"><Link href="/dashboard/websites/new" className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold text-brand-700 hover:bg-brand-50"><Plus size={17} />Create New Website</Link><Link href="/dashboard/websites" className="px-3 py-2 text-sm font-semibold text-muted hover:text-ink">View All Websites</Link></div>
          </div>
        </details>
        <nav className="mt-4 grid gap-1" aria-label="Website workspace">
          {nav.filter((item) => item.show).map((item) => {
            const active = item.label === "Overview" ? pathname === base : item.label === "Edit Website" ? pathname === item.href : pathname.startsWith(item.href);
            return <Link key={item.label} href={item.href} aria-disabled={item.locked} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold ${active ? "bg-brand-50 text-brand-800" : "text-muted hover:bg-canvas hover:text-ink"} ${item.locked ? "pointer-events-none opacity-55" : ""}`}><item.icon size={18} /><span className="flex-1">{item.label}</span>{item.label === "Website Style" ? <span className="flex -space-x-1">{palette.map((color) => <span key={color} className="size-3.5 rounded-full border-2 border-white" style={{ backgroundColor: color }} />)}</span> : null}{item.locked ? <Lock size={13} /> : null}</Link>;
          })}
        </nav>
        <div className="mt-4 border-t border-line pt-4"><p className="px-3 text-[11px] font-bold uppercase tracking-widest text-muted">More tools</p>{[
          ["AI Chatbot", Bot], ["Analytics", BarChart3], ["Custom Domain", Globe2], ["Team Access", Users]
        ].map(([label, Icon]) => <div key={label as string} className="flex min-h-10 items-center gap-3 px-3 text-sm text-muted opacity-55"><Icon size={17} /><span className="flex-1">{label as string}</span><Lock size={13} /></div>)}</div>
      </aside>

      <div className="min-w-0 pb-20 lg:pb-0">
        <header className="grid min-h-16 grid-cols-[44px_1fr_44px] items-center border-b border-line bg-white px-3 md:hidden">
          <button type="button" onClick={() => setDrawerOpen(true)} className="flex size-11 items-center justify-center rounded-lg text-ink" aria-label="Open menu"><Menu size={22} /></button>
          <Link href="/dashboard" className="justify-self-center text-base font-bold text-ink">Studio OS</Link>
          <button type="button" className="relative flex size-11 items-center justify-center rounded-lg text-ink" aria-label="Notifications"><Bell size={21} /><span className="absolute right-2.5 top-2.5 size-2 rounded-full border-2 border-white bg-brand-600" /></button>
        </header>
        <header className="hidden min-h-16 items-center justify-between border-b border-line bg-white px-4 md:flex lg:hidden"><Link href="/dashboard" className="font-bold text-ink">Studio OS</Link><button type="button" onClick={() => setTabletSwitcherOpen(true)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line px-3 text-sm font-semibold"><Menu size={18} />{site.name}</button></header>
        <main className="min-w-0 px-3 py-5 sm:px-5 lg:px-7">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-line bg-white px-1 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_24px_rgba(15,23,42,.08)] md:hidden" aria-label="Main navigation">
        <Link href="/dashboard" className="flex min-h-[64px] flex-col items-center justify-center gap-1 text-[10px] font-semibold text-muted"><Home size={21} />Home</Link>
        <Link href="/dashboard/websites" className="flex min-h-[64px] flex-col items-center justify-center gap-1 text-[10px] font-semibold text-brand-700"><Globe2 size={21} />Websites</Link>
        <Link href="/dashboard/websites/new" className="flex min-h-[64px] flex-col items-center justify-center gap-1 text-[10px] font-semibold text-brand-700" aria-label="Create Website"><span className="flex size-12 -translate-y-2 items-center justify-center rounded-full bg-brand-700 text-white shadow-lg"><Plus size={25} /></span><span className="-mt-2">Create</span></Link>
        <Link href="/dashboard/settings" className="flex min-h-[64px] flex-col items-center justify-center gap-1 text-[10px] font-semibold text-muted"><UserRound size={21} />Account</Link>
        <button type="button" onClick={() => setDrawerOpen(true)} className="flex min-h-[64px] flex-col items-center justify-center gap-1 text-[10px] font-semibold text-muted"><Menu size={21} />More</button>
      </nav>

      <nav className="fixed bottom-0 left-0 right-0 z-40 hidden grid-cols-5 border-t border-line bg-white px-1 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_24px_rgba(15,23,42,.08)] md:grid lg:hidden" aria-label="Website navigation">
        {mobileNav.map((item) => <Link key={item.label} href={item.href} className="flex min-h-[62px] flex-col items-center justify-center gap-1 text-[10px] font-semibold text-muted"><item.icon size={21} />{item.label}</Link>)}
        <button type="button" onClick={() => setTabletSwitcherOpen(true)} className="flex min-h-[62px] flex-col items-center justify-center gap-1 text-[10px] font-semibold text-muted"><Menu size={21} />More</button>
      </nav>

      {tabletSwitcherOpen ? <div className="fixed inset-0 z-[70] hidden items-end bg-ink/35 md:flex lg:hidden" role="dialog" aria-modal="true" aria-label="Switch Website"><button className="absolute inset-0" onClick={() => setTabletSwitcherOpen(false)} aria-label="Close" /><div className="relative z-10 max-h-[85svh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 pb-[calc(20px+env(safe-area-inset-bottom,0px))]"><div className="flex items-start justify-between"><div><h2 className="text-xl font-bold text-ink">Switch Website</h2><p className="mt-1 text-sm text-muted">Choose the website you want to manage.</p></div><button onClick={() => setTabletSwitcherOpen(false)} className="flex size-10 items-center justify-center rounded-lg border border-line" aria-label="Close"><X size={19} /></button></div><div className="mt-4">{websiteRows(false, () => setTabletSwitcherOpen(false))}</div><div className="mt-4 grid gap-2 border-t border-line pt-4"><Link href="/dashboard/websites/new" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-bold text-white"><Plus size={18} />Create New Website</Link><Link href="/dashboard/websites" className="inline-flex min-h-12 items-center justify-center text-sm font-bold text-brand-700">View All Websites</Link><div className="mt-2 grid grid-cols-2 gap-2">{nav.filter((item) => item.show && !item.locked && !["Overview","Edit Website","Photos & Images","Enquiries"].includes(item.label)).map((item) => <Link key={item.label} href={item.href} onClick={() => setTabletSwitcherOpen(false)} className="flex min-h-11 items-center gap-2 rounded-lg bg-canvas px-3 text-xs font-semibold text-ink"><item.icon size={16} />{item.label}</Link>)}</div></div></div></div> : null}

      <div className={`fixed inset-0 z-[70] md:hidden ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`} role="dialog" aria-modal="true" aria-label="Website menu" aria-hidden={!drawerOpen}>
        <button className={`absolute inset-0 bg-ink/45 transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setDrawerOpen(false)} aria-label="Close menu" />
        <aside
          className={`absolute inset-y-0 left-0 flex w-[85vw] max-w-[360px] flex-col overflow-hidden bg-[#fffefa] shadow-2xl transition-transform duration-300 ease-out ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
          onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
          onTouchEnd={(event) => { const endX = event.changedTouches[0]?.clientX; if (touchStartX.current !== null && endX !== undefined && touchStartX.current - endX > 55) setDrawerOpen(false); touchStartX.current = null; }}
        >
          <div className="flex min-h-20 items-center gap-3 border-b border-line px-4">
            <span className="flex size-11 items-center justify-center rounded-lg bg-brand-700 text-lg font-bold text-white">S</span>
            <span className="text-lg font-bold text-ink">Studio OS</span>
            <button onClick={() => setDrawerOpen(false)} className="ml-auto flex size-10 items-center justify-center rounded-lg text-ink" aria-label="Close menu"><X size={22} /></button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
            <button type="button" onClick={() => setWebsiteListOpen((open) => !open)} className="flex min-h-[72px] w-full items-center gap-3 rounded-xl border border-line bg-white px-3 text-left shadow-sm">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-800 font-bold text-white">{site.name.slice(0, 1).toUpperCase()}</span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-ink">{site.name}</span><span className="mt-1 block text-xs text-muted">Switch website</span></span>
              <ChevronDown className={`shrink-0 text-muted transition-transform ${websiteListOpen ? "rotate-180" : ""}`} size={18} />
            </button>
            {websiteListOpen ? <div className="mt-2 rounded-xl border border-line bg-white p-1 shadow-sm">{websiteRows(true)}<div className="grid gap-1 border-t border-line p-2"><Link href="/dashboard/websites/new" onClick={() => setDrawerOpen(false)} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-xs font-bold text-brand-700"><Plus size={16} />Create New Website</Link><Link href="/dashboard/websites" onClick={() => setDrawerOpen(false)} className="px-2 py-2 text-xs font-semibold text-muted">View All Websites</Link></div></div> : null}

            <p className="mt-5 px-3 text-[11px] font-bold uppercase tracking-widest text-muted">Main</p>
            <nav className="mt-2 grid gap-1" aria-label="Mobile website menu">
              {nav.filter((item) => item.show).map((item) => {
                const active = item.label === "Overview" ? pathname === base : item.label === "Edit Website" ? pathname === item.href : pathname.startsWith(item.href);
                const label = item.label === "Website Style" ? "Design" : item.label;
                return item.locked ? <div key={item.label} className="flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-muted opacity-60"><item.icon size={19} /><span className="flex-1">{label}</span><Lock size={14} /></div> : <Link key={item.label} href={item.href} onClick={() => setDrawerOpen(false)} className={`flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-semibold ${active ? "bg-brand-50 text-brand-800" : "text-ink hover:bg-canvas"}`}><item.icon size={19} /><span className="flex-1">{label}</span>{label === "Design" ? <span className="flex -space-x-1">{palette.map((color) => <span key={color} className="size-3.5 rounded-full border-2 border-white" style={{ backgroundColor: color }} />)}</span> : null}</Link>;
              })}
            </nav>

            <div className="my-4 border-t border-line" />
            <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-muted">More tools</p>
            <div className="mt-2 grid gap-1">
              {mobileTools.map(({ label, icon: Icon, locked }) => locked ? <div key={label} className="flex min-h-11 items-center gap-3 px-3 text-sm text-muted opacity-60"><Icon size={18} /><span className="flex-1">{label}</span><Lock size={14} /></div> : <Link key={label} href={`${base}/settings`} onClick={() => setDrawerOpen(false)} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-ink hover:bg-canvas"><Icon size={18} /><span className="flex-1">{label}</span></Link>)}
            </div>
          </div>

          <Link href="/dashboard/settings" onClick={() => setDrawerOpen(false)} className="flex min-h-[78px] items-center gap-3 border-t border-line bg-white px-4">
            {profile.avatarUrl ? <span className="size-11 shrink-0 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${profile.avatarUrl})` }} aria-hidden="true" /> : <span className="flex size-11 items-center justify-center rounded-full bg-brand-700 font-bold text-white">{profile.name.slice(0, 1).toUpperCase()}</span>}
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-ink">{profile.name}</span><span className="mt-0.5 block truncate text-xs text-muted">{profile.email}</span></span><ChevronRight size={18} className="text-muted" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
