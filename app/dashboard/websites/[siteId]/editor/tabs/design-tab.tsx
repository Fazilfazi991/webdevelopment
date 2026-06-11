import { saveThemeAction } from "@/app/editor-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, inputClassName } from "@/components/ui/field";
import type { loadEditorContext } from "@/lib/site-editor/editor-loader";

const swatches = ["#0f766e", "#14532d", "#1d4ed8", "#334155", "#7c2d12"];

export function DesignTab({ siteId, context }: { siteId: string; context: Awaited<ReturnType<typeof loadEditorContext>> }) {
  const theme = context.themeOverride;
  return (
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
  );
}
