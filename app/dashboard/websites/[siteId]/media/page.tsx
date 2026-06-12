import { ImagesTab } from "@/app/dashboard/websites/[siteId]/editor/tabs/images-tab";
import { hasPermission } from "@/lib/access-control";
import { loadEditorContext } from "@/lib/site-editor/editor-loader";
import { requireSiteSetup } from "@/lib/setup";

export default async function WebsiteMediaPage({ params }: { params: { siteId: string } }) {
  const setup = await requireSiteSetup(params.siteId);
  const canUpload = hasPermission(setup.siteAccess, "upload_media", setup.membershipRole);
  const context = await loadEditorContext(setup.supabase, setup.site.id, canUpload);
  return <div className="mx-auto max-w-6xl"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-widest text-brand-700">Website content</p><h1 className="mt-2 text-2xl font-bold text-ink">Photos & Logo</h1><p className="mt-1 text-sm text-muted">Update the branding and photos used on {setup.site.name}. Each image shows where it appears.</p></div><ImagesTab siteId={setup.site.id} organizationId={setup.organization.id} context={context} /></div>;
}
