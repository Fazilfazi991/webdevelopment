"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, Bot, Check, ChevronDown, FileText, Globe2, Home, ImageIcon,
  LayoutTemplate, Lock, Menu, MessageSquareText, Palette, Pencil, Plus,
  Search, Settings, Users, X
} from "lucide-react";
import type { Site } from "@/lib/types";

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
  children, site, sites, palette, permissions
}: {
  children: React.ReactNode;
  site: Site;
  sites: Site[];
  palette: string[];
  permissions: Permissions;
}) {
  const pathname = usePathname();
  const [mobileSwitcherOpen, setMobileSwitcherOpen] = useState(false);
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

  function switchHref(nextSiteId: string) {
    const suffix = pathname.slice(base.length);
    const safeSuffix = ["", "/editor", "/media", "/leads", "/seo", "/settings", "/preview"].some(
      (allowed) => suffix === allowed || (allowed === "/editor" && suffix.startsWith("/editor/"))
    ) ? suffix : "";
    return `/dashboard/websites/${nextSiteId}${safeSuffix}`;
  }

  const websiteRows = (
    <div className="grid gap-1">
      {sites.map((item) => (
        <Link key={item.id} href={switchHref(item.id)} onClick={() => setMobileSwitcherOpen(false)} className="flex min-h-[66px] items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-canvas">
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
            <p className="px-3 pb-2 text-xs font-bold uppercase tracking-widest text-muted">Your websites</p>{websiteRows}
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
        <header className="flex min-h-16 items-center justify-between border-b border-line bg-white px-4 lg:hidden"><Link href="/dashboard" className="font-bold text-ink">Studio OS</Link><button type="button" onClick={() => setMobileSwitcherOpen(true)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line px-3 text-sm font-semibold"><Menu size={18} />{site.name}</button></header>
        <main className="min-w-0 px-3 py-5 sm:px-5 lg:px-7">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-line bg-white px-1 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_24px_rgba(15,23,42,.08)] lg:hidden" aria-label="Website navigation">
        {mobileNav.map((item) => <Link key={item.label} href={item.href} className="flex min-h-[62px] flex-col items-center justify-center gap-1 text-[10px] font-semibold text-muted"><item.icon size={21} />{item.label}</Link>)}
        <button type="button" onClick={() => setMobileSwitcherOpen(true)} className="flex min-h-[62px] flex-col items-center justify-center gap-1 text-[10px] font-semibold text-muted"><Menu size={21} />More</button>
      </nav>

      {mobileSwitcherOpen ? <div className="fixed inset-0 z-[70] flex items-end bg-ink/35 lg:hidden" role="dialog" aria-modal="true" aria-label="Switch Website"><button className="absolute inset-0" onClick={() => setMobileSwitcherOpen(false)} aria-label="Close" /><div className="relative z-10 max-h-[85svh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 pb-[calc(20px+env(safe-area-inset-bottom,0px))]"><div className="flex items-start justify-between"><div><h2 className="text-xl font-bold text-ink">Switch Website</h2><p className="mt-1 text-sm text-muted">Choose the website you want to manage.</p></div><button onClick={() => setMobileSwitcherOpen(false)} className="flex size-10 items-center justify-center rounded-lg border border-line" aria-label="Close"><X size={19} /></button></div><div className="mt-4">{websiteRows}</div><div className="mt-4 grid gap-2 border-t border-line pt-4"><Link href="/dashboard/websites/new" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-bold text-white"><Plus size={18} />Create New Website</Link><Link href="/dashboard/websites" className="inline-flex min-h-12 items-center justify-center text-sm font-bold text-brand-700">View All Websites</Link><div className="mt-2 grid grid-cols-2 gap-2">{nav.filter((item) => item.show && !item.locked && !["Overview","Edit Website","Photos & Images","Enquiries"].includes(item.label)).map((item) => <Link key={item.label} href={item.href} onClick={() => setMobileSwitcherOpen(false)} className="flex min-h-11 items-center gap-2 rounded-lg bg-canvas px-3 text-xs font-semibold text-ink"><item.icon size={16} />{item.label}</Link>)}</div></div></div></div> : null}
    </div>
  );
}
