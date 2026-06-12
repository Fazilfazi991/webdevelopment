import { SiteRenderer } from "@/components/site-renderer/site-renderer";
import { loadPublicSite, publicSiteMetadata } from "@/lib/publishing/public-loader";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { subdomain: string; pageSlug: string } }) {
  const { site, metadataAssets } = await loadPublicSite(params.subdomain, params.pageSlug);
  return publicSiteMetadata(site, metadataAssets);
}

export default async function PublicSitePage({
  params,
  searchParams
}: {
  params: { subdomain: string; pageSlug: string };
  searchParams: { lead?: string };
}) {
  const { preview } = await loadPublicSite(params.subdomain, params.pageSlug, searchParams.lead);
  return <SiteRenderer preview={preview} pageSlug={params.pageSlug} />;
}
