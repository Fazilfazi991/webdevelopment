import { redirect } from "next/navigation";
import { requireSiteSetup, setupPath } from "@/lib/setup";

export default async function SiteSetupPage({ params }: { params: { siteId: string } }) {
  const { site } = await requireSiteSetup(params.siteId);
  redirect(setupPath(site.id, site.setup_step ?? "website_type"));
}
