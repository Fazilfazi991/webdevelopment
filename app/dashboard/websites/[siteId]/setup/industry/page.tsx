import { Building2, HardHat, Utensils } from "lucide-react";
import { chooseIndustryAction } from "@/app/setup-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { SetupProgress } from "@/components/setup/setup-progress";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { getCategories, getIndustries, requireSiteSetup } from "@/lib/setup";

function Icon({ name }: { name?: string | null }) {
  if (name === "hard-hat") return <HardHat size={22} />;
  if (name === "utensils") return <Utensils size={22} />;
  return <Building2 size={22} />;
}

export default async function IndustryPage({ params, searchParams }: { params: { siteId: string }; searchParams: { error?: string } }) {
  const { site, supabase } = await requireSiteSetup(params.siteId);
  const industries = await getIndustries(supabase);
  const categories = await getCategories(supabase);

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <SetupProgress siteId={site.id} currentStep="industry" />
      <div>
        <h2 className="text-2xl font-bold text-ink">Choose your industry</h2>
        <p className="mt-2 text-sm leading-6 text-muted">This helps us show business categories and designs that fit your work.</p>
      </div>
      <StatusMessage error={searchParams.error} />
      {industries.length ? (
        <div className="grid gap-4 md:grid-cols-3">
          {industries.map((industry) => {
            const count = categories.filter((category) => category.industry_id === industry.id).length;
            return (
              <Card key={industry.id} className="p-5">
                <div className="flex size-11 items-center justify-center rounded-app bg-brand-50 text-brand-700">
                  <Icon name={industry.icon_name} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink">{industry.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-muted">{industry.description}</p>
                <p className="mt-3 text-sm font-semibold text-muted">{count} categories available</p>
                <form action={chooseIndustryAction} className="mt-5">
                  <input type="hidden" name="siteId" value={site.id} />
                  <input type="hidden" name="industryId" value={industry.id} />
                  <Button type="submit" variant="secondary" className="w-full">
                    Select industry
                  </Button>
                </form>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No industries available" description="A platform admin needs to add active industries before customers can continue." />
      )}
    </div>
  );
}
