import { EditorShell } from "@/app/dashboard/websites/[siteId]/editor/editor-shell";

export default async function WebsiteEditorPage({
  params,
  searchParams
}: {
  params: { siteId: string };
  searchParams: { message?: string; error?: string; device?: string; page?: string; section?: string };
}) {
  return <EditorShell siteId={params.siteId} activeTab="pages" searchParams={searchParams} />;
}
