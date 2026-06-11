import { notFound } from "next/navigation";
import { applyEditorMerges, type EditorContext } from "@/lib/site-editor/editor-loader";
import { createClient } from "@/lib/supabase/server";
import type { LoadedTemplatePreview, TemplateSectionRecord } from "@/lib/site-renderer/template-types";
import type { Site, SiteVersion } from "@/lib/types";

export type PublicSitePayload = {
  site: Site;
  preview: LoadedTemplatePreview;
};

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? { ...(value as Record<string, unknown>) } : {};
}

function injectPublicFormMetadata(preview: LoadedTemplatePreview, site: Site, pageSlug: string, leadStatus?: string): LoadedTemplatePreview {
  const sections = preview.sections.map((section) => {
    if (section.section_key !== "contact-map-form") return section;
    return {
      ...section,
      default_content: {
        ...objectValue(section.default_content),
        siteId: site.id,
        organizationId: site.organization_id,
        returnPath: `/sites/${site.primary_subdomain}${pageSlug === "home" ? "" : `/${pageSlug}`}`,
        sourcePage: pageSlug,
        leadStatus
      }
    } satisfies TemplateSectionRecord;
  });

  return { ...preview, sections };
}

export async function loadPublicSite(subdomain: string, pageSlug = "home", leadStatus?: string): Promise<PublicSitePayload> {
  const supabase = createClient();
  const { data: site } = await supabase
    .from("sites")
    .select("*")
    .eq("primary_subdomain", subdomain)
    .eq("publication_status", "published")
    .neq("status", "suspended")
    .maybeSingle<Site>();

  if (!site?.last_published_version_id) notFound();

  const { data: version } = await supabase
    .from("site_versions")
    .select("*")
    .eq("id", site.last_published_version_id)
    .eq("site_id", site.id)
    .maybeSingle<SiteVersion>();

  const snapshot = version?.snapshot as EditorContext | undefined;
  if (!snapshot) notFound();

  const merged = applyEditorMerges({ ...snapshot, canEdit: false });
  if (merged.status !== "ready") notFound();

  const pageExists = merged.preview.pages.some((page) => page.page_slug === pageSlug) || pageSlug === "home";
  if (!pageExists) notFound();

  return {
    site,
    preview: injectPublicFormMetadata(merged.preview, site, pageSlug, leadStatus)
  };
}

export function publicSiteMetadata(site: Site) {
  const title = site.seo_title || site.og_title || site.name;
  const description = site.seo_description || site.og_description || undefined;
  return {
    title,
    description,
    robots: {
      index: site.robots_index,
      follow: site.robots_follow
    },
    openGraph: {
      title: site.og_title || title,
      description
    }
  };
}
