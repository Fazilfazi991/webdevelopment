import { Plus } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { requireDashboardContext } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const { profile, sites } = await requireDashboardContext();
  const draftCount = sites.filter((site) => site.status === "draft").length;
  const publishedCount = sites.filter((site) => site.status === "published").length;
  const recentSites = sites.slice(0, 4);

  return (
    <div className="grid gap-6">
      <section className="rounded-app border border-line bg-white p-5 shadow-soft">
        <p className="text-sm text-muted">Welcome back</p>
        <h2 className="mt-1 text-xl font-bold text-ink">{profile?.full_name ?? "Business owner"}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Your workspace is ready. Create a website, choose the right business category, and select a prepared design template.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Website projects", sites.length],
          ["Draft websites", draftCount],
          ["Published websites", publishedCount]
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-sm font-semibold text-muted">{label}</p>
            <p className="mt-3 text-3xl font-bold text-ink">{value}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ink">Recent websites</h2>
              <p className="mt-1 text-sm text-muted">Drafts and published projects in this organisation.</p>
            </div>
            <ButtonLink href="/dashboard/websites/new">
              <Plus size={16} />
              New website
            </ButtonLink>
          </div>
          <div className="mt-5 grid gap-3">
            {recentSites.length ? (
              recentSites.map((site) => (
                <div key={site.id} className="flex flex-wrap items-center justify-between gap-3 rounded-app border border-line p-4">
                  <div>
                    <p className="font-semibold text-ink">{site.name}</p>
                    <p className="mt-1 text-sm text-muted">/{site.slug} - Updated {formatDate(site.updated_at)}</p>
                  </div>
                  <StatusBadge status={site.status} />
                </div>
              ))
            ) : (
              <EmptyState
                title="No websites yet"
                description="Create your first draft website and follow a simple guided setup."
                action={<ButtonLink href="/dashboard/websites/new">Create website</ButtonLink>}
              />
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-bold text-ink">Getting started</h2>
          <div className="mt-4 grid gap-3">
            {[
              "Create your organisation",
              "Create your first website",
              "Choose your business category",
              "Select a design template",
              "Add your business details",
              "Preview and publish"
            ].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-app border border-line px-3 py-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                  {index + 1}
                </span>
                <span className="text-sm font-semibold text-ink">{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
