import { AppShell } from "@/components/app-shell";
import { requireDashboardContext } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { organization } = await requireDashboardContext();
  return (
    <AppShell title={organization.name} subtitle="Manage your websites, media, leads, and account settings.">
      {children}
    </AppShell>
  );
}
