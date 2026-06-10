import { Card, EmptyState } from "@/components/ui/card";
import { requireAdmin } from "@/lib/data";

export default async function AdminPage() {
  const { state } = await requireAdmin();
  const customers = state.profile ? 1 : 0;
  const organizations = state.organization ? 1 : 0;
  const websites = state.sites.length;
  const drafts = state.sites.filter((site) => site.status === "draft").length;
  const published = state.sites.filter((site) => site.status === "published").length;

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["Total customers", customers],
          ["Organisations", organizations],
          ["Total websites", websites],
          ["Draft websites", drafts],
          ["Published websites", published]
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-sm font-semibold text-muted">{label}</p>
            <p className="mt-3 text-3xl font-bold text-ink">{value}</p>
          </Card>
        ))}
      </section>
      <EmptyState
        title="Admin management tools are coming later"
        description="This protected shell prepares for industries, business categories, templates, section library, customers, websites, plans, and platform settings."
      />
    </div>
  );
}
