import { resetSectionAction, saveSectionStateAction } from "@/app/editor-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { inputClassName } from "@/components/ui/field";
import type { loadEditorContext } from "@/lib/site-editor/editor-loader";
import { customerSectionLabel } from "@/lib/site-editor/section-labels";

export function SectionsTab({
  siteId,
  context
}: {
  siteId: string;
  context: Awaited<ReturnType<typeof loadEditorContext>>;
}) {
  const allSections =
    context.previewResult.status === "ready" ? context.previewResult.preview.sections : [];

  // Group by page, preserve order
  const pageOrder: string[] =
    context.previewResult.status === "ready"
      ? [...new Set(context.previewResult.preview.pages.map((p) => p.page_slug))]
      : [];

  const grouped = allSections.reduce<Record<string, typeof allSections>>((acc, section) => {
    acc[section.page_slug] = [...(acc[section.page_slug] ?? []), section];
    return acc;
  }, {});

  const pages = pageOrder.length > 0
    ? pageOrder
    : Object.keys(grouped);

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted">
        Enable or disable optional sections. Required sections cannot be turned off.
      </p>
      {pages.map((pageSlug) => {
        const pageSections = grouped[pageSlug] ?? [];
        return (
          <Card key={pageSlug} className="overflow-hidden p-0">
            <h2 className="border-b border-line bg-canvas px-4 py-2 text-sm font-bold capitalize text-ink">
              {pageSlug} page
            </h2>
            <div className="divide-y divide-line">
              {pageSections.map((section) => {
                const isRequired = section.is_required;
                return (
                  <div key={section.id} className="grid gap-2 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-ink">{customerSectionLabel(section)}</p>
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                          {isRequired ? "Required" : "Optional"}
                        </p>
                      </div>
                      <form action={resetSectionAction}>
                        <input type="hidden" name="siteId" value={siteId} />
                        <input type="hidden" name="sectionId" value={section.id} />
                        <Button
                          type="submit"
                          variant="secondary"
                          className="min-h-8 px-2 py-1 text-xs"
                          disabled={!context.canEdit}
                        >
                          Reset
                        </Button>
                      </form>
                    </div>

                    <form
                      action={saveSectionStateAction}
                      className="grid gap-2 sm:grid-cols-[1fr_80px_auto]"
                    >
                      <input type="hidden" name="siteId" value={siteId} />
                      <input type="hidden" name="sectionId" value={section.id} />
                      <input type="hidden" name="isRequired" value={String(isRequired)} />

                      <select
                        className={inputClassName}
                        name="isEnabled"
                        defaultValue={String(section.is_active)}
                        disabled={!context.canEdit || isRequired}
                        aria-label={`Enable or disable ${customerSectionLabel(section)}`}
                      >
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                      </select>

                      <input
                        className={inputClassName}
                        name="displayOrder"
                        type="number"
                        defaultValue={section.display_order}
                        disabled={!context.canEdit}
                        aria-label="Display order"
                      />

                      <Button type="submit" disabled={!context.canEdit}>
                        Save
                      </Button>
                    </form>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
