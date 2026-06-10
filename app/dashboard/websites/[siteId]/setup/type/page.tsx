import { chooseWebsiteTypeAction } from "@/app/setup-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { ComingSoonCard } from "@/components/setup/coming-soon-card";
import { SetupProgress } from "@/components/setup/setup-progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireSiteSetup } from "@/lib/setup";

export default async function WebsiteTypePage({ params, searchParams }: { params: { siteId: string }; searchParams: { error?: string } }) {
  const { site } = await requireSiteSetup(params.siteId);

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <SetupProgress siteId={site.id} currentStep="website_type" />
      <div>
        <h2 className="text-2xl font-bold text-ink">What kind of website do you need?</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Start with the package that matches your goal. More website types will be added later.</p>
      </div>
      <StatusMessage error={searchParams.error} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-brand-700 p-5">
          <h3 className="text-lg font-bold text-ink">Business Website</h3>
          <p className="mt-2 text-sm leading-6 text-muted">A complete professional website for services, credibility, and enquiries.</p>
          <form action={chooseWebsiteTypeAction} className="mt-5">
            <input type="hidden" name="siteId" value={site.id} />
            <input type="hidden" name="websiteType" value="business_website" />
            <Button type="submit">Continue</Button>
          </form>
        </Card>
        <ComingSoonCard title="Landing Page" />
        <ComingSoonCard title="Portfolio Website" />
        <ComingSoonCard title="E-commerce Website" />
      </div>
    </div>
  );
}
