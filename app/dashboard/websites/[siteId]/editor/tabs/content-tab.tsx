"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, ChevronRight, FileText, ImageIcon, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { saveSectionContentAction } from "@/app/editor-actions";
import { AiImproveButton } from "@/app/dashboard/websites/[siteId]/editor/tabs/ai-improve-button";
import { useLivePreview } from "@/components/site-editor/live-preview-context";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, inputClassName } from "@/components/ui/field";
import type { loadEditorContext } from "@/lib/site-editor/editor-loader";
import type { TemplateSectionRecord } from "@/lib/site-renderer/template-types";
import { defaultEditorPages, editorPageTitle, isDefaultEditorPageSlug, normaliseEditorPageSlug } from "@/lib/site-editor/page-structure";
import { customerSectionDescriptions, customerSectionLabel } from "@/lib/site-editor/section-labels";

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function SectionItemsEditor({
  siteId,
  section,
  onChange
}: {
  siteId: string;
  section: TemplateSectionRecord;
  onChange: (items: Array<Record<string, unknown>>) => void;
}) {
  const content = section.default_content as Record<string, unknown>;
  const kind = section.section_key;
  const [items, setItems] = useState<Array<Record<string, unknown>>>(() => Array.isArray(content.items) ? content.items as Array<Record<string, unknown>> : []);
  const isReview = kind === "testimonials-cards";
  const isFaq = kind === "faq-accordion";
  const isProject = kind === "project-gallery-grid";

  function update(index: number, key: string, value: string) {
    const next = items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item);
    setItems(next);
    onChange(next);
  }

  function add() {
    const item = isReview ? { name: "New customer", quote: "Add the customer review here." } : isFaq ? { question: "New question", answer: "Add the answer here." } : { title: "New item", body: "Add a short description." };
    const next = [...items, item];
    setItems(next);
    onChange(next);
  }

  function remove(index: number) {
    const next = items.filter((_, itemIndex) => itemIndex !== index);
    setItems(next);
    onChange(next);
  }

  return (
    <div className="grid gap-3">
      <input type="hidden" name="itemsJson" value={JSON.stringify(items)} />
      {items.map((item, index) => (
        <div key={index} className="rounded-xl bg-canvas p-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-ink">{isReview ? `Review ${index + 1}` : isFaq ? `Question ${index + 1}` : isProject ? `Project ${index + 1}` : `Card ${index + 1}`}</p>
            <button type="button" onClick={() => remove(index)} className="flex size-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-50 hover:text-danger active:scale-[0.96]" aria-label={`Remove item ${index + 1}`}><Trash2 size={16} /></button>
          </div>
          <div className="grid gap-3">
            <Field label={isReview ? "Customer name" : isFaq ? "Question" : isProject ? "Title (optional)" : "Title"}>
              <input className={inputClassName} value={text(item[isReview ? "name" : isFaq ? "question" : "title"])} onChange={(event) => update(index, isReview ? "name" : isFaq ? "question" : "title", event.target.value)} />
            </Field>
            <Field label={isReview ? "Review" : isFaq ? "Answer" : isProject ? "Caption (optional)" : "Short description"}>
              <textarea className={inputClassName} rows={3} value={text(item[isReview ? "quote" : isFaq ? "answer" : "body"] ?? item.description)} onChange={(event) => update(index, isReview ? "quote" : isFaq ? "answer" : "body", event.target.value)} />
            </Field>
            {isReview ? <Field label="Rating (optional)"><select className={inputClassName} value={text(item.context)} onChange={(event) => update(index, "context", event.target.value)}><option value="">No rating</option><option value="5 stars">5 stars</option><option value="4 stars">4 stars</option><option value="3 stars">3 stars</option></select></Field> : null}
            {isProject ? <ButtonLink href={`/dashboard/websites/${siteId}/editor/images`} variant="secondary" className="w-full"><ImageIcon size={16} />Change photo in Photos</ButtonLink> : null}
          </div>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={add} className="w-full"><Plus size={16} />Add {isReview ? "Review" : isFaq ? "Question" : isProject ? "Project" : "Service"}</Button>
    </div>
  );
}

function SectionEditor({ siteId, section, canEdit }: { siteId: string; section: TemplateSectionRecord; canEdit: boolean }) {
  const livePreview = useLivePreview();
  const content = section.default_content as Record<string, unknown>;
  const label = customerSectionLabel(section);
  const hasItems = Array.isArray(content.items);
  const hasImage = content.image && typeof content.image === "object";
  const image = hasImage ? content.image as Record<string, unknown> : null;
  const isHero = label === "Hero Banner";
  const [advanced, setAdvanced] = useState(false);

  function updatePreview(event: FormEvent<HTMLFormElement>) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (!target.name || target.type === "hidden") return;
    if (target.name === "primaryActionLabel" || target.name === "primaryActionHref") {
      const current = content.primaryAction && typeof content.primaryAction === "object" ? content.primaryAction as Record<string, unknown> : {};
      livePreview?.patchSection(section.id, { primaryAction: { ...current, [target.name === "primaryActionLabel" ? "label" : "href"]: target.value } });
    } else if (["eyebrow", "title", "body", "phone", "email", "location", "summary"].includes(target.name)) {
      livePreview?.patchSection(section.id, { [target.name]: target.value });
    }
  }

  return (
    <form id="section-editor-form" action={saveSectionContentAction} onInput={updatePreview} className="grid gap-4">
      <input type="hidden" name="siteId" value={siteId} />
      <input type="hidden" name="sectionId" value={section.id} />
      <input type="hidden" name="sectionKey" value={section.section_key} />
      <input type="hidden" name="returnPath" value={`/dashboard/websites/${siteId}/editor/pages?page=${section.page_slug}&section=${section.section_key}`} />

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Editing</p>
        <h2 className="mt-1 text-xl font-bold text-ink [text-wrap:balance]">{label}</h2>
        <p className="mt-1 text-sm text-muted [text-wrap:pretty]">{customerSectionDescriptions[label]}</p>
      </div>

      {content.eyebrow !== undefined ? <Field label="Small label"><input className={inputClassName} name="eyebrow" defaultValue={text(content.eyebrow)} disabled={!canEdit} /></Field> : null}
      {content.title !== undefined ? <><Field label={isHero ? "Main heading" : "Heading"}><input className={inputClassName} name="title" defaultValue={text(content.title)} maxLength={90} disabled={!canEdit} /></Field><AiImproveButton siteId={siteId} sectionKey={section.section_key} fieldKey="title" currentValue={text(content.title)} canEdit={canEdit} /></> : null}
      {content.body !== undefined ? <><Field label={label === "About Us" ? "Full text" : "Short description"}><textarea className={inputClassName} name="body" defaultValue={text(content.body)} rows={5} maxLength={800} disabled={!canEdit} /></Field><AiImproveButton siteId={siteId} sectionKey={section.section_key} fieldKey="body" currentValue={text(content.body)} canEdit={canEdit} /></> : null}

      {isHero ? <div className="grid gap-3 rounded-xl bg-canvas p-3"><Field label="Primary button text"><input className={inputClassName} name="primaryActionLabel" defaultValue={text((content.primaryAction as Record<string, unknown> | undefined)?.label)} /></Field><Field label="Primary button action"><select className={inputClassName} name="primaryActionHref" defaultValue={text((content.primaryAction as Record<string, unknown> | undefined)?.href)}><option value="/contact">Open Contact Form</option><option value="tel:">Call Phone Number</option><option value="https://wa.me/">Open WhatsApp</option><option value="/services">Go to Services</option><option value="/projects">Go to Projects</option>{advanced ? <option value="#custom">Custom Link</option> : null}</select></Field></div> : null}

      {hasImage ? <div className="rounded-xl bg-canvas p-3"><p className="mb-2 text-sm font-bold text-ink">Photo</p><div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-white outline outline-1 outline-black/10"><Image src={text(image?.src)} alt={text(image?.alt) || "Current section"} fill unoptimized className="object-cover" /></div><div className="mt-3 grid gap-2"><ButtonLink href={`/dashboard/websites/${siteId}/editor/images`} variant="secondary" className="w-full"><ImageIcon size={16} />Change Photo</ButtonLink><p className="text-center text-xs text-muted">Upload, choose from your gallery, or restore the design photo.</p></div><input type="hidden" name="imageSrc" value={text(image?.src)} /><input type="hidden" name="imageAlt" value={text(image?.alt) || `${label} photo`} /></div> : null}

      {hasItems ? <SectionItemsEditor siteId={siteId} section={section} onChange={(items) => livePreview?.patchSection(section.id, { items })} /> : null}
      {content.phone !== undefined ? <Field label="Phone"><input className={inputClassName} name="phone" defaultValue={text(content.phone)} /></Field> : null}
      {content.email !== undefined ? <Field label="Email"><input className={inputClassName} name="email" type="email" defaultValue={text(content.email)} /></Field> : null}
      {content.location !== undefined ? <Field label="Address"><textarea className={inputClassName} name="location" rows={3} defaultValue={text(content.location)} /></Field> : null}
      {content.summary !== undefined ? <Field label="Short description"><textarea className={inputClassName} name="body" rows={3} defaultValue={text(content.summary)} /></Field> : null}

      <button type="button" onClick={() => setAdvanced((value) => !value)} className="min-h-11 text-left text-sm font-bold text-brand-700">{advanced ? "Hide Advanced Settings" : "Need more control? Open Advanced Settings"}</button>
      {advanced ? <div className="grid gap-2 rounded-xl bg-canvas p-3 text-sm"><ButtonLink href={`/dashboard/websites/${siteId}/editor/sections`} variant="secondary" className="w-full">Section visibility, order, and reset</ButtonLink><ButtonLink href={`/dashboard/websites/${siteId}/design`} variant="secondary" className="w-full">Try another section layout</ButtonLink><ButtonLink href={`/dashboard/websites/${siteId}/seo`} variant="secondary" className="w-full">Google Search Setup</ButtonLink><ButtonLink href={`/dashboard/websites/${siteId}/settings/advanced`} variant="secondary" className="w-full">Version history</ButtonLink></div> : null}
      <Button type="submit" disabled={!canEdit} className="w-full">Save Section</Button>
    </form>
  );
}

export function ContentTab({ siteId, context, searchParams }: { siteId: string; context: Awaited<ReturnType<typeof loadEditorContext>>; searchParams?: { page?: string; section?: string } }) {
  const livePreview = useLivePreview();
  const initialQueryPage = isDefaultEditorPageSlug(searchParams?.page) ? searchParams.page : null;
  const [pageChosen, setPageChosen] = useState(Boolean(initialQueryPage));
  const sections = useMemo(() => context.previewResult.status === "ready" ? context.previewResult.preview.sections.filter((section) => !["header-topbar-standard", "header-clean", "floating-whatsapp"].includes(section.section_key)) : [], [context.previewResult]);
  const previewSelectedPage = livePreview?.currentPageSlug && livePreview.currentPageSlug !== "home";
  const selectedPageSlug = pageChosen || previewSelectedPage ? normaliseEditorPageSlug(livePreview?.currentPageSlug ?? initialQueryPage) : null;
  const initialSection = selectedPageSlug ? sections.find((section) => section.section_key === searchParams?.section && section.page_slug === selectedPageSlug) : undefined;

  useEffect(() => {
    if (initialSection && !livePreview?.selectedSectionId) livePreview?.selectSection(initialSection.id);
  }, [initialSection, livePreview]);

  useEffect(() => {
    if (initialQueryPage) setPageChosen(true);
  }, [initialQueryPage]);

  const pageSections = selectedPageSlug ? sections.filter((section) => section.page_slug === selectedPageSlug) : [];
  const selected = sections.find((section) => section.id === livePreview?.selectedSectionId && section.page_slug === selectedPageSlug) ?? initialSection;

  if (!selectedPageSlug) {
    return (
      <div className="grid gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink [text-wrap:balance]">Choose a page to update</h2>
          <p className="mt-1 text-sm text-muted [text-wrap:pretty]">Pick one page first, then choose the section you want to edit.</p>
        </div>
        <div className="grid gap-3">
          {defaultEditorPages.map((page) => (
            <button
              key={page.slug}
              type="button"
              onClick={() => {
                setPageChosen(true);
                livePreview?.selectPage(page.slug);
              }}
              className="group flex min-h-[72px] w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-[0_10px_30px_rgba(24,33,31,0.08),inset_0_0_0_1px_rgba(0,0,0,0.06)] transition-[box-shadow,transform,background-color] duration-150 hover:bg-canvas active:scale-[0.96]"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-800 transition-colors group-hover:bg-white"><FileText size={18} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-ink">{page.navLabel}</span>
                <span className="mt-0.5 block text-xs text-muted [text-wrap:pretty]">{page.description}</span>
              </span>
              <ChevronRight size={17} className="shrink-0 text-muted group-hover:text-brand-700" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div>
        <button type="button" onClick={() => { setPageChosen(false); livePreview?.selectPage("home"); window.history.replaceState(window.history.state, "", `/dashboard/websites/${siteId}/editor/pages`); }} className="mb-3 inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-bold text-brand-800 transition-colors hover:bg-brand-50 active:scale-[0.96]"><ArrowLeft size={16} />Back to pages</button>
        <h2 className="text-xl font-bold text-ink [text-wrap:balance]">Choose a section</h2>
        <p className="mt-1 text-sm text-muted [text-wrap:pretty]">{editorPageTitle(selectedPageSlug)} sections only. Choose one here or click it in the preview.</p>
      </div>
      <div className="max-h-64 overflow-y-auto rounded-xl bg-white shadow-[0_10px_30px_rgba(24,33,31,0.08),inset_0_0_0_1px_rgba(0,0,0,0.06)]">
        {pageSections.map((section) => { const active = selected?.id === section.id; const label = customerSectionLabel(section); return <button key={section.id} data-editor-list-section-id={section.id} type="button" onClick={() => livePreview?.selectSection(section.id)} className={`flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors active:bg-brand-50 ${active ? "bg-brand-50" : "hover:bg-canvas"}`}><span><span className="block text-sm font-bold text-ink">{label}</span><span className="mt-0.5 block text-xs text-muted">{customerSectionDescriptions[label]}</span></span><ChevronRight size={17} className={`shrink-0 ${active ? "text-brand-700" : "text-muted"}`} /></button>; })}
      </div>
      {selected ? <div className="border-t border-line pt-4"><SectionEditor key={selected.id} siteId={siteId} section={selected} canEdit={context.canEdit} /></div> : null}
    </div>
  );
}
