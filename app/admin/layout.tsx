import { AppShell } from "@/components/app-shell";
import { requireAdmin } from "@/lib/data";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <AppShell mode="admin" title="Platform Admin" subtitle="Internal shell for managing customers, templates, and platform settings.">
      {children}
    </AppShell>
  );
}
