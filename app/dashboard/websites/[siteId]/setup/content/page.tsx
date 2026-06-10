import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireSiteSetup } from "@/lib/setup";

export default async function ContentPlaceholderPage({ params }: { params: { siteId: string } }) {
  const { site } = await requireSiteSetup(params.siteId);

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-ink">Business details come next</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          The next step will collect your services, images, contact details, and approved content settings.
        </p>
        <div className="mt-6">
          <ButtonLink href={`/dashboard/websites/${site.id}/setup/complete`} variant="secondary">
            Back to selected design
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
