import { WebsiteWorkspaceShell } from "@/components/website-workspace-shell";
import { hasPermission } from "@/lib/access-control";
import { requireSiteSetup } from "@/lib/setup";
import type { SiteThemeOverride } from "@/lib/types";

export default async function WebsiteLayout({ children, params }: { children: React.ReactNode; params: { siteId: string } }) {
  const setup = await requireSiteSetup(params.siteId);
  const { data: theme } = await setup.supabase.from("site_theme_overrides").select("*").eq("site_id", setup.site.id).maybeSingle<SiteThemeOverride>();
  return <WebsiteWorkspaceShell site={setup.site} sites={setup.sites} palette={[theme?.primary_color ?? "#176b55", theme?.secondary_color ?? "#0f3d35", theme?.accent_color ?? "#d7b98e"]} profile={{ name: setup.profile?.full_name || setup.profile?.email || "Studio OS User", email: setup.profile?.email || "", avatarUrl: setup.profile?.avatar_url || null }} permissions={{
    edit: hasPermission(setup.siteAccess, "edit_content", setup.membershipRole),
    design: hasPermission(setup.siteAccess, "edit_design", setup.membershipRole),
    media: hasPermission(setup.siteAccess, "upload_media", setup.membershipRole),
    leads: hasPermission(setup.siteAccess, "view_leads", setup.membershipRole),
    publish: hasPermission(setup.siteAccess, "publish_site", setup.membershipRole)
  }}>{children}</WebsiteWorkspaceShell>;
}
