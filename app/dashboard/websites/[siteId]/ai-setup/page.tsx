import { AiSetupPage, ImageRequirementCard } from "@/app/ai-pages";

export default async function DashboardAiSetupRoute({
  params,
  searchParams
}: {
  params: { siteId: string };
  searchParams: { message?: string; error?: string };
}) {
  return (
    <div className="grid gap-5">
      <AiSetupPage siteId={params.siteId} searchParams={searchParams} />
      <ImageRequirementCard siteId={params.siteId} />
    </div>
  );
}
