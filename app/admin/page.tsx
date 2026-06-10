import { Card, EmptyState } from "@/components/ui/card";
import { requireAdmin } from "@/lib/data";

export default async function AdminPage() {
  const { supabase } = await requireAdmin();
  const [{ count: customers }, { count: organizations }, { count: websites }, { count: drafts }, { count: published }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("organizations").select("id", { count: "exact", head: true }),
    supabase.from("sites").select("id", { count: "exact", head: true }),
    supabase.from("sites").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("sites").select("id", { count: "exact", head: true }).eq("status", "published")
  ]);

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["Total customers", customers ?? 0],
          ["Organisations", organizations ?? 0],
          ["Total websites", websites ?? 0],
          ["Draft websites", drafts ?? 0],
          ["Published websites", published ?? 0]
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
