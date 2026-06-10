import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireDashboardContext } from "@/lib/data";

export default async function SiteSetupPage({ params }: { params: { siteId: string } }) {
  const { sites } = await requireDashboardContext();
  const site = sites.find((item) => item.id === params.siteId);
  if (!site) redirect("/dashboard/websites");

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="p-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">Website setup</p>
        <h2 className="mt-3 text-2xl font-bold text-ink">{site.name}</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          This draft is ready. Industry selection, business categories, template cards, and preview flow will be added in Phase 2.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/dashboard/websites">Back to websites</ButtonLink>
          <ButtonLink href="/dashboard" variant="secondary">
            Dashboard overview
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
