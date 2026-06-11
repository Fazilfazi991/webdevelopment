import { saveBusinessProfileAction, saveSectionContentAction } from "@/app/editor-actions";
import { EditorAiTools } from "@/app/ai-pages";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, inputClassName } from "@/components/ui/field";
import type { loadEditorContext } from "@/lib/site-editor/editor-loader";
import type { TemplateSectionRecord } from "@/lib/site-renderer/template-types";

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function sectionTitle(section: { section_key: string; default_content: unknown }) {
  const content = section.default_content as Record<string, unknown>;
  return text(content.title) || section.section_key.replaceAll("-", " ");
}

function SectionEditor({ siteId, section, canEdit }: { siteId: string; section: TemplateSectionRecord; canEdit: boolean }) {
  const content = section.default_content as Record<string, unknown>;
  return (
    <Card className="p-4">
      <h3 className="font-bold capitalize text-ink">{sectionTitle(section)}</h3>
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted">{section.section_key}</p>
      <form action={saveSectionContentAction} className="mt-4 grid gap-3">
        <input type="hidden" name="siteId" value={siteId} />
        <input type="hidden" name="sectionId" value={section.id} />
        <input type="hidden" name="sectionKey" value={section.section_key} />
        <Field label="Section label">
          <input className={inputClassName} name="eyebrow" defaultValue={text(content.eyebrow)} maxLength={70} disabled={!canEdit} />
        </Field>
        <Field label="Heading">
          <input className={inputClassName} name="title" defaultValue={text(content.title)} maxLength={70} disabled={!canEdit} />
        </Field>
        <EditorAiTools siteId={siteId} sectionKey={section.section_key} fieldKey="title" currentValue={text(content.title)} canEdit={canEdit} />
        <Field label="Description">
          <textarea className={inputClassName} name="body" defaultValue={text(content.body)} rows={4} maxLength={240} disabled={!canEdit} />
        </Field>
        <EditorAiTools siteId={siteId} sectionKey={section.section_key} fieldKey="body" currentValue={text(content.body)} canEdit={canEdit} />
        <Field label="Primary CTA label and link">
          <div className="grid gap-2 sm:grid-cols-2">
            <input className={inputClassName} name="primaryActionLabel" defaultValue={text((content.primaryAction as Record<string, unknown> | undefined)?.label)} maxLength={30} placeholder="Request a quote" disabled={!canEdit} />
            <input className={inputClassName} name="primaryActionHref" defaultValue={text((content.primaryAction as Record<string, unknown> | undefined)?.href)} placeholder="/contact" disabled={!canEdit} />
          </div>
        </Field>
        <Field label="Image path and alt text">
          <div className="grid gap-2 sm:grid-cols-2">
            <input className={inputClassName} name="imageSrc" defaultValue={text((content.image as Record<string, unknown> | undefined)?.src)} placeholder="/templates/..." disabled={!canEdit} />
            <input className={inputClassName} name="imageAlt" defaultValue={text((content.image as Record<string, unknown> | undefined)?.alt)} maxLength={180} disabled={!canEdit} />
          </div>
        </Field>
        <Field label="Highlights, one per line">
          <textarea className={inputClassName} name="bullets" defaultValue={Array.isArray(content.bullets) ? content.bullets.join("\n") : ""} rows={3} disabled={!canEdit} />
        </Field>
        <Field label="Items, one per line as Title | Description">
          <textarea className={inputClassName} name="items" rows={5} maxLength={1200} disabled={!canEdit} placeholder="AC Maintenance | Routine servicing and support." />
        </Field>
        <Button type="submit" disabled={!canEdit}>Save Draft</Button>
      </form>
    </Card>
  );
}

export function ContentTab({ siteId, context }: { siteId: string; context: Awaited<ReturnType<typeof loadEditorContext>> }) {
  const profile = context.businessProfile;
  const sections = context.previewResult.status === "ready" ? context.previewResult.preview.sections.filter((section) => !["header-topbar-standard", "footer-standard", "floating-whatsapp"].includes(section.section_key)).slice(0, 8) : [];

  return (
    <div className="grid gap-4">
      <Card className="p-4">
        <h2 className="font-bold text-ink">Business profile</h2>
        <p className="mt-1 text-sm leading-6 text-muted">Enter shared business details once. They are reused across the header, contact sections, footer, and calls to action.</p>
        <form action={saveBusinessProfileAction} className="mt-4 grid gap-3">
          <input type="hidden" name="siteId" value={siteId} />
          <Field label="Company name">
            <input className={inputClassName} name="companyName" defaultValue={profile?.company_name ?? "Horizon Technical Services"} maxLength={80} required disabled={!context.canEdit} />
          </Field>
          <Field label="Tagline">
            <input className={inputClassName} name="tagline" defaultValue={profile?.tagline ?? ""} maxLength={120} disabled={!context.canEdit} />
          </Field>
          <EditorAiTools siteId={siteId} fieldKey="tagline" currentValue={profile?.tagline ?? ""} canEdit={context.canEdit} />
          <Field label="Short description">
            <textarea className={inputClassName} name="shortDescription" defaultValue={profile?.short_description ?? ""} rows={3} maxLength={240} disabled={!context.canEdit} />
          </Field>
          <EditorAiTools siteId={siteId} fieldKey="short_description" currentValue={profile?.short_description ?? ""} canEdit={context.canEdit} />
          <Field label="Full company description">
            <textarea className={inputClassName} name="fullDescription" defaultValue={profile?.full_description ?? ""} rows={5} maxLength={800} disabled={!context.canEdit} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Phone"><input className={inputClassName} name="phone" defaultValue={profile?.phone ?? ""} disabled={!context.canEdit} /></Field>
            <Field label="WhatsApp"><input className={inputClassName} name="whatsapp" defaultValue={profile?.whatsapp ?? ""} disabled={!context.canEdit} /></Field>
          </div>
          <Field label="Email"><input className={inputClassName} name="email" defaultValue={profile?.email ?? ""} disabled={!context.canEdit} /></Field>
          <Field label="Address"><input className={inputClassName} name="addressLine1" defaultValue={profile?.address_line_1 ?? ""} disabled={!context.canEdit} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="City"><input className={inputClassName} name="city" defaultValue={profile?.city ?? ""} disabled={!context.canEdit} /></Field>
            <Field label="Country"><input className={inputClassName} name="countryCode" defaultValue={profile?.country_code ?? ""} maxLength={2} disabled={!context.canEdit} /></Field>
          </div>
          <Field label="Google Maps embed URL"><input className={inputClassName} name="mapEmbedUrl" defaultValue={profile?.map_embed_url ?? ""} disabled={!context.canEdit} /></Field>
          <Field label="Working hours, one per line"><textarea className={inputClassName} name="workingHours" rows={3} disabled={!context.canEdit} /></Field>
          <Field label="Social links, one per line as Label | URL"><textarea className={inputClassName} name="socialLinks" rows={3} disabled={!context.canEdit} /></Field>
          <Button type="submit" disabled={!context.canEdit}>Save Draft</Button>
        </form>
      </Card>
      {sections.map((section) => (
        <SectionEditor key={section.id} siteId={siteId} section={section} canEdit={context.canEdit} />
      ))}
    </div>
  );
}
