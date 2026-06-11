import { saveSectionContentAction } from "@/app/editor-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, inputClassName } from "@/components/ui/field";
import type { loadEditorContext } from "@/lib/site-editor/editor-loader";
import type { TemplateSectionRecord } from "@/lib/site-renderer/template-types";
import { AiImproveButton } from "@/app/dashboard/websites/[siteId]/editor/tabs/ai-improve-button";

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function sectionDisplayName(section: { section_key: string; default_content: unknown }) {
  const content = section.default_content as Record<string, unknown>;
  const title = text(content.title);
  const key = section.section_key;
  if (title) return title;
  // Humanise the key
  return key
    .replace(/^(header|footer)-/, "")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function pageDisplayName(slug: string) {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

/** Level 3 – single section field editor */
function SectionFieldEditor({
  siteId,
  section,
  canEdit
}: {
  siteId: string;
  section: TemplateSectionRecord;
  canEdit: boolean;
}) {
  const content = section.default_content as Record<string, unknown>;
  return (
    <form action={saveSectionContentAction} className="grid gap-3">
      <input type="hidden" name="siteId" value={siteId} />
      <input type="hidden" name="sectionId" value={section.id} />
      <input type="hidden" name="sectionKey" value={section.section_key} />

      {/* Eyebrow label */}
      <Field label="Section label">
        <input
          className={inputClassName}
          name="eyebrow"
          defaultValue={text(content.eyebrow)}
          maxLength={70}
          disabled={!canEdit}
        />
      </Field>

      {/* Heading + AI */}
      <Field label="Heading">
        <input
          className={inputClassName}
          name="title"
          defaultValue={text(content.title)}
          maxLength={70}
          disabled={!canEdit}
        />
      </Field>
      <AiImproveButton
        siteId={siteId}
        sectionKey={section.section_key}
        fieldKey="title"
        currentValue={text(content.title)}
        canEdit={canEdit}
      />

      {/* Body text + AI */}
      <Field label="Description">
        <textarea
          className={inputClassName}
          name="body"
          defaultValue={text(content.body)}
          rows={4}
          maxLength={240}
          disabled={!canEdit}
        />
      </Field>
      <AiImproveButton
        siteId={siteId}
        sectionKey={section.section_key}
        fieldKey="body"
        currentValue={text(content.body)}
        canEdit={canEdit}
      />

      {/* CTA */}
      <Field label="Primary button label and link">
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            className={inputClassName}
            name="primaryActionLabel"
            defaultValue={text((content.primaryAction as Record<string, unknown> | undefined)?.label)}
            maxLength={30}
            placeholder="Request a quote"
            disabled={!canEdit}
          />
          <input
            className={inputClassName}
            name="primaryActionHref"
            defaultValue={text((content.primaryAction as Record<string, unknown> | undefined)?.href)}
            placeholder="/contact"
            disabled={!canEdit}
          />
        </div>
      </Field>

      {/* Image path */}
      {(content.image !== undefined) && (
        <Field label="Image alt text">
          <input
            className={inputClassName}
            name="imageAlt"
            defaultValue={text((content.image as Record<string, unknown> | undefined)?.alt)}
            maxLength={180}
            placeholder="Describe this image for accessibility"
            disabled={!canEdit}
          />
        </Field>
      )}

      {/* Bullets */}
      {Array.isArray(content.bullets) && (
        <Field label="Highlights (one per line)">
          <textarea
            className={inputClassName}
            name="bullets"
            defaultValue={(content.bullets as string[]).join("\n")}
            rows={3}
            disabled={!canEdit}
          />
        </Field>
      )}

      {/* Items */}
      {Array.isArray(content.items) && (
        <Field label="Items (Title | Description, one per line)">
          <textarea
            className={inputClassName}
            name="items"
            rows={5}
            maxLength={1200}
            disabled={!canEdit}
            placeholder="AC Maintenance | Routine servicing and support."
            defaultValue={(content.items as Array<Record<string, string>>)
              .map((item) => `${item.title ?? ""}${item.description ? ` | ${item.description}` : ""}`)
              .join("\n")}
          />
        </Field>
      )}

      <Button type="submit" disabled={!canEdit}>
        Save section
      </Button>
    </form>
  );
}

/** Sections grouped by page slug */
type GroupedSections = Record<string, TemplateSectionRecord[]>;

const HIDDEN_SECTION_KEYS = ["header-topbar-standard", "footer-standard", "floating-whatsapp"];

export function ContentTab({
  siteId,
  context,
  searchParams
}: {
  siteId: string;
  context: Awaited<ReturnType<typeof loadEditorContext>>;
  searchParams?: { page?: string; section?: string };
}) {
  const allSections =
    context.previewResult.status === "ready"
      ? context.previewResult.preview.sections.filter(
          (s) => !HIDDEN_SECTION_KEYS.includes(s.section_key)
        )
      : [];

  // Pages in display order
  const pages = context.previewResult.status === "ready"
    ? [...new Map(
        context.previewResult.preview.pages.map((p) => [p.page_slug, p])
      ).values()].sort((a, b) => a.display_order - b.display_order)
    : [];

  const grouped: GroupedSections = allSections.reduce<GroupedSections>((acc, s) => {
    acc[s.page_slug] = [...(acc[s.page_slug] ?? []), s];
    return acc;
  }, {});

  const selectedPage = searchParams?.page;
  const selectedSectionKey = searchParams?.section;

  const editorBase = `/dashboard/websites/${siteId}/editor/pages`;

  // ── Level 3: Single section editor ──────────────────────────────────────
  if (selectedPage && selectedSectionKey) {
    const pageSections = grouped[selectedPage] ?? [];
    const section = pageSections.find((s) => s.section_key === selectedSectionKey);

    return (
      <div className="grid gap-4">
        {/* Back breadcrumb */}
        <nav className="flex items-center gap-1 text-sm" aria-label="Section breadcrumb">
          <a href={editorBase} className="text-muted hover:text-ink">Pages</a>
          <span className="text-muted">/</span>
          <a href={`${editorBase}?page=${selectedPage}`} className="text-muted hover:text-ink">
            {pageDisplayName(selectedPage)}
          </a>
          <span className="text-muted">/</span>
          <span className="font-semibold text-ink">{section ? sectionDisplayName(section) : selectedSectionKey}</span>
        </nav>

        {section ? (
          <Card className="p-4">
            <h3 className="mb-4 font-bold text-ink">{sectionDisplayName(section)}</h3>
            <SectionFieldEditor siteId={siteId} section={section} canEdit={context.canEdit} />
          </Card>
        ) : (
          <Card className="p-4">
            <p className="text-sm text-muted">Section not found. <a href={editorBase} className="font-semibold text-brand-700">Back to pages</a></p>
          </Card>
        )}
      </div>
    );
  }

  // ── Level 2: Sections list for a page ───────────────────────────────────
  if (selectedPage) {
    const pageSections = grouped[selectedPage] ?? [];

    return (
      <div className="grid gap-4">
        <nav className="flex items-center gap-1 text-sm" aria-label="Page breadcrumb">
          <a href={editorBase} className="text-muted hover:text-ink">Pages</a>
          <span className="text-muted">/</span>
          <span className="font-semibold text-ink">{pageDisplayName(selectedPage)}</span>
        </nav>

        <Card className="divide-y divide-line overflow-hidden p-0">
          {pageSections.length === 0 ? (
            <p className="p-4 text-sm text-muted">No editable sections on this page.</p>
          ) : (
            pageSections.map((section) => (
              <a
                key={section.id}
                href={`${editorBase}?page=${selectedPage}&section=${section.section_key}`}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-canvas"
              >
                <span>{sectionDisplayName(section)}</span>
                <svg className="text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </a>
            ))
          )}
        </Card>
      </div>
    );
  }

  // ── Level 1: Pages list ──────────────────────────────────────────────────
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted">Select a page to edit its sections.</p>
      <Card className="divide-y divide-line overflow-hidden p-0">
        {pages.length === 0 ? (
          <p className="p-4 text-sm text-muted">Choose a template to see pages.</p>
        ) : (
          pages.map((page) => {
            const count = (grouped[page.page_slug] ?? []).length;
            return (
              <a
                key={page.id}
                href={`${editorBase}?page=${page.page_slug}`}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-canvas"
              >
                <div>
                  <p className="font-semibold text-ink">{page.page_name}</p>
                  {count > 0 && (
                    <p className="text-xs text-muted">{count} section{count === 1 ? "" : "s"}</p>
                  )}
                </div>
                <svg className="text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </a>
            );
          })
        )}
      </Card>
    </div>
  );
}
