import { saveMediaMetadataAction } from "@/app/editor-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, inputClassName } from "@/components/ui/field";
import type { loadEditorContext } from "@/lib/site-editor/editor-loader";

export function ImagesTab({ siteId, context }: { siteId: string; context: Awaited<ReturnType<typeof loadEditorContext>> }) {
  return (
    <div className="grid gap-4">
      <Card className="p-4">
        <h2 className="font-bold text-ink">Images</h2>
        <p className="mt-1 text-sm leading-6 text-muted">Register image metadata for the private `site-media` bucket. Upload files to the tenant-scoped storage path after the bucket migration is applied.</p>
        <form action={saveMediaMetadataAction} className="mt-4 grid gap-3">
          <input type="hidden" name="siteId" value={siteId} />
          <Field label="Usage type">
            <select className={inputClassName} name="usageType" disabled={!context.canEdit}>
              <option value="logo">Logo</option>
              <option value="hero">Hero image</option>
              <option value="about">About image</option>
              <option value="service">Service image</option>
              <option value="gallery">Project gallery</option>
              <option value="general">General library</option>
            </select>
          </Field>
          <Field label="File name"><input className={inputClassName} name="fileName" placeholder="hero.webp" disabled={!context.canEdit} /></Field>
          <Field label="MIME type">
            <select className={inputClassName} name="mimeType" disabled={!context.canEdit}>
              <option value="image/jpeg">JPEG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WebP</option>
              <option value="image/svg+xml">SVG</option>
            </select>
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="File size"><input className={inputClassName} name="fileSize" type="number" placeholder="500000" disabled={!context.canEdit} /></Field>
            <Field label="Width"><input className={inputClassName} name="width" type="number" placeholder="1600" disabled={!context.canEdit} /></Field>
            <Field label="Height"><input className={inputClassName} name="height" type="number" placeholder="900" disabled={!context.canEdit} /></Field>
          </div>
          <Field label="Alt text"><input className={inputClassName} name="altText" maxLength={180} disabled={!context.canEdit} /></Field>
          <p className="rounded-app bg-canvas p-3 text-sm text-muted">Guidance: Logo PNG/SVG, hero 1600 x 900+, about 1200 x 900+, service 800 x 600+, gallery 1200 x 900+. Warn customers when images are smaller.</p>
          <Button type="submit" disabled={!context.canEdit}>Save image metadata</Button>
        </form>
      </Card>
      <Card className="p-4">
        <h3 className="font-bold text-ink">Image library</h3>
        <div className="mt-3 grid gap-2 text-sm">
          {context.media.length ? context.media.map((item) => (
            <div key={item.id} className="rounded-app border border-line bg-white p-3">
              <p className="font-semibold text-ink">{item.file_name}</p>
              <p className="text-muted">{item.usage_type} - {item.width ?? "?"} x {item.height ?? "?"} - {item.mime_type}</p>
              <p className="mt-1 break-all text-xs text-muted">{item.storage_path}</p>
            </div>
          )) : <p className="text-muted">No images registered yet.</p>}
        </div>
      </Card>
    </div>
  );
}
