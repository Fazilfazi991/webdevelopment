import { saveTemplateAction } from "@/app/admin/admin-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { PreviewConcept } from "@/components/setup/preview-concept";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { Field, inputClassName } from "@/components/ui/field";
import { requireAdmin } from "@/lib/data";
import type { TemplateSectionRecord, TemplateThemePreset } from "@/lib/site-renderer/template-types";
import type { BusinessCategory, Template, TemplateCategory, TemplatePage } from "@/lib/types";

export default async function AdminTemplatesPage({ searchParams }: { searchParams: { error?: string; message?: string; edit?: string } }) {
  const { supabase } = await requireAdmin();
  const { data: templates } = await supabase.from("templates").select("*").order("display_order", { ascending: true }).returns<Template[]>();
  const { data: categories } = await supabase.from("business_categories").select("*").order("display_order", { ascending: true }).returns<BusinessCategory[]>();
  const templateIds = (templates ?? []).map((template) => template.id);
  const { data: mappings } = templateIds.length
    ? await supabase.from("template_categories").select("*").in("template_id", templateIds).returns<TemplateCategory[]>()
    : { data: [] as TemplateCategory[] };
  const { data: pages } = templateIds.length
    ? await supabase.from("template_pages").select("*").in("template_id", templateIds).order("display_order", { ascending: true }).returns<TemplatePage[]>()
    : { data: [] as TemplatePage[] };
  const { data: themePresets } = templateIds.length
    ? await supabase.from("template_theme_presets").select("*").in("template_id", templateIds).returns<TemplateThemePreset[]>()
    : { data: [] as TemplateThemePreset[] };
  const { data: sections } = templateIds.length
    ? await supabase
        .from("template_sections")
        .select("*, section_variants(*)")
        .in("template_id", templateIds)
        .order("page_slug", { ascending: true })
        .order("display_order", { ascending: true })
        .returns<TemplateSectionRecord[]>()
    : { data: [] as TemplateSectionRecord[] };
  const edit = templates?.find((template) => template.id === searchParams.edit);
  const selectedCategoryIds = mappings?.filter((mapping) => mapping.template_id === edit?.id).map((mapping) => mapping.business_category_id) ?? [];
  const editPages = pages?.filter((page) => page.template_id === edit?.id).map((page) => page.page_name).join("\n") ?? "Home\nServices\nContact";

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="p-5">
        <h2 className="text-lg font-bold text-ink">{edit ? "Edit template" : "Add template"}</h2>
        <form action={saveTemplateAction} className="mt-5 grid gap-4">
          <StatusMessage error={searchParams.error} message={searchParams.message} />
          <input type="hidden" name="id" value={edit?.id ?? ""} />
          <Field label="Name">
            <input className={inputClassName} name="name" defaultValue={edit?.name ?? ""} required />
          </Field>
          <Field label="Slug">
            <input className={inputClassName} name="slug" defaultValue={edit?.slug ?? ""} />
          </Field>
          <Field label="Short description">
            <textarea className={inputClassName} name="shortDescription" defaultValue={edit?.short_description ?? ""} rows={2} />
          </Field>
          <Field label="Long description">
            <textarea className={inputClassName} name="longDescription" defaultValue={edit?.long_description ?? ""} rows={3} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Style label">
              <input className={inputClassName} name="styleLabel" defaultValue={edit?.style_label ?? ""} />
            </Field>
            <Field label="Display order">
              <input className={inputClassName} name="displayOrder" type="number" defaultValue={edit?.display_order ?? 0} />
            </Field>
          </div>
          <Field label="Assign categories">
            <select className={inputClassName} name="categoryIds" multiple defaultValue={selectedCategoryIds} required>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Included pages">
            <textarea className={inputClassName} name="pages" defaultValue={editPages} rows={4} />
          </Field>
          <Field label="Thumbnail URL">
            <input className={inputClassName} name="thumbnailUrl" defaultValue={edit?.thumbnail_url ?? ""} />
          </Field>
          <Field label="Desktop preview URL">
            <input className={inputClassName} name="desktopPreviewUrl" defaultValue={edit?.desktop_preview_url ?? ""} />
          </Field>
          <Field label="Mobile preview URL">
            <input className={inputClassName} name="mobilePreviewUrl" defaultValue={edit?.mobile_preview_url ?? ""} />
          </Field>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-ink">
              <input type="checkbox" name="isFeatured" defaultChecked={edit?.is_featured ?? false} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-ink">
              <input type="checkbox" name="isActive" defaultChecked={edit?.is_active ?? true} />
              Active
            </label>
          </div>
          <Button type="submit">Save template</Button>
        </form>
      </Card>

      <div className="grid gap-4">
        {templates?.length ? (
          templates.map((template) => {
            const pageCount = pages?.filter((page) => page.template_id === template.id).length ?? 0;
            const categoryCount = mappings?.filter((mapping) => mapping.template_id === template.id).length ?? 0;
            const templatePages = pages?.filter((page) => page.template_id === template.id) ?? [];
            const templateSections = sections?.filter((section) => section.template_id === template.id) ?? [];
            const defaultPreset = themePresets?.find((preset) => preset.template_id === template.id && preset.is_default);
            const sectionCounts = templatePages.map((page) => ({
              page,
              sections: templateSections.filter((section) => section.page_slug === page.page_slug)
            }));
            return (
              <Card key={template.id} className="p-4">
                <PreviewConcept title={template.name} style={template.style_label} compact />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-ink">{template.name}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {template.style_label ?? "Style"} - {categoryCount} categories - {pageCount} pages - {template.is_active ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <a className="text-sm font-semibold text-brand-700" href={`/admin/templates?edit=${template.id}`}>
                    Edit
                  </a>
                </div>
                <div className="mt-4 grid gap-3 rounded-app bg-canvas p-3 text-sm">
                  <div>
                    <p className="font-semibold text-ink">Metadata</p>
                    <p className="mt-1 text-muted">/{template.slug} - {template.is_featured ? "Featured" : "Standard"} - {template.is_active ? "Active" : "Inactive"}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-ink">Assigned categories</p>
                    <p className="mt-1 text-muted">
                      {mappings
                        ?.filter((mapping) => mapping.template_id === template.id)
                        .map((mapping) => categories?.find((category) => category.id === mapping.business_category_id)?.name)
                        .filter(Boolean)
                        .join(", ") || "No categories assigned"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-ink">Theme preset</p>
                    <p className="mt-1 text-muted">{defaultPreset ? `${defaultPreset.name} (${defaultPreset.key})` : "No default preset"}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-ink">Seeded sections</p>
                    <div className="mt-2 grid gap-2">
                      {sectionCounts.length ? (
                        sectionCounts.map(({ page, sections: pageSections }) => (
                          <details key={page.id} className="rounded-app border border-line bg-white p-3">
                            <summary className="cursor-pointer font-semibold text-ink">
                              {page.page_name}: {pageSections.length} sections
                            </summary>
                            <ol className="mt-2 grid gap-1 text-muted">
                              {pageSections.map((section) => {
                                const variant = Array.isArray(section.section_variants) ? section.section_variants[0] : section.section_variants;
                                return (
                                  <li key={section.id}>
                                    {section.display_order}. {variant?.name ?? section.section_key} - {section.is_active ? "Active" : "Inactive"}
                                  </li>
                                );
                              })}
                            </ol>
                          </details>
                        ))
                      ) : (
                        <p className="text-muted">No seeded sections configured.</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <EmptyState title="No templates yet" description="Add templates and assign them to business categories." />
        )}
      </div>
    </div>
  );
}
