import { AlertTriangle } from "lucide-react";
import { emptySettingsSchema, getSectionSchema } from "@/lib/site-renderer/section-schemas";
import type { TemplateSectionRecord } from "@/lib/site-renderer/template-types";
import { sectionRegistry } from "@/components/site-renderer/section-registry";

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

export function PageRenderer({ pageSlug, sections }: { pageSlug: string; sections: TemplateSectionRecord[] }) {
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

        return <Component key={section.id} content={content.data} settings={settings.success ? settings.data : {}} pageSlug={pageSlug} />;
      })}
    </>
  );
}
