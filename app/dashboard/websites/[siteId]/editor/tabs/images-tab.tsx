import { removeMediaAction } from "@/app/editor-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageUploader } from "@/app/dashboard/websites/[siteId]/editor/tabs/image-uploader";
import { mediaSlotLabel } from "@/lib/site-renderer/media-slots";
import type { loadEditorContext } from "@/lib/site-editor/editor-loader";
import type { SiteMedia } from "@/lib/types";

/** Slots we surface visually — excludes "general" and base slots like "service" */
const PRIMARY_SLOTS: SiteMedia["usage_type"][] = [
  "logo",
  "hero",
  "about",
  "service:ac-maintenance",
  "service:electrical",
  "service:plumbing",
  "service:painting",
  "service:interior-repairs",
  "service:preventive-maintenance",
  "gallery:project-01",
  "gallery:project-02",
  "gallery:project-03",
  "gallery:project-04",
  "favicon"
];

const TEMPLATE_DEFAULTS: Partial<Record<SiteMedia["usage_type"], string>> = {
  hero: "/templates/technical-services-modern/hero.webp",
  about: "/templates/technical-services-modern/about.webp",
  "service:ac-maintenance": "/templates/technical-services-modern/services/ac-maintenance.webp",
  "service:electrical": "/templates/technical-services-modern/services/electrical-services.webp",
  "service:plumbing": "/templates/technical-services-modern/services/plumbing-solutions.webp",
  "service:painting": "/templates/technical-services-modern/services/painting-services.webp",
  "service:interior-repairs": "/templates/technical-services-modern/services/interior-repairs.webp",
  "service:preventive-maintenance": "/templates/technical-services-modern/services/preventive-maintenance.webp",
  "gallery:project-01": "/templates/technical-services-modern/projects/project-01.webp",
  "gallery:project-02": "/templates/technical-services-modern/projects/project-02.webp",
  "gallery:project-03": "/templates/technical-services-modern/projects/project-03.webp",
  "gallery:project-04": "/templates/technical-services-modern/projects/project-04.webp"
};

const RECOMMENDED_DIMS: Partial<Record<SiteMedia["usage_type"], string>> = {
  logo: "300 × 120 px, PNG/SVG preferred",
  hero: "1600 × 900 px",
  about: "1200 × 900 px",
  favicon: "32 × 32 px or 512 × 512 px, square",
  "service:ac-maintenance": "800 × 600 px",
  "service:electrical": "800 × 600 px",
  "service:plumbing": "800 × 600 px",
  "service:painting": "800 × 600 px",
  "service:interior-repairs": "800 × 600 px",
  "service:preventive-maintenance": "800 × 600 px",
  "gallery:project-01": "1200 × 900 px",
  "gallery:project-02": "1200 × 900 px",
  "gallery:project-03": "1200 × 900 px",
  "gallery:project-04": "1200 × 900 px"
};

function ImageSlotCard({
  slot,
  uploadedItem,
  templateDefault,
  recommendedDims,
  siteId,
  canEdit
}: {
  slot: SiteMedia["usage_type"];
  uploadedItem: SiteMedia | null;
  templateDefault: string | undefined;
  recommendedDims: string | undefined;
  siteId: string;
  canEdit: boolean;
}) {
  const displaySrc = uploadedItem?.signed_url ?? templateDefault ?? null;
  const isUploaded = Boolean(uploadedItem);

  return (
    <div className="flex flex-col gap-2 rounded-app border border-line bg-white p-3">
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-app bg-canvas">
        {displaySrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displaySrc}
            alt={uploadedItem?.alt_text ?? mediaSlotLabel(slot)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-center text-xs font-semibold text-muted px-2">
            {mediaSlotLabel(slot)}
          </div>
        )}
        {isUploaded && (
          <span className="absolute right-2 top-2 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white shadow">
            Uploaded
          </span>
        )}
        {!isUploaded && templateDefault && (
          <span className="absolute right-2 top-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700 shadow">
            Default
          </span>
        )}
      </div>

      {/* Info */}
      <p className="text-xs font-semibold text-ink">{mediaSlotLabel(slot)}</p>
      {recommendedDims && (
        <p className="text-xs text-muted">{recommendedDims}</p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <ImageUploader
          siteId={siteId}
          organizationId="" // passed via parent; use hidden upload trigger approach
          media={[]}
          canEdit={canEdit}
          initialUsageType={slot}
          initialReplaceMediaId={uploadedItem?.id ?? ""}
          returnPath={`/dashboard/websites/${siteId}/editor/images`}
        />
      </div>
      {uploadedItem && canEdit && (
        <form action={removeMediaAction}>
          <input type="hidden" name="siteId" value={siteId} />
          <input type="hidden" name="mediaId" value={uploadedItem.id} />
          <Button type="submit" variant="secondary" className="w-full text-xs">
            Remove
          </Button>
        </form>
      )}
    </div>
  );
}

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
      {/* Upload a new image */}
      <Card className="p-4">
        <h2 className="font-bold text-ink">Upload an image</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Choose the slot, then upload. Uploaded images replace the template default for that slot.
        </p>
        <ImageUploader
          siteId={siteId}
          organizationId={organizationId}
          media={context.media}
          canEdit={context.canEdit}
          returnPath={`/dashboard/websites/${siteId}/editor/images`}
        />
      </Card>

      {/* Visual slot grid */}
      <Card className="p-4">
        <h2 className="font-bold text-ink">Image slots</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Uploaded images override the template default. Remove an upload to restore the default.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {PRIMARY_SLOTS.map((slot) => {
            const uploaded = context.media.find((m) => m.usage_type === slot && m.signed_url) ?? null;
            return (
              <ImageSlotCard
                key={slot}
                slot={slot}
                uploadedItem={uploaded}
                templateDefault={TEMPLATE_DEFAULTS[slot]}
                recommendedDims={RECOMMENDED_DIMS[slot]}
                siteId={siteId}
                canEdit={context.canEdit}
              />
            );
          })}
        </div>
      </Card>
    </div>
  );
}
