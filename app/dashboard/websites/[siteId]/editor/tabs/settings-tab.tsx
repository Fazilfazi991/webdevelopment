import { saveBusinessProfileAction } from "@/app/editor-actions";
import { saveSeoAction, saveCustomDomainAction } from "@/app/publishing-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, inputClassName } from "@/components/ui/field";
import type { loadEditorContext } from "@/lib/site-editor/editor-loader";
import type { Site } from "@/lib/types";

export function SettingsTab({
  siteId,
  site,
  context
}: {
  siteId: string;
  site: Site;
  context: Awaited<ReturnType<typeof loadEditorContext>>;
}) {
  const profile = context.businessProfile;

  return (
    <div className="grid gap-4">
      {/* Business Details */}
      <Card className="p-4">
        <h2 className="font-bold text-ink">Business Details</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Shared contact information used across your header, footer, contact section, and CTAs.
        </p>
        <form action={saveBusinessProfileAction} className="mt-4 grid gap-3">
          <input type="hidden" name="siteId" value={siteId} />
          <Field label="Company name">
            <input
              className={inputClassName}
              name="companyName"
              defaultValue={profile?.company_name ?? ""}
              maxLength={80}
              required
              disabled={!context.canEdit}
            />
          </Field>
          <Field label="Tagline">
            <input
              className={inputClassName}
              name="tagline"
              defaultValue={profile?.tagline ?? ""}
              maxLength={120}
              disabled={!context.canEdit}
            />
          </Field>
          <Field label="Short description">
            <textarea
              className={inputClassName}
              name="shortDescription"
              defaultValue={profile?.short_description ?? ""}
              rows={3}
              maxLength={240}
              disabled={!context.canEdit}
            />
          </Field>
          <Field label="Full company description">
            <textarea
              className={inputClassName}
              name="fullDescription"
              defaultValue={profile?.full_description ?? ""}
              rows={4}
              maxLength={800}
              disabled={!context.canEdit}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Phone">
              <input className={inputClassName} name="phone" defaultValue={profile?.phone ?? ""} disabled={!context.canEdit} />
            </Field>
            <Field label="WhatsApp">
              <input className={inputClassName} name="whatsapp" defaultValue={profile?.whatsapp ?? ""} disabled={!context.canEdit} />
            </Field>
          </div>
          <Field label="Email">
            <input className={inputClassName} name="email" defaultValue={profile?.email ?? ""} disabled={!context.canEdit} />
          </Field>
          <Field label="Address">
            <input className={inputClassName} name="addressLine1" defaultValue={profile?.address_line_1 ?? ""} disabled={!context.canEdit} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="City">
              <input className={inputClassName} name="city" defaultValue={profile?.city ?? ""} disabled={!context.canEdit} />
            </Field>
            <Field label="Country code">
              <input className={inputClassName} name="countryCode" defaultValue={profile?.country_code ?? ""} maxLength={2} disabled={!context.canEdit} />
            </Field>
          </div>
          <Field label="Working hours (one per line)">
            <textarea
              className={inputClassName}
              name="workingHours"
              rows={3}
              defaultValue={
                Array.isArray((profile?.working_hours as string[]))
                  ? (profile?.working_hours as string[]).join("\n")
                  : ""
              }
              disabled={!context.canEdit}
            />
          </Field>
          <Field label="Social links (one per line: Label | URL)">
            <textarea
              className={inputClassName}
              name="socialLinks"
              rows={3}
              defaultValue={
                Array.isArray((profile?.social_links as string[]))
                  ? (profile?.social_links as string[]).join("\n")
                  : ""
              }
              disabled={!context.canEdit}
            />
          </Field>
          <Field label="Google Maps embed URL">
            <input className={inputClassName} name="mapEmbedUrl" defaultValue={profile?.map_embed_url ?? ""} disabled={!context.canEdit} />
          </Field>
          <Button type="submit" disabled={!context.canEdit}>
            Save business details
          </Button>
        </form>
      </Card>

      {/* SEO */}
      <Card className="p-4">
        <h2 className="font-bold text-ink">SEO</h2>
        <form action={saveSeoAction} className="mt-4 grid gap-4">
          <input type="hidden" name="siteId" value={siteId} />
          <Field label="SEO title">
            <input className={inputClassName} name="seoTitle" defaultValue={site.seo_title ?? ""} maxLength={70} disabled={!context.canEdit} />
          </Field>
          <Field label="SEO description">
            <textarea className={inputClassName} name="seoDescription" defaultValue={site.seo_description ?? ""} maxLength={160} rows={3} disabled={!context.canEdit} />
          </Field>
          <Field label="Keywords">
            <input className={inputClassName} name="seoKeywords" defaultValue={site.seo_keywords ?? ""} disabled={!context.canEdit} />
          </Field>
          <Field label="Social (OG) title">
            <input className={inputClassName} name="ogTitle" defaultValue={site.og_title ?? ""} maxLength={70} disabled={!context.canEdit} />
          </Field>
          <Field label="Social (OG) description">
            <textarea className={inputClassName} name="ogDescription" defaultValue={site.og_description ?? ""} maxLength={160} rows={3} disabled={!context.canEdit} />
          </Field>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-ink">
              <input type="checkbox" name="robotsIndex" defaultChecked={site.robots_index} disabled={!context.canEdit} />
              Allow search indexing
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-ink">
              <input type="checkbox" name="robotsFollow" defaultChecked={site.robots_follow} disabled={!context.canEdit} />
              Allow link following
            </label>
          </div>
          <Button type="submit" disabled={!context.canEdit}>Save SEO settings</Button>
        </form>
      </Card>

      {/* Custom Domain */}
      <Card className="p-4">
        <h2 className="font-bold text-ink">Custom Domain</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Save a domain for DNS verification. Publishing works immediately on the platform subdomain.
        </p>
        <form action={saveCustomDomainAction} className="mt-4 grid gap-4">
          <input type="hidden" name="siteId" value={siteId} />
          <Field label="Domain">
            <input className={inputClassName} name="domain" placeholder="www.example.com" disabled={!context.canEdit} />
          </Field>
          <Button type="submit" disabled={!context.canEdit}>Save domain</Button>
        </form>
      </Card>
    </div>
  );
}
