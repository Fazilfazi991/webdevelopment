import Link from "next/link";
import { BarChart3, Building2, FileImage, Globe2, LayoutDashboard, LogOut, Settings, Users } from "lucide-react";
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
  { href: "/admin/sections", label: "Section Library", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/plans", label: "Plans", icon: BarChart3 },
  { href: "/admin/settings", label: "Platform Settings", icon: Settings }
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
  mode?: "dashboard" | "admin";
}) {
  const links = mode === "dashboard" ? dashboardLinks : adminLinks;
  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-line bg-white lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-4 lg:block lg:px-5">
          <Link href={mode === "admin" ? "/admin" : "/dashboard"} className="font-bold text-ink">
            Studio OS
          </Link>
          <form action={logoutAction} className="lg:hidden">
            <Button variant="ghost" className="min-h-9 px-2" aria-label="Log out">
              <LogOut size={18} />
            </Button>
          </form>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:grid lg:px-3">
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
      <div className="min-w-0">
        <header className="border-b border-line bg-white px-4 py-5 md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ink">{title}</h1>
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
        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
