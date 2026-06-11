import LeadsPage from "@/app/dashboard/leads/page";

export default function SiteLeadsPage({ params, searchParams }: { params: { siteId: string }; searchParams: { status?: string } }) {
  return <LeadsPage searchParams={{ ...searchParams, siteId: params.siteId }} />;
}
