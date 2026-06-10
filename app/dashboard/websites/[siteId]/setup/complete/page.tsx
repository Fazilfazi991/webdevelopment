import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SetupProgress } from "@/components/setup/setup-progress";
import { requireSiteSetup } from "@/lib/setup";

export default async function CompletePage({ params }: { params: { siteId: string } }) {
  const { site, selection } = await requireSiteSetup(params.siteId);

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <SetupProgress siteId={site.id} currentStep="template_selected" />
      <Card className="p-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">Design selected</p>
        <h2 className="mt-3 text-2xl font-bold text-ink">Your website design is selected.</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Next, you will add your business details and customise your website content.
        </p>
        {!selection ? <p className="mt-4 text-sm font-semibold text-danger">Select a template before continuing.</p> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href={`/dashboard/websites/${site.id}/setup/content`}>
            Continue to Website Setup
            <ArrowRight size={16} />
          </ButtonLink>
          <ButtonLink href={`/dashboard/websites/${site.id}/setup/templates`} variant="secondary">
            Change template
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
