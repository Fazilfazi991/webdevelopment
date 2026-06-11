import { AppShell } from "@/components/app-shell";
import { requireClientSites } from "@/lib/access-control";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  await requireClientSites();
  return (
    <AppShell mode="client" title="My Website" subtitle="Simple controls for your website, enquiries, and publishing.">
      {children}
    </AppShell>
  );
}
