import { SiteRenderer } from "@/components/site-renderer/site-renderer";
import { loadPublicSite, publicSiteMetadata } from "@/lib/publishing/public-loader";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { subdomain: string } }) {
  const { site, metadataAssets } = await loadPublicSite(params.subdomain);
  return publicSiteMetadata(site, metadataAssets);
}

export default async function PublicSiteHomePage({
  params,
  searchParams
}: {
  params: { subdomain: string };
  searchParams: { lead?: string };
}) {
  const { preview } = await loadPublicSite(params.subdomain, "home", searchParams.lead);
  return <SiteRenderer preview={preview} pageSlug="home" />;
}
