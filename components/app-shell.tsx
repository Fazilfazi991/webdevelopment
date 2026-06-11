import Link from "next/link";
import { BarChart3, Bot, Building2, FileImage, Globe2, LayoutDashboard, LogOut, Mail, Settings, Users } from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const dashboardLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/websites", label: "My Websites", icon: Globe2 },
  { href: "/dashboard/media", label: "Media Library", icon: FileImage },
  { href: "/dashboard/leads", label: "Leads", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

const adminLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/websites", label: "Websites", icon: Globe2 },
  { href: "/admin/industries", label: "Industries", icon: Building2 },
  { href: "/admin/business-categories", label: "Business Categories", icon: BarChart3 },
  { href: "/admin/templates", label: "Templates", icon: LayoutDashboard },
  { href: "/admin/ai", label: "AI", icon: Bot },
  { href: "/admin/sections", label: "Section Library", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/plans", label: "Plans", icon: BarChart3 },
  { href: "/admin/settings", label: "Platform Settings", icon: Settings }
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
  { href: "/client", label: "My Website", icon: Globe2 },
  { href: "/client/websites", label: "Websites", icon: LayoutDashboard }
];

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
  const links = mode === "admin" ? adminLinks : mode === "agency" ? agencyLinks : mode === "client" ? clientLinks : dashboardLinks;
  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-canvas lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-line bg-white lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-4 lg:block lg:px-5">
          <Link href={mode === "admin" ? "/admin" : mode === "agency" ? "/agency" : mode === "client" ? "/client" : "/dashboard"} className="font-bold text-ink">
            Studio OS
          </Link>
          <form action={logoutAction} className="lg:hidden">
            <Button variant="ghost" className="min-h-9 px-2" aria-label="Log out">
              <LogOut size={18} />
            </Button>
          </form>
        </div>
        <nav className="flex max-w-full gap-2 overflow-x-auto px-4 pb-4 lg:grid lg:px-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex min-h-10 shrink-0 items-center gap-3 rounded-app px-3 text-sm font-semibold text-muted hover:bg-brand-50 hover:text-ink",
                "lg:w-full"
              )}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 overflow-x-hidden">
        <header className="border-b border-line bg-white px-4 py-5 md:px-8">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-bold text-ink">{title}</h1>
              {subtitle ? <p className="mt-1 text-sm leading-6 text-muted">{subtitle}</p> : null}
            </div>
            <form action={logoutAction} className="hidden lg:block">
              <Button variant="secondary">
                <LogOut size={16} />
                Log out
              </Button>
            </form>
          </div>
        </header>
        <main className="min-w-0 px-3 py-5 sm:px-4 md:px-8">{children}</main>
      </div>
    </div>
  );
}
