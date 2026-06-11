import { defaultSiteTheme, type SiteThemeTokens } from "@/lib/site-renderer/theme-types";
import { loadSelectedTemplatePreview } from "@/lib/site-renderer/template-loader";
import { applyMediaOverridesToContent } from "@/lib/site-renderer/media-slots";
import type { TemplateSectionRecord } from "@/lib/site-renderer/template-types";
import type { SiteBusinessProfile, SiteMedia, SiteSectionOverride, SiteThemeOverride } from "@/lib/types";
import type { requireSiteSetup } from "@/lib/setup";

type Supabase = Awaited<ReturnType<typeof requireSiteSetup>>["supabase"];

export type EditorContext = {
  previewResult: Awaited<ReturnType<typeof loadSelectedTemplatePreview>>;
  businessProfile: SiteBusinessProfile | null;
  sectionOverrides: SiteSectionOverride[];
  themeOverride: SiteThemeOverride | null;
  media: SiteMedia[];
  canEdit: boolean;
};

export const fontPresetMap = {
  professional_sans: "Inter, Arial, sans-serif",
  modern_clean: "Arial, Helvetica, sans-serif",
  classic_corporate: "Georgia, 'Times New Roman', serif",
  friendly_local: "Verdana, Arial, sans-serif"
};

export function mergeObjects(base: unknown, override: unknown) {
  const safeBase = base && typeof base === "object" && !Array.isArray(base) ? base : {};
  const safeOverride = override && typeof override === "object" && !Array.isArray(override) ? override : {};
  return { ...safeBase, ...safeOverride };
}

export function applyThemeOverride(theme: SiteThemeTokens, override: SiteThemeOverride | null): SiteThemeTokens {
  if (!override) return theme;
  const radius = override.radius_preset === "minimal" ? "3px" : override.radius_preset === "rounded" ? "14px" : "8px";
  const buttonRadius = override.button_style === "square" ? "2px" : override.button_style === "pill" ? "999px" : radius;
  return {
    ...theme,
    colors: {
      ...theme.colors,
      primary: override.primary_color ?? theme.colors.primary,
      secondary: override.secondary_color ?? theme.colors.secondary,
      primaryDark: override.accent_color ?? theme.colors.primaryDark
    },
    fonts: {
      ...theme.fonts,
      heading: override.font_preset ? fontPresetMap[override.font_preset] : theme.fonts.heading,
      body: override.font_preset ? fontPresetMap[override.font_preset] : theme.fonts.body
    },
    radius: {
      card: radius,
      button: buttonRadius
    }
  };
}

export function mergeBusinessProfile(content: unknown, profile: SiteBusinessProfile | null) {
  if (!profile) return content;
  const patch: Record<string, string> = {};
  if (profile.company_name) patch.companyName = profile.company_name;
  if (profile.tagline) patch.tagline = profile.tagline;
  if (profile.phone) patch.phone = profile.phone;
  if (profile.whatsapp) patch.whatsapp = profile.whatsapp;
  if (profile.email) patch.email = profile.email;
  const location = [profile.city, profile.state_region, profile.country_code].filter(Boolean).join(", ");
  if (location) patch.location = location;
  if (profile.short_description) patch.body = profile.short_description;
  return mergeObjects(content, patch);
}

export function applyEditorMerges(context: EditorContext) {
  if (context.previewResult.status !== "ready") return context.previewResult;
  const overrides = new Map(context.sectionOverrides.map((override) => [override.template_section_id, override]));
  const preview = context.previewResult.preview;
  const sections = preview.sections
    .map((section) => {
      const override = overrides.get(section.id);
      const content = mergeObjects(
        applyMediaOverridesToContent(mergeBusinessProfile(section.default_content, context.businessProfile), section.section_key, context.media),
        override?.content_override
      );
      return {
        ...section,
        default_content: content,
        default_settings: mergeObjects(section.default_settings, override?.settings_override),
        display_order: override?.display_order ?? section.display_order,
        is_active: override ? override.is_enabled : section.is_active
      } satisfies TemplateSectionRecord;
    })
    .filter((section) => section.is_active)
    .sort((a, b) => a.page_slug.localeCompare(b.page_slug) || a.display_order - b.display_order);

  return {
    status: "ready" as const,
    preview: {
      ...preview,
      sections,
      theme: applyThemeOverride(preview.theme ?? defaultSiteTheme, context.themeOverride)
    }
  };
}

export async function refreshSignedMediaUrls(supabase: Supabase, media: SiteMedia[]) {
  return Promise.all(
    media.map(async (item) => {
      const { data } = await supabase.storage.from("site-media").createSignedUrl(item.storage_path, 60 * 15);
      return { ...item, signed_url: data?.signedUrl };
    })
  );
}

export async function loadEditorContext(supabase: Supabase, siteId: string, canEdit: boolean): Promise<EditorContext> {
  const [previewResult, profileResult, overridesResult, themeResult, mediaResult] = await Promise.all([
    loadSelectedTemplatePreview(supabase, siteId),
    supabase.from("site_business_profiles").select("*").eq("site_id", siteId).maybeSingle<SiteBusinessProfile>(),
    supabase.from("site_section_overrides").select("*").eq("site_id", siteId).returns<SiteSectionOverride[]>(),
    supabase.from("site_theme_overrides").select("*").eq("site_id", siteId).maybeSingle<SiteThemeOverride>(),
    supabase.from("site_media").select("*").eq("site_id", siteId).order("created_at", { ascending: false }).returns<SiteMedia[]>()
  ]);

  const media = await refreshSignedMediaUrls(supabase, mediaResult.data ?? []);

  return {
    previewResult,
    businessProfile: profileResult.data ?? null,
    sectionOverrides: overridesResult.data ?? [],
    themeOverride: themeResult.data ?? null,
    media,
    canEdit
  };
}
