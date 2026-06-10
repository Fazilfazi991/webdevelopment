import type { SupabaseClient } from "@supabase/supabase-js";
import { defaultSiteTheme, type SiteThemeTokens } from "@/lib/site-renderer/theme-types";
import type { LoadedTemplatePreview, TemplateSectionRecord, TemplateThemePreset } from "@/lib/site-renderer/template-types";
import type { SiteTemplateSelection, Template, TemplatePage } from "@/lib/types";

function parseTheme(value: unknown): SiteThemeTokens {
  if (!value || typeof value !== "object") return defaultSiteTheme;
  const candidate = value as Partial<SiteThemeTokens>;
  return {
    ...defaultSiteTheme,
    ...candidate,
    colors: { ...defaultSiteTheme.colors, ...(candidate.colors ?? {}) },
    fonts: { ...defaultSiteTheme.fonts, ...(candidate.fonts ?? {}) },
    radius: { ...defaultSiteTheme.radius, ...(candidate.radius ?? {}) }
  };
}

export async function loadSelectedTemplatePreview(
  supabase: SupabaseClient,
  siteId: string
): Promise<
  | { status: "ready"; preview: LoadedTemplatePreview }
  | { status: "no-template" }
  | { status: "unconfigured"; template: Template | null; pages: TemplatePage[] }
> {
  const { data: selection } = await supabase
    .from("site_template_selections")
    .select("*")
    .eq("site_id", siteId)
    .maybeSingle<SiteTemplateSelection>();

  if (!selection?.template_id) return { status: "no-template" };

  const { data: template } = await supabase
    .from("templates")
    .select("*")
    .eq("id", selection.template_id)
    .eq("is_active", true)
    .maybeSingle<Template>();

  if (!template) return { status: "unconfigured", template: null, pages: [] };

  const { data: pages } = await supabase
    .from("template_pages")
    .select("*")
    .eq("template_id", template.id)
    .order("display_order", { ascending: true })
    .returns<TemplatePage[]>();

  const { data: sections } = await supabase
    .from("template_sections")
    .select("*, section_variants(*)")
    .eq("template_id", template.id)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .returns<TemplateSectionRecord[]>();

  if (!sections?.length) return { status: "unconfigured", template, pages: pages ?? [] };

  const { data: preset } = await supabase
    .from("template_theme_presets")
    .select("*")
    .eq("template_id", template.id)
    .eq("is_default", true)
    .maybeSingle<TemplateThemePreset>();

  return {
    status: "ready",
    preview: {
      template,
      pages: pages ?? [],
      sections,
      theme: parseTheme(preset?.theme_tokens),
      themePresetName: preset?.name ?? "Default"
    }
  };
}

export async function loadTemplatePreviewByTemplateId(
  supabase: SupabaseClient,
  templateId: string
): Promise<{ status: "ready"; preview: LoadedTemplatePreview } | { status: "unconfigured"; template: Template | null; pages: TemplatePage[] }> {
  const { data: template } = await supabase.from("templates").select("*").eq("id", templateId).eq("is_active", true).maybeSingle<Template>();
  if (!template) return { status: "unconfigured", template: null, pages: [] };

  const { data: pages } = await supabase
    .from("template_pages")
    .select("*")
    .eq("template_id", template.id)
    .order("display_order", { ascending: true })
    .returns<TemplatePage[]>();

  const { data: sections } = await supabase
    .from("template_sections")
    .select("*, section_variants(*)")
    .eq("template_id", template.id)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .returns<TemplateSectionRecord[]>();

  if (!sections?.length) return { status: "unconfigured", template, pages: pages ?? [] };

  const { data: preset } = await supabase
    .from("template_theme_presets")
    .select("*")
    .eq("template_id", template.id)
    .eq("is_default", true)
    .maybeSingle<TemplateThemePreset>();

  return {
    status: "ready",
    preview: {
      template,
      pages: pages ?? [],
      sections,
      theme: parseTheme(preset?.theme_tokens),
      themePresetName: preset?.name ?? "Default"
    }
  };
}

export function sectionsForPage(preview: LoadedTemplatePreview, pageSlug: string) {
  return preview.sections.filter((section) => section.page_slug === pageSlug);
}
