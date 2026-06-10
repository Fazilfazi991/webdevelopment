import { AppShell } from "@/components/app-shell";
import { requireDashboardContext } from "@/lib/data";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { organization } = await requireDashboardContext();
  return (
    <AppShell title={organization.name} subtitle="Manage your websites, media, leads, and account settings.">
      {children}
    </AppShell>
  );
}
