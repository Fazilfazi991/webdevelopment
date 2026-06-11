import { Card } from "@/components/ui/card";
import { NewWebsiteForm } from "@/app/dashboard/websites/new/new-website-form";
import { countries, languages } from "@/lib/constants";
import { requireDashboardContext } from "@/lib/data";

export default async function NewWebsitePage({ searchParams }: { searchParams: { error?: string } }) {
  const { organization } = await requireDashboardContext();

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="text-xl font-bold text-ink">Tell us about your business</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        We will prepare a website that matches your business category.
      </p>
      <Card className="mt-5 p-6">
        <NewWebsiteForm error={searchParams.error} countries={countries} languages={languages} defaultCountry={organization.country_code} />
      </Card>
    </div>
  );
}
