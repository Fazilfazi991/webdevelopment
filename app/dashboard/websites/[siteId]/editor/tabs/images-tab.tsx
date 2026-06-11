import { removeMediaAction } from "@/app/editor-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageUploader } from "@/app/dashboard/websites/[siteId]/editor/tabs/image-uploader";
import { mediaSlotLabel } from "@/lib/site-renderer/media-slots";
import type { loadEditorContext } from "@/lib/site-editor/editor-loader";

export function ImagesTab({
  siteId,
  organizationId,
  context
}: {
  siteId: string;
  organizationId: string;
  context: Awaited<ReturnType<typeof loadEditorContext>>;
}) {
  return (
    <div className="grid gap-4">
      <Card className="p-4">
        <h2 className="font-bold text-ink">Images</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Upload private images to the tenant-scoped site media bucket. Image details are saved only after the file upload succeeds.
        </p>
        <ImageUploader siteId={siteId} organizationId={organizationId} media={context.media} canEdit={context.canEdit} />
      </Card>
      <Card className="p-4">
        <h3 className="font-bold text-ink">Image library</h3>
        <div className="mt-3 grid gap-2 text-sm">
          {context.media.length ? (
            context.media.map((item) => (
              <div key={item.id} className="rounded-app border border-line bg-white p-3">
                {item.signed_url ? (
                  <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-app bg-canvas">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.signed_url} alt={item.alt_text ?? item.file_name} className="h-full w-full object-cover" />
                  </div>
                ) : null}
                <p className="font-semibold text-ink">{item.file_name}</p>
                <p className="text-muted">
                  {mediaSlotLabel(item.usage_type)} - {item.width ?? "?"} x {item.height ?? "?"} - {item.mime_type}
                </p>
                <p className="mt-1 break-all text-xs text-muted">{item.storage_path}</p>
                <form action={removeMediaAction} className="mt-3">
                  <input type="hidden" name="siteId" value={siteId} />
                  <input type="hidden" name="mediaId" value={item.id} />
                  <Button type="submit" variant="secondary" disabled={!context.canEdit}>
                    Remove image
                  </Button>
                </form>
              </div>
            ))
          ) : (
            <p className="text-muted">No images uploaded yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
