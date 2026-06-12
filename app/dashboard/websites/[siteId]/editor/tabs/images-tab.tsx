import { removeMediaAction } from "@/app/editor-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageUploader } from "@/app/dashboard/websites/[siteId]/editor/tabs/image-uploader";
import { mediaSlotLabel } from "@/lib/site-renderer/media-slots";
import { technicalServicesImagePack } from "@/lib/site-renderer/image-packs";
import type { loadEditorContext } from "@/lib/site-editor/editor-loader";
import type { SiteMedia } from "@/lib/types";

/** Slots we surface visually — excludes "general" and base slots like "service" */
const PRIMARY_SLOTS: SiteMedia["usage_type"][] = [
  "logo",
  "logo-dark",
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
  "favicon",
  "social-share"
];

const TEMPLATE_DEFAULTS = technicalServicesImagePack.images;

const SLOT_GROUPS = [
  { title: "Branding", slots: ["logo", "logo-dark", "favicon", "social-share"] as SiteMedia["usage_type"][] },
  { title: "Main website", slots: ["hero", "about"] as SiteMedia["usage_type"][] },
  { title: "Services", slots: PRIMARY_SLOTS.filter((slot) => slot.startsWith("service:")) },
  { title: "Projects", slots: PRIMARY_SLOTS.filter((slot) => slot.startsWith("gallery:")) }
];

const RECOMMENDED_DIMS: Partial<Record<SiteMedia["usage_type"], string>> = {
  "logo-dark": "300 x 120 px, transparent PNG/SVG preferred",
  "social-share": "1200 x 630 px",
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
  organizationId,
  canEdit
}: {
  slot: SiteMedia["usage_type"];
  uploadedItem: SiteMedia | null;
  templateDefault: string | undefined;
  recommendedDims: string | undefined;
  siteId: string;
  organizationId: string;
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
            className="h-full w-full object-cover outline outline-1 outline-black/10"
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
          organizationId={organizationId}
          media={[]}
          canEdit={canEdit}
          initialUsageType={slot}
          initialReplaceMediaId={uploadedItem?.id ?? ""}
          returnPath={`/dashboard/websites/${siteId}/media`}
        />
      </div>
      {uploadedItem && canEdit && (
        <form action={removeMediaAction}>
          <input type="hidden" name="siteId" value={siteId} />
          <input type="hidden" name="mediaId" value={uploadedItem.id} />
          <Button type="submit" variant="secondary" className="w-full text-xs">
            Use Design Default
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
  const uploadedSlots = new Set(context.media.filter((item) => item.signed_url).map((item) => item.usage_type));
  const contentSlots = PRIMARY_SLOTS.filter((slot) => !["logo", "logo-dark", "favicon", "social-share"].includes(slot));
  const customizedCount = contentSlots.filter((slot) => uploadedSlots.has(slot)).length;
  const readyCount = contentSlots.filter((slot) => uploadedSlots.has(slot) || TEMPLATE_DEFAULTS[slot]).length;
  const completion = Math.round((readyCount / contentSlots.length) * 100);

  return (
    <div className="grid gap-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">Image completion</p>
            <h2 className="mt-1 text-lg font-bold text-ink">{completion}% ready</h2>
            <p className="mt-1 text-sm text-muted">Professional defaults cover every key section. You have customized {customizedCount} of {contentSlots.length} photos.</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">Ready with defaults</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-canvas" role="progressbar" aria-label="Website image completion" aria-valuenow={completion} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-brand-700 transition-[width]" style={{ width: `${completion}%` }} />
        </div>
      </Card>
      {/* Upload a new image */}
      <Card className="p-4">
        <h2 className="font-bold text-ink">Add a photo</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Choose where the photo should appear, then upload it from your device.
        </p>
        <ImageUploader
          siteId={siteId}
          organizationId={organizationId}
          media={context.media}
          canEdit={context.canEdit}
          returnPath={`/dashboard/websites/${siteId}/media`}
        />
      </Card>

      {/* Visual slot grid */}
      <Card className="p-4">
        <h2 className="font-bold text-ink">Website photos</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Replace any photo below. Removing your photo restores the original design image.
        </p>
        <div className="mt-5 grid gap-7">
          {SLOT_GROUPS.map((group) => (
            <section key={group.title}>
              <h3 className="text-sm font-bold text-ink">{group.title}</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {group.slots.map((slot) => {
                  const uploaded = context.media.find((m) => m.usage_type === slot && m.signed_url) ?? null;
                  return <ImageSlotCard key={slot} slot={slot} uploadedItem={uploaded} templateDefault={TEMPLATE_DEFAULTS[slot]} recommendedDims={RECOMMENDED_DIMS[slot]} siteId={siteId} organizationId={organizationId} canEdit={context.canEdit} />;
                })}
              </div>
            </section>
          ))}
        </div>
      </Card>
    </div>
  );
}
