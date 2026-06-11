import { requireDashboardContext } from "@/lib/data";
import { MobileOnboardingWizard } from "@/components/onboarding/mobile-onboarding-wizard";

export default async function NewWebsitePage({ searchParams }: { searchParams: { error?: string } }) {
  // Ensure user is authenticated and has an organisation
  await requireDashboardContext();

  return (
    <div className="-mx-3 -mt-5 sm:-mx-4 md:-mx-8">
      <MobileOnboardingWizard error={searchParams.error} />
    </div>
  );
}
