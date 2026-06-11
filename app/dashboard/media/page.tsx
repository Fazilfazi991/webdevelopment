import { CalendarDays, CheckCircle2, Edit3, Eye, FileImage, ImagePlus, RefreshCw, Search, Trash2 } from "lucide-react";
import { removeMediaAction, updateMediaDetailsAction } from "@/app/editor-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { ImageUploader } from "@/app/dashboard/websites/[siteId]/editor/tabs/image-uploader";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { Field, inputClassName } from "@/components/ui/field";
import { hasPermission } from "@/lib/access-control";
import { requireDashboardContext } from "@/lib/data";
import type { SiteMedia } from "@/lib/types";

const usageOptions = [
  { value: "", label: "All" },
  { value: "logo", label: "Logo" },
  { value: "hero", label: "Hero" },
  { value: "about", label: "About" },
  { value: "service", label: "Services" },
  { value: "gallery", label: "Gallery" },
  { value: "favicon", label: "Favicon" },
  { value: "general", label: "General" }
] as const;

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "file-name", label: "File name" },
  { value: "largest", label: "Largest size" }
] as const;

type MediaWithUrl = SiteMedia & { signed_url?: string; siteName: string };

function usageLabel(value: string) {
  return usageOptions.find((option) => option.value === value)?.label ?? "General";
}

function formatBytes(value: number) {
  if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  if (value >= 1024) return `${Math.round(value / 1024)} KB`;
  return `${value} B`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function dimensions(item: SiteMedia) {
  return item.width && item.height ? `${item.width} x ${item.height}` : "Dimensions pending";
}

function whereUsed(item: SiteMedia) {
  const labels: Record<SiteMedia["usage_type"], string> = {
    logo: "Logo area",
    hero: "Home hero",
    about: "About section",
    service: "Service card",
    gallery: "Gallery",
    favicon: "Browser favicon",
    general: "Reusable asset"
  };
  return labels[item.usage_type];
}

function panelHref(panel: string, id: string | undefined, searchParams: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const key of ["q", "site", "usage", "sort"]) {
    const value = searchParams[key];
    if (value) params.set(key, value);
  }
  params.set("panel", panel);
  if (id) params.set("id", id);
  return `/dashboard/media?${params.toString()}`;
}

function closeHref(searchParams: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const key of ["q", "site", "usage", "sort"]) {
    const value = searchParams[key];
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `/dashboard/media?${query}` : "/dashboard/media";
}

function returnPath(searchParams: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const key of ["q", "site", "usage", "sort"]) {
    const value = searchParams[key];
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `/dashboard/media?${query}` : "/dashboard/media";
}

function MediaThumb({ item }: { item: MediaWithUrl }) {
  if (!item.signed_url) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center bg-canvas text-sm font-semibold text-muted">
        Preview unavailable
      </div>
    );
  }
  return (
    <div className="aspect-[4/3] overflow-hidden bg-canvas">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.signed_url} alt={item.alt_text ?? item.file_name} className="h-full w-full object-cover" />
    </div>
  );
}

