import Link from "next/link";
import { chooseCategoryAction } from "@/app/setup-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { SetupProgress } from "@/components/setup/setup-progress";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { Field, inputClassName } from "@/components/ui/field";
import { getCategories, getIndustries, requireSiteSetup } from "@/lib/setup";

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: { siteId: string };
  searchParams: { error?: string; industry?: string; q?: string };
}) {
  const { site, supabase, selection } = await requireSiteSetup(params.siteId);
  const industries = await getIndustries(supabase);
  const industryId = searchParams.industry ?? selection?.industry_id ?? industries[0]?.id;
  const query = (searchParams.q ?? "").toLowerCase();
  const categories = (await getCategories(supabase, industryId)).filter((category) => !query || category.name.toLowerCase().includes(query));
  const industry = industries.find((item) => item.id === industryId);

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <SetupProgress siteId={site.id} currentStep="business_category" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-ink">Choose your business category</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{industry ? `Showing categories for ${industry.name}.` : "Select an industry first."}</p>
        </div>
        <Link href={`/dashboard/websites/${site.id}/setup/industry`} className="text-sm font-semibold text-brand-700">
          Change industry
        </Link>
      </div>
      <StatusMessage error={searchParams.error} />
      <form className="max-w-md">
        <input type="hidden" name="industry" value={industryId ?? ""} />
        <Field label="Search categories">
          <input className={inputClassName} name="q" defaultValue={searchParams.q ?? ""} placeholder="Search by category name" />
        </Field>
      </form>
      {categories.length ? (
        <div className="grid gap-3">
          {categories.map((category) => (
            <Card key={category.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-ink">{category.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">{category.description}</p>
                </div>
                <form action={chooseCategoryAction}>
                  <input type="hidden" name="siteId" value={site.id} />
                  <input type="hidden" name="categoryId" value={category.id} />
                  <Button type="submit" variant={selection?.business_category_id === category.id ? "primary" : "secondary"}>
                    {selection?.business_category_id === category.id ? "Selected" : "Select"}
                  </Button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No matching categories" description="Try a different search, or choose another industry." />
      )}
    </div>
  );
}
