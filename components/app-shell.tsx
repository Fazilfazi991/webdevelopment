import Link from "next/link";
import { BarChart3, Bell, Bot, Building2, Globe2, LayoutDashboard, LogOut, Mail, Menu, Plus, Settings, Users } from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Nav link definitions ─────────────────────────────────────────────────────

const dashboardLinks = [
  { href: "/dashboard/websites", label: "My Websites", icon: Globe2 },
  { href: "/dashboard/leads", label: "All Leads", icon: Users },
  { href: "/dashboard/settings", label: "Account", icon: Settings }
];

const dashboardMobileLinks = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/websites", label: "Websites", icon: Globe2 },
  { href: "/dashboard/settings", label: "Account", icon: Users },
  { href: "/dashboard/settings", label: "More", icon: Settings }
];

const adminLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/websites", label: "Websites", icon: Globe2 },
  { href: "/admin/industries", label: "Industries", icon: Building2 },
  { href: "/admin/business-categories", label: "Categories", icon: BarChart3 },
  { href: "/admin/templates", label: "Templates", icon: LayoutDashboard },
  { href: "/admin/ai", label: "AI", icon: Bot },
  { href: "/admin/sections", label: "Sections", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/plans", label: "Plans", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings }
];

const agencyLinks = [
  { href: "/agency", label: "Overview", icon: LayoutDashboard },
  { href: "/agency/clients", label: "Clients", icon: Users },
  { href: "/agency/websites", label: "Websites", icon: Globe2 },
  { href: "/agency/team", label: "Team", icon: Building2 },
  { href: "/agency/invitations", label: "Invitations", icon: Mail },
  { href: "/agency/ai-usage", label: "AI Usage", icon: Bot },
  { href: "/agency/settings", label: "Settings", icon: Settings }
];

const clientLinks = [
  { href: "/client", label: "Home", icon: LayoutDashboard },
  { href: "/client/websites", label: "Websites", icon: Globe2 }
];

// ─── AppShell ─────────────────────────────────────────────────────────────────

export function AppShell({
  children,
  title,
  subtitle,
  mode = "dashboard"
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  mode?: "dashboard" | "admin" | "agency" | "client";
}) {
  const allLinks = mode === "admin" ? adminLinks : mode === "agency" ? agencyLinks : mode === "client" ? clientLinks : dashboardLinks;

  // On desktop, show all links in the sidebar.
  // On mobile bottom nav, show only the primary account-level tabs.
  const mobileNavLinks = mode === "dashboard" ? dashboardMobileLinks : allLinks.slice(0, 5);

  const homeHref = mode === "admin" ? "/admin" : mode === "agency" ? "/agency" : mode === "client" ? "/client" : "/dashboard";
  const mobileGridClass =
    mobileNavLinks.length === 5
      ? "grid-cols-5"
      : mobileNavLinks.length === 4
        ? "grid-cols-4"
        : mobileNavLinks.length === 3
          ? "grid-cols-3"
          : "grid-cols-2";

  return (
    <div className="app-shell min-h-[100svh] min-w-0 overflow-x-hidden bg-canvas lg:grid lg:grid-cols-[260px_1fr]">

      {/* ── Desktop sidebar (hidden on mobile) ─────────────────────────────── */}
      <aside className="app-shell-sidebar hidden lg:flex lg:min-h-screen lg:flex-col lg:border-r lg:border-line lg:bg-white">
        <div className="px-5 py-5">
          <Link href={homeHref} className="font-bold text-ink">
            Studio OS
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-3 pb-4">
          {allLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex w-full min-h-[44px] items-center gap-3 rounded-app px-3 text-sm font-semibold text-muted hover:bg-brand-50 hover:text-ink"
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-line p-3">
          <form action={logoutAction}>
            <Button variant="secondary" className="w-full justify-start">
              <LogOut size={16} />
              Log out
            </Button>
          </form>
        </div>
      </aside>

      {/* ── Main content area ───────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-col overflow-x-hidden">

        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
          <button className="inline-flex size-10 items-center justify-center rounded-xl text-ink" aria-label="Open menu">
            <Menu size={21} />
          </button>
          <Link href={homeHref} className="text-base font-bold text-ink">
            Studio OS
          </Link>
          <button className="inline-flex size-10 items-center justify-center rounded-xl text-ink" aria-label="Notifications">
            <Bell size={20} />
          </button>
        </header>

        {/* Desktop page header */}
        <header className="app-shell-desktop-header hidden border-b border-line bg-white px-8 py-5 lg:block">
          <div className="flex min-w-0 items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-bold text-ink">{title}</h1>
              {subtitle ? <p className="mt-1 text-sm leading-6 text-muted">{subtitle}</p> : null}
            </div>
            <form action={logoutAction}>
              <Button variant="secondary">
                <LogOut size={16} />
                Log out
              </Button>
            </form>
          </div>
        </header>

        {/* Mobile page title */}
        {title && mode !== "dashboard" && (
          <div className="border-b border-line bg-white px-4 pb-3 pt-4 lg:hidden">
            <h1 className="text-lg font-bold text-ink">{title}</h1>
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
        )}

        {/* Page content — pb-24 on mobile so content clears the bottom nav */}
        <main className="min-w-0 flex-1 px-3 py-5 pb-24 sm:px-4 md:px-8 lg:pb-5">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom navigation (hidden on desktop) ────────────────────── */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-xl border-t border-line bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm",
          "grid rounded-t-2xl px-2 pb-[env(safe-area-inset-bottom,0px)] lg:hidden",
          mobileGridClass
        )}
        aria-label="Main navigation"
      >
        {mobileNavLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 py-2 text-muted transition hover:text-brand-700"
          >
            <link.icon size={22} />
            <span className="text-[10px] font-semibold leading-none">{link.label}</span>
          </Link>
        ))}
        {mode === "dashboard" ? (
          <Link
            href="/dashboard/websites/new"
            className="absolute left-1/2 top-0 flex size-14 -translate-x-1/2 -translate-y-1/3 items-center justify-center rounded-full bg-brand-700 text-white shadow-soft transition hover:bg-brand-900"
            aria-label="Create website"
          >
            <Plus size={26} />
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
