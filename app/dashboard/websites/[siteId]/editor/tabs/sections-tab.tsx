import { resetSectionAction, saveSectionStateAction } from "@/app/editor-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { inputClassName } from "@/components/ui/field";
import type { loadEditorContext } from "@/lib/site-editor/editor-loader";

export function SectionsTab({ siteId, context }: { siteId: string; context: Awaited<ReturnType<typeof loadEditorContext>> }) {
  const sections = context.previewResult.status === "ready" ? context.previewResult.preview.sections : [];
  const grouped = sections.reduce<Record<string, typeof sections>>((acc, section) => {
    acc[section.page_slug] = [...(acc[section.page_slug] ?? []), section];
    return acc;
  }, {});

  return (
    <div className="grid gap-4">
      {Object.entries(grouped).map(([pageSlug, pageSections]) => (
        <Card key={pageSlug} className="p-4">
          <h2 className="font-bold capitalize text-ink">{pageSlug} page</h2>
          <div className="mt-4 grid gap-3">
            {pageSections.map((section) => (
              <div key={section.id} className="rounded-app border border-line bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold capitalize text-ink">{section.section_key.replaceAll("-", " ")}</p>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted">{section.is_required ? "Required" : "Optional"}</p>
                  </div>
                  <form action={resetSectionAction} onSubmit={undefined}>
                    <input type="hidden" name="siteId" value={siteId} />
                    <input type="hidden" name="sectionId" value={section.id} />
                    <Button type="submit" variant="secondary" disabled={!context.canEdit}>Reset</Button>
                  </form>
                </div>
                <form action={saveSectionStateAction} className="mt-3 grid gap-2 sm:grid-cols-[1fr_90px_auto]">
                  <input type="hidden" name="siteId" value={siteId} />
                  <input type="hidden" name="sectionId" value={section.id} />
                  <input type="hidden" name="isRequired" value={String(section.is_required)} />
                  <select className={inputClassName} name="isEnabled" defaultValue={String(section.is_active)} disabled={!context.canEdit || section.is_required}>
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                  <input className={inputClassName} name="displayOrder" type="number" defaultValue={section.display_order} disabled={!context.canEdit} />
                  <Button type="submit" disabled={!context.canEdit}>Save</Button>
                </form>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
