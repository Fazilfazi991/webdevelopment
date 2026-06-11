import { saveThemeAction } from "@/app/editor-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, inputClassName } from "@/components/ui/field";
import type { loadEditorContext } from "@/lib/site-editor/editor-loader";

const APPROVED_SWATCHES = [
  { hex: "#0f766e", name: "Teal" },
  { hex: "#14532d", name: "Forest Green" },
  { hex: "#1d4ed8", name: "Royal Blue" },
  { hex: "#334155", name: "Slate" },
  { hex: "#7c2d12", name: "Burnt Orange" }
];

export function DesignTab({
  siteId,
  context
}: {
  siteId: string;
  context: Awaited<ReturnType<typeof loadEditorContext>>;
}) {
  const theme = context.themeOverride;

  return (
    <div className="grid gap-4">
      <Card className="p-4">
        <h2 className="font-bold text-ink">Design</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Adjust approved colours, fonts, and style presets. Custom CSS is not available.
        </p>
        <form action={saveThemeAction} className="mt-4 grid gap-4">
          <input type="hidden" name="siteId" value={siteId} />

          <Field label="Theme preset">
            <select className={inputClassName} disabled>
              <option>Modern Corporate</option>
            </select>
          </Field>

          {/* Colour swatches for quick reference */}
          <div className="grid gap-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted">Approved colours</p>
            <div className="flex flex-wrap gap-2">
              {APPROVED_SWATCHES.map((swatch) => (
                <span
                  key={swatch.hex}
                  className="size-9 rounded-app border border-line shadow-sm"
                  style={{ background: swatch.hex }}
                  title={`${swatch.name} ${swatch.hex}`}
                />
              ))}
            </div>
          </div>

          <Field label="Primary colour">
            <div className="flex gap-2">
              <input
                type="color"
                className="h-11 w-12 cursor-pointer rounded-app border border-line p-1"
                defaultValue={theme?.primary_color ?? "#0f766e"}
                onChange={() => {}}
                disabled={!context.canEdit}
                aria-label="Primary colour picker"
              />
              <input
                className={inputClassName}
                name="primaryColor"
                defaultValue={theme?.primary_color ?? "#0f766e"}
                pattern="^#[0-9A-Fa-f]{6}$"
                placeholder="#0f766e"
                disabled={!context.canEdit}
              />
            </div>
          </Field>

          <Field label="Secondary colour">
            <div className="flex gap-2">
              <input
                type="color"
                className="h-11 w-12 cursor-pointer rounded-app border border-line p-1"
                defaultValue={theme?.secondary_color ?? "#d8c3a5"}
                onChange={() => {}}
                disabled={!context.canEdit}
                aria-label="Secondary colour picker"
              />
              <input
                className={inputClassName}
                name="secondaryColor"
                defaultValue={theme?.secondary_color ?? "#d8c3a5"}
                pattern="^#[0-9A-Fa-f]{6}$"
                placeholder="#d8c3a5"
                disabled={!context.canEdit}
              />
            </div>
          </Field>

          <Field label="Accent colour">
            <div className="flex gap-2">
              <input
                type="color"
                className="h-11 w-12 cursor-pointer rounded-app border border-line p-1"
                defaultValue={theme?.accent_color ?? "#134e4a"}
                onChange={() => {}}
                disabled={!context.canEdit}
                aria-label="Accent colour picker"
              />
              <input
                className={inputClassName}
                name="accentColor"
                defaultValue={theme?.accent_color ?? "#134e4a"}
                pattern="^#[0-9A-Fa-f]{6}$"
                placeholder="#134e4a"
                disabled={!context.canEdit}
              />
            </div>
          </Field>

          <Field label="Font preset">
            <select
              className={inputClassName}
              name="fontPreset"
              defaultValue={theme?.font_preset ?? "professional_sans"}
              disabled={!context.canEdit}
            >
              <option value="professional_sans">Professional Sans</option>
              <option value="modern_clean">Modern Clean</option>
              <option value="classic_corporate">Classic Corporate</option>
              <option value="friendly_local">Friendly Local</option>
            </select>
          </Field>

          <Field label="Button style">
            <select
              className={inputClassName}
              name="buttonStyle"
              defaultValue={theme?.button_style ?? "soft_rounded"}
              disabled={!context.canEdit}
            >
              <option value="square">Square</option>
              <option value="soft_rounded">Soft Rounded</option>
              <option value="pill">Pill</option>
            </select>
          </Field>

          <Field label="Radius preset">
            <select
              className={inputClassName}
              name="radiusPreset"
              defaultValue={theme?.radius_preset ?? "balanced"}
              disabled={!context.canEdit}
            >
              <option value="minimal">Minimal</option>
              <option value="balanced">Balanced</option>
              <option value="rounded">Rounded</option>
            </select>
          </Field>

          <p className="rounded-app bg-canvas p-3 text-sm text-muted">
            Use darker primary colours for readable buttons and sufficient contrast.
          </p>

          <Button type="submit" disabled={!context.canEdit}>
            Save design
          </Button>
        </form>
      </Card>
    </div>
  );
}
