import { CheckCircle2, Eye, LayoutTemplate, Palette } from "lucide-react";
import { saveThemeAction } from "@/app/editor-actions";
import { Button, ButtonLink } from "@/components/ui/button";
import type { loadEditorContext } from "@/lib/site-editor/editor-loader";

const colours = [
  { value: "#0f766e", label: "Teal" },
  { value: "#14532d", label: "Forest" },
  { value: "#1d4ed8", label: "Blue" },
  { value: "#334155", label: "Slate" },
  { value: "#7c2d12", label: "Terracotta" }
];

export function DesignTab({ siteId, context }: { siteId: string; context: Awaited<ReturnType<typeof loadEditorContext>> }) {
  const theme = context.themeOverride;
  return (
    <div className="grid gap-5">
      <div className="rounded-lg border border-line bg-canvas p-4">
        <div className="flex items-start gap-3"><span className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><LayoutTemplate size={20} /></span><div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-widest text-muted">Current design</p><h3 className="mt-1 font-bold text-ink">Technical Services Modern</h3></div></div>
        <div className="mt-4 grid grid-cols-2 gap-2"><ButtonLink href={`/dashboard/websites/${siteId}/preview`} variant="secondary"><Eye size={16} />Preview Design</ButtonLink><ButtonLink href={`/dashboard/websites/${siteId}/setup/templates`} variant="secondary"><Palette size={16} />Other Designs</ButtonLink></div>
      </div>

      <form action={saveThemeAction} className="grid gap-5">
        <input type="hidden" name="siteId" value={siteId} />
        <input type="hidden" name="secondaryColor" value={theme?.secondary_color ?? "#d8c3a5"} />
        <input type="hidden" name="accentColor" value={theme?.accent_color ?? "#134e4a"} />

        <fieldset disabled={!context.canEdit} className="grid gap-3"><legend className="text-sm font-bold text-ink">Brand Colour</legend><div className="flex flex-wrap gap-3">{colours.map((colour) => <label key={colour.value} className="cursor-pointer text-center"><input className="peer sr-only" type="radio" name="primaryColor" value={colour.value} defaultChecked={(theme?.primary_color ?? "#0f766e").toLowerCase() === colour.value} /><span className="flex size-11 items-center justify-center rounded-full border-4 border-white shadow ring-1 ring-line peer-checked:ring-4 peer-checked:ring-brand-200" style={{ backgroundColor: colour.value }} /><span className="mt-1 block text-[10px] font-semibold text-muted">{colour.label}</span></label>)}</div></fieldset>

        <fieldset disabled={!context.canEdit} className="grid gap-2"><legend className="text-sm font-bold text-ink">Font Style</legend><div className="grid grid-cols-3 gap-2">{[
          ["modern_clean", "Modern"], ["professional_sans", "Professional"], ["classic_corporate", "Elegant"]
        ].map(([value,label]) => <label key={value}><input className="peer sr-only" type="radio" name="fontPreset" value={value} defaultChecked={(theme?.font_preset ?? "professional_sans") === value} /><span className="flex min-h-12 cursor-pointer items-center justify-center rounded-lg border border-line px-2 text-xs font-bold text-muted peer-checked:border-brand-600 peer-checked:bg-brand-50 peer-checked:text-brand-800">{label}</span></label>)}</div></fieldset>

        <fieldset disabled={!context.canEdit} className="grid gap-2"><legend className="text-sm font-bold text-ink">Button Style</legend><div className="grid grid-cols-3 gap-2">{[
          ["pill", "Rounded"], ["soft_rounded", "Soft"], ["square", "Square"]
        ].map(([value,label]) => <label key={value}><input className="peer sr-only" type="radio" name="buttonStyle" value={value} defaultChecked={(theme?.button_style ?? "soft_rounded") === value} /><span className="flex min-h-12 cursor-pointer items-center justify-center rounded-lg border border-line px-2 text-xs font-bold text-muted peer-checked:border-brand-600 peer-checked:bg-brand-50 peer-checked:text-brand-800">{label}</span></label>)}</div></fieldset>

        <fieldset disabled={!context.canEdit} className="grid gap-2"><legend className="text-sm font-bold text-ink">Spacing</legend><div className="grid grid-cols-3 gap-2">{[
          ["minimal", "Compact"], ["balanced", "Comfortable"], ["rounded", "Spacious"]
        ].map(([value,label]) => <label key={value}><input className="peer sr-only" type="radio" name="radiusPreset" value={value} defaultChecked={(theme?.radius_preset ?? "balanced") === value} /><span className="flex min-h-12 cursor-pointer items-center justify-center rounded-lg border border-line px-2 text-xs font-bold text-muted peer-checked:border-brand-600 peer-checked:bg-brand-50 peer-checked:text-brand-800">{label}</span></label>)}</div></fieldset>

        <p className="flex gap-2 rounded-lg bg-emerald-50 p-3 text-sm leading-6 text-emerald-900"><CheckCircle2 className="mt-1 shrink-0" size={17} />Your content, images and contact details stay the same when you change the website style.</p>
        <Button type="submit" disabled={!context.canEdit}>Save Website Style</Button>
      </form>
    </div>
  );
}
