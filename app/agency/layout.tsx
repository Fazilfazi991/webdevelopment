import { AppShell } from "@/components/app-shell";
import { requireAgencyContext } from "@/lib/access-control";

export default async function AgencyLayout({ children }: { children: React.ReactNode }) {
  const { agency } = await requireAgencyContext();
  return (
    <AppShell mode="agency" title={agency.name} subtitle="Manage your clients, websites, team, and handovers.">
      {children}
    </AppShell>
  );
}
