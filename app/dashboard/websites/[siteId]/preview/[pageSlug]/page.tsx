import { WebsitePreviewShell } from "@/app/dashboard/websites/[siteId]/preview/preview-shell";

export default async function WebsitePagePreviewPage({
  params,
  searchParams
}: {
  params: { siteId: string; pageSlug: string };
  searchParams: { device?: string };
}) {
  return <WebsitePreviewShell siteId={params.siteId} pageSlug={params.pageSlug} device={searchParams.device} />;
}