function SelectedPanel({
  panel,
  item,
  canManage,
  searchParams
}: {
  panel?: string;
  item?: MediaWithUrl;
  canManage: boolean;
  searchParams: Record<string, string | undefined>;
}) {
  if (!panel || panel === "upload") return null;
  if (!item) {
    return (
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Image not found</h2>
            <p className="mt-1 text-sm text-muted">Choose another media item from the library.</p>
          </div>
          <ButtonLink href={closeHref(searchParams)} variant="secondary">Close</ButtonLink>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-5">
        <div>
          <p className="text-sm font-semibold text-brand-700">{panel === "edit" ? "Edit Details" : panel === "replace" ? "Replace Image" : panel === "delete" ? "Delete Image" : "Preview"}</p>
          <h2 className="mt-1 text-xl font-bold text-ink">{item.file_name}</h2>
        </div>
        <ButtonLink href={closeHref(searchParams)} variant="secondary">Close</ButtonLink>
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="overflow-hidden rounded-app border border-line bg-canvas">
          <MediaThumb item={item} />
        </div>
        <div className="grid gap-4 text-sm">
          <div>
            <p className="font-bold text-ink">Details</p>
            <dl className="mt-2 grid gap-2 text-muted">
              <div><dt className="font-semibold text-ink">Usage</dt><dd>{usageLabel(item.usage_type)}</dd></div>
              <div><dt className="font-semibold text-ink">Dimensions</dt><dd>{dimensions(item)}</dd></div>
              <div><dt className="font-semibold text-ink">File size</dt><dd>{formatBytes(item.file_size)}</dd></div>
              <div><dt className="font-semibold text-ink">Website</dt><dd>{item.siteName}</dd></div>
              <div><dt className="font-semibold text-ink">Uploaded</dt><dd>{formatDate(item.created_at)}</dd></div>
              <div><dt className="font-semibold text-ink">Where used</dt><dd>{whereUsed(item)}</dd></div>
              <div><dt className="font-semibold text-ink">Storage summary</dt><dd>Private site-media asset for this website.</dd></div>
            </dl>
          </div>
          <div>
            <p className="font-semibold text-ink">Alt text</p>
            <p className="mt-1 leading-6 text-muted">{item.alt_text || "No alt text added yet."}</p>
          </div>
          {panel === "edit" ? (
            <form action={updateMediaDetailsAction} className="grid gap-3">
              <input type="hidden" name="siteId" value={item.site_id} />
              <input type="hidden" name="mediaId" value={item.id} />
              <input type="hidden" name="returnPath" value={returnPath(searchParams)} />
              <Field label="Usage type">
                <select className={inputClassName} name="usageType" defaultValue={item.usage_type} disabled={!canManage}>
                  {usageOptions.filter((option) => option.value).map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Alt text">
                <input className={inputClassName} name="altText" defaultValue={item.alt_text ?? ""} maxLength={180} disabled={!canManage} />
              </Field>
              <Button type="submit" disabled={!canManage}>Save Details</Button>
            </form>
          ) : null}
          {panel === "delete" ? (
            <form action={removeMediaAction} className="grid gap-3 rounded-app border border-amber-300 bg-amber-50 p-4">
              <input type="hidden" name="siteId" value={item.site_id} />
              <input type="hidden" name="mediaId" value={item.id} />
              <input type="hidden" name="returnPath" value={returnPath(searchParams)} />
              <p className="text-sm font-semibold text-amber-950">This image is currently used as {whereUsed(item).toLowerCase()}. Removing it may show a fallback image.</p>
              <Button type="submit" variant="danger" disabled={!canManage}>Delete Image</Button>
            </form>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export default async function MediaPage({
  searchParams
}: {
  searchParams: { q?: string; site?: string; usage?: string; sort?: string; panel?: string; id?: string; uploadSite?: string; error?: string; message?: string };
}) {
  const { supabase, organization, sites, membershipRole } = await requireDashboardContext();
  const canManage = hasPermission(null, "upload_media", membershipRole);
  const siteMap = new Map(sites.map((site) => [site.id, site]));
  const selectedSiteId = searchParams.site && siteMap.has(searchParams.site) ? searchParams.site : "";
  const uploadSite = (searchParams.uploadSite && siteMap.get(searchParams.uploadSite)) ?? (selectedSiteId ? siteMap.get(selectedSiteId) : sites[0]);

  let mediaQuery = supabase.from("site_media").select("*").eq("organization_id", organization.id);
  if (selectedSiteId) mediaQuery = mediaQuery.eq("site_id", selectedSiteId);
  const { data: mediaRows } = await mediaQuery.returns<SiteMedia[]>();
  const mediaWithUrls = await Promise.all(
    (mediaRows ?? []).map(async (item) => {
      const { data } = await supabase.storage.from("site-media").createSignedUrl(item.storage_path, 60 * 15);
      return { ...item, signed_url: data?.signedUrl, siteName: siteMap.get(item.site_id)?.name ?? "Website" };
    })
  );

  const q = searchParams.q?.trim().toLowerCase() ?? "";
  const usage = searchParams.usage ?? "";
  const filtered = mediaWithUrls
    .filter((item) => !usage || item.usage_type === usage)
    .filter((item) => !q || [item.file_name, item.alt_text ?? "", item.siteName, item.usage_type].join(" ").toLowerCase().includes(q))
    .sort((a, b) => {
      if (searchParams.sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (searchParams.sort === "file-name") return a.file_name.localeCompare(b.file_name);
      if (searchParams.sort === "largest") return b.file_size - a.file_size;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  const selectedItem = mediaWithUrls.find((item) => item.id === searchParams.id);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Media Library</h1>
          <p className="mt-2 text-sm leading-6 text-muted">Manage images used across your websites.</p>
        </div>
        <ButtonLink href={panelHref("upload", undefined, searchParams)} aria-disabled={!canManage} className={!canManage ? "pointer-events-none opacity-50" : ""}>
          <ImagePlus size={16} />
          Upload Image
        </ButtonLink>
      </div>
      <StatusMessage error={searchParams.error} message={searchParams.message} />

      <form className="grid gap-3 rounded-app border border-line bg-white p-4 shadow-soft lg:grid-cols-[minmax(220px,1fr)_220px_180px_180px_auto] lg:items-end">
        <Field label="Search images">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input className={`${inputClassName} pl-9`} name="q" defaultValue={searchParams.q ?? ""} placeholder="File name, alt text, website" />
          </div>
        </Field>
        <Field label="Website">
          <select className={inputClassName} name="site" defaultValue={selectedSiteId}>
            <option value="">All websites</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Usage type">
          <select className={inputClassName} name="usage" defaultValue={usage}>
            {usageOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Sort">
          <select className={inputClassName} name="sort" defaultValue={searchParams.sort ?? "newest"}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </Field>
        <Button type="submit" variant="secondary">Apply filters</Button>
      </form>

      {searchParams.panel === "upload" && uploadSite ? (
        <Card className="bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ink">Upload Image</h2>
              <p className="mt-1 text-sm text-muted">Choose a website, usage type, file, and alt text.</p>
            </div>
            <ButtonLink href={closeHref(searchParams)} variant="secondary">Close</ButtonLink>
          </div>
          {sites.length > 1 ? (
            <form className="mt-4 max-w-sm">
              <input type="hidden" name="panel" value="upload" />
              <Field label="Website">
                <select className={inputClassName} name="uploadSite" defaultValue={uploadSite.id}>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
              </Field>
              <Button type="submit" variant="secondary" className="mt-3">Choose Website</Button>
            </form>
          ) : (
            <p className="mt-4 rounded-app bg-canvas p-3 text-sm font-semibold text-muted">Website: {uploadSite.name}</p>
          )}
          <ImageUploader siteId={uploadSite.id} organizationId={organization.id} media={mediaWithUrls.filter((item) => item.site_id === uploadSite.id)} canEdit={canManage} returnPath={returnPath(searchParams)} />
        </Card>
      ) : null}

      <SelectedPanel panel={searchParams.panel} item={selectedItem} canManage={canManage} searchParams={searchParams} />

      {searchParams.panel === "replace" && selectedItem ? (
        <Card className="bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ink">Replace Image</h2>
              <p className="mt-1 text-sm text-muted">Upload a new file. Alt text can be preserved or updated after replacement.</p>
            </div>
            <ButtonLink href={closeHref(searchParams)} variant="secondary">Close</ButtonLink>
          </div>
          <ImageUploader
            siteId={selectedItem.site_id}
            organizationId={organization.id}
            media={mediaWithUrls.filter((item) => item.site_id === selectedItem.site_id)}
            canEdit={canManage}
            initialUsageType={selectedItem.usage_type}
            initialReplaceMediaId={selectedItem.id}
            returnPath={returnPath(searchParams)}
          />
        </Card>
      ) : null}

      {filtered.length ? (
        <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((item) => (
            <Card key={item.id} className="flex h-full overflow-hidden bg-white">
              <div className="flex min-w-0 flex-1 flex-col">
                <MediaThumb item={item} />
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-bold text-ink" title={item.file_name}>{item.file_name}</h2>
                      <p className="mt-1 text-sm font-semibold text-brand-700">{usageLabel(item.usage_type)}</p>
                    </div>
                    <FileImage className="size-5 shrink-0 text-muted" />
                  </div>
                  <dl className="mt-4 grid gap-2 text-sm text-muted">
                    <div className="flex justify-between gap-3"><dt>Dimensions</dt><dd className="font-semibold text-ink">{dimensions(item)}</dd></div>
                    <div className="flex justify-between gap-3"><dt>File size</dt><dd className="font-semibold text-ink">{formatBytes(item.file_size)}</dd></div>
                    <div className="flex justify-between gap-3"><dt>Website</dt><dd className="truncate font-semibold text-ink">{item.siteName}</dd></div>
                  </dl>
                  <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-muted">{item.alt_text || "No alt text added yet."}</p>
                  <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-muted">
                    <CalendarDays size={14} />
                    {formatDate(item.created_at)}
                  </p>
                  <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
                    <ButtonLink href={panelHref("preview", item.id, searchParams)} variant="secondary"><Eye size={15} />Preview</ButtonLink>
                    <ButtonLink href={panelHref("edit", item.id, searchParams)} variant="secondary"><Edit3 size={15} />Edit</ButtonLink>
                    <ButtonLink href={panelHref("replace", item.id, searchParams)} variant="secondary" className={!canManage ? "pointer-events-none opacity-50" : ""}><RefreshCw size={15} />Replace</ButtonLink>
                    <ButtonLink href={panelHref("delete", item.id, searchParams)} variant="secondary" className={!canManage ? "pointer-events-none opacity-50" : ""}><Trash2 size={15} />Delete</ButtonLink>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No images uploaded yet"
          description="Upload your logo, hero image, service images, and gallery photos to keep your website looking professional."
          action={canManage ? <ButtonLink href={panelHref("upload", undefined, searchParams)}>Upload Your First Image</ButtonLink> : undefined}
        />
      )}

      <Card className="bg-white p-4">
        <h2 className="font-bold text-ink">Dimension guidance</h2>
        <div className="mt-3 grid gap-2 text-sm text-muted md:grid-cols-2 xl:grid-cols-5">
          {["Logo: transparent PNG or SVG", "Hero: 1600 x 900 or larger", "About: 1200 x 900 or larger", "Service: 800 x 600 or larger", "Gallery: 1200 x 900 or larger"].map((item) => (
            <p key={item} className="flex gap-2 rounded-app bg-canvas p-3"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-700" />{item}</p>
          ))}
        </div>
      </Card>
    </div>
  );
}
