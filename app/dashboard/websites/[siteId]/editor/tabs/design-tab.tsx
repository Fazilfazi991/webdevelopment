import { saveThemeAction } from "@/app/editor-actions";
import { saveCustomDomainAction, saveSeoAction } from "@/app/publishing-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, inputClassName } from "@/components/ui/field";
import type { loadEditorContext } from "@/lib/site-editor/editor-loader";
import type { Site } from "@/lib/types";

const swatches = ["#0f766e", "#14532d", "#1d4ed8", "#334155", "#7c2d12"];

export function DesignTab({ siteId, site, context }: { siteId: string; site: Site; context: Awaited<ReturnType<typeof loadEditorContext>> }) {
  const theme = context.themeOverride;
  return (
    <div className="grid gap-4">
    <Card className="p-4">
      <h2 className="font-bold text-ink">Design</h2>
      <p className="mt-1 text-sm leading-6 text-muted">Choose approved colours and style options. Custom CSS and arbitrary layouts are not available.</p>
      <form action={saveThemeAction} className="mt-4 grid gap-4">
        <input type="hidden" name="siteId" value={siteId} />
        <Field label="Theme preset">
          <select className={inputClassName} disabled>
            <option>Modern Corporate</option>
          </select>
        </Field>
        <div className="grid gap-3">
          <p className="text-sm font-semibold text-ink">Approved swatches</p>
          <div className="flex flex-wrap gap-2">
            {swatches.map((color) => <span key={color} className="size-9 rounded-app border border-line" style={{ background: color }} title={color} />)}
          </div>
        </div>
        <Field label="Primary colour">
          <input className={inputClassName} name="primaryColor" defaultValue={theme?.primary_color ?? "#0f766e"} pattern="^#[0-9A-Fa-f]{6}$" disabled={!context.canEdit} />
        </Field>
        <Field label="Secondary colour">
          <input className={inputClassName} name="secondaryColor" defaultValue={theme?.secondary_color ?? "#d8c3a5"} pattern="^#[0-9A-Fa-f]{6}$" disabled={!context.canEdit} />
        </Field>
        <Field label="Accent colour">
          <input className={inputClassName} name="accentColor" defaultValue={theme?.accent_color ?? "#134e4a"} pattern="^#[0-9A-Fa-f]{6}$" disabled={!context.canEdit} />
        </Field>
        <Field label="Font preset">
          <select className={inputClassName} name="fontPreset" defaultValue={theme?.font_preset ?? "professional_sans"} disabled={!context.canEdit}>
            <option value="professional_sans">Professional Sans</option>
            <option value="modern_clean">Modern Clean</option>
            <option value="classic_corporate">Classic Corporate</option>
            <option value="friendly_local">Friendly Local Business</option>
          </select>
        </Field>
        <Field label="Button style">
          <select className={inputClassName} name="buttonStyle" defaultValue={theme?.button_style ?? "soft_rounded"} disabled={!context.canEdit}>
            <option value="square">Square</option>
            <option value="soft_rounded">Soft Rounded</option>
            <option value="pill">Pill</option>
          </select>
        </Field>
        <Field label="Radius preset">
          <select className={inputClassName} name="radiusPreset" defaultValue={theme?.radius_preset ?? "balanced"} disabled={!context.canEdit}>
            <option value="minimal">Minimal</option>
            <option value="balanced">Balanced</option>
            <option value="rounded">Rounded</option>
          </select>
        </Field>
        <p className="rounded-app bg-canvas p-3 text-sm text-muted">Contrast warning: use darker primary colours for readable buttons.</p>
        <Button type="submit" disabled={!context.canEdit}>Save Draft</Button>
      </form>
    </Card>
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
        <Field label="Social title">
          <input className={inputClassName} name="ogTitle" defaultValue={site.og_title ?? ""} maxLength={70} disabled={!context.canEdit} />
        </Field>
        <Field label="Social description">
          <textarea className={inputClassName} name="ogDescription" defaultValue={site.og_description ?? ""} maxLength={160} rows={3} disabled={!context.canEdit} />
        </Field>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input type="checkbox" name="robotsIndex" defaultChecked={site.robots_index} disabled={!context.canEdit} />
          Allow search indexing
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input type="checkbox" name="robotsFollow" defaultChecked={site.robots_follow} disabled={!context.canEdit} />
          Allow link following
        </label>
        <Button type="submit" disabled={!context.canEdit}>Save SEO</Button>
      </form>
    </Card>
    <Card className="p-4">
      <h2 className="font-bold text-ink">Custom domain</h2>
      <p className="mt-1 text-sm leading-6 text-muted">Save a domain for DNS verification. Publishing still works immediately on the platform subdomain.</p>
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
