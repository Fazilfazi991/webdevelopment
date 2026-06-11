import { WebsitePreviewShell } from "@/app/dashboard/websites/[siteId]/preview/preview-shell";

export default function ClientPreviewPage({ params, searchParams }: { params: { siteId: string }; searchParams: { device?: string } }) {
  return <WebsitePreviewShell siteId={params.siteId} device={searchParams.device} />;
}
