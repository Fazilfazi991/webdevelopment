import { Card } from "@/components/ui/card";
import { requireAgencyContext } from "@/lib/access-control";

export default async function AgencySettingsPage() {
  const { agency } = await requireAgencyContext();
  return (
    <Card className="p-5">
      <h2 className="text-lg font-bold text-ink">Workspace settings</h2>
      <dl className="mt-4 grid gap-3 text-sm">
        <div><dt className="font-semibold text-muted">Name</dt><dd className="text-ink">{agency.name}</dd></div>
        <div><dt className="font-semibold text-muted">Slug</dt><dd className="text-ink">{agency.slug}</dd></div>
        <div><dt className="font-semibold text-muted">Support email</dt><dd className="text-ink">{agency.support_email ?? "Not set"}</dd></div>
      </dl>
    </Card>
  );
}
