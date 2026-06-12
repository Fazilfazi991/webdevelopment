import { AlertTriangle, Pencil } from "lucide-react";
import type { ReactNode } from "react";
import { emptySettingsSchema, getSectionSchema } from "@/lib/site-renderer/section-schemas";
import type { SectionComponentProps, TemplateSectionRecord } from "@/lib/site-renderer/template-types";
import { sectionRegistry } from "@/components/site-renderer/section-registry";
import { customerSectionLabel } from "@/lib/site-editor/section-labels";

function getVariantKey(section: TemplateSectionRecord) {
  const variant = Array.isArray(section.section_variants) ? section.section_variants[0] : section.section_variants;
  return variant?.key ?? section.section_key;
}

function SectionFallback({ title, detail }: { title: string; detail: string }) {
  return (
    <section className="mx-auto max-w-5xl px-5 py-8">
      <div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-950">
        <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-bold">{title}</h2>
          <p className="mt-1 text-sm">{detail}</p>
        </div>
      </div>
    </section>
  );
}

export function PageRenderer({
  pageSlug,
  sections,
  editor
}: {
  pageSlug: string;
  sections: TemplateSectionRecord[];
  editor?: { selectedSectionId?: string; onSelectSection: (sectionId: string) => void };
}) {
  if (!sections.length) {
    return <SectionFallback title="No sections configured" detail="This template page does not have active seeded sections yet." />;
  }

  return (
    <>
      {sections.map((section) => {
        const key = getVariantKey(section);
        const Component = sectionRegistry[key];
        const schema = getSectionSchema(key);
        if (!Component || !schema) {
          return <SectionFallback key={section.id} title="Section unavailable" detail={`No renderer is registered for "${key}".`} />;
        }

        const content = schema.safeParse(section.default_content);
        const settings = emptySettingsSchema.safeParse(section.default_settings);
        if (!content.success) {
          return <SectionFallback key={section.id} title="Section content unavailable" detail={`The content for "${key}" needs a schema update.`} />;
        }

        try {
          const rendered = (Component as (props: SectionComponentProps) => ReactNode)({
            content: content.data,
            settings: settings.success ? settings.data : {},
            pageSlug
          });
          if (!editor || section.section_key === "floating-whatsapp") return <div key={section.id}>{rendered}</div>;
          const selected = editor.selectedSectionId === section.id;
          return (
            <div
              key={section.id}
              data-editor-section-id={section.id}
              data-editor-section={section.section_key}
              data-section-type={section.section_variants && !Array.isArray(section.section_variants) ? section.section_variants.section_type : section.section_key}
              data-editable-fields="content"
              className={`group/editor relative cursor-pointer outline outline-2 outline-offset-[-2px] transition-[outline-color,box-shadow] duration-150 ${selected ? "z-10 outline-brand-600 shadow-[inset_0_0_0_1px_rgba(15,118,110,0.2)]" : "outline-transparent hover:outline-brand-400"}`}
              onClick={(event) => { event.preventDefault(); event.stopPropagation(); editor.onSelectSection(section.id); }}
            >
              <button
                type="button"
                className={`absolute left-3 top-3 z-20 flex min-h-10 items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-ink shadow-[0_8px_24px_rgba(24,33,31,0.18)] transition-[opacity,transform] duration-150 active:scale-[0.96] ${selected ? "opacity-100" : "opacity-0 group-hover/editor:opacity-100 group-focus-within/editor:opacity-100"}`}
                aria-label={`Edit ${customerSectionLabel(section)}`}
              >
                <Pencil size={14} aria-hidden="true" />
                {customerSectionLabel(section)}
                <span className="text-brand-700">Edit</span>
              </button>
              {rendered}
            </div>
          );
        } catch (error) {
          console.error("Section renderer failed", { sectionId: section.id, key, error });
          return <SectionFallback key={section.id} title="Section could not be displayed" detail="This section has been skipped so the rest of the preview can load." />;
        }
      })}
    </>
  );
}
