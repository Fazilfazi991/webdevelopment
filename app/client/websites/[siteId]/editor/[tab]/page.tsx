import { EditorShell } from "@/app/dashboard/websites/[siteId]/editor/editor-shell";

export default function ClientWebsiteEditorTabPage({
  params,
  searchParams
}: {
  params: { siteId: string; tab: string };
  searchParams: { message?: string; error?: string; device?: string };
}) {
  return <EditorShell siteId={params.siteId} activeTab={params.tab} searchParams={searchParams} />;
}
