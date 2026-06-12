import Image from "next/image";
import { ImageIcon, Palette } from "lucide-react";
import { saveBrandingSettingsAction } from "@/app/website-settings-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { loadEditorContext } from "@/lib/site-editor/editor-loader";
import { requireSiteSetup } from "@/lib/setup";

export default async function BrandingPage({ params, searchParams }: { params: { siteId: string }; searchParams: { message?: string; error?: string } }) {
  const setup = await requireSiteSetup(params.siteId);
  const context = await loadEditorContext(setup.supabase, setup.site.id, true);
  const logo = context.media.find((item) => item.usage_type === "logo" && item.signed_url);
  const darkLogo = context.media.find((item) => item.usage_type === "logo-dark" && item.signed_url);
  const favicon = context.media.find((item) => item.usage_type === "favicon" && item.signed_url);
  const socialShare = context.media.find((item) => item.usage_type === "social-share" && item.signed_url);
  return <div className="mx-auto max-w-5xl space-y-6">
    <div><p className="text-xs font-bold uppercase tracking-widest text-brand-700">Settings</p><h1 className="mt-2 text-3xl font-bold text-ink [text-wrap:balance]">Branding</h1><p className="mt-2 text-sm text-muted [text-wrap:pretty]">Control how your logo and business name appear across the website.</p></div>
    <StatusMessage message={searchParams.message} error={searchParams.error} />
    <div className="grid gap-4 md:grid-cols-2">
      {[{ label: "Logo", item: logo, slot: "logo" }, { label: "Logo for dark backgrounds", item: darkLogo, slot: "logo-dark" }, { label: "Favicon", item: favicon, slot: "favicon" }, { label: "Social share image", item: socialShare, slot: "social-share" }].map(({ label, item, slot }) => <Card key={slot} className="p-4"><div className="relative flex aspect-[16/7] items-center justify-center overflow-hidden rounded-lg bg-canvas outline outline-1 outline-black/10">{item?.signed_url ? <Image src={item.signed_url} alt={item.alt_text || label} fill unoptimized className="object-contain p-5" /> : <ImageIcon className="text-muted" />}</div><h2 className="mt-3 font-bold text-ink">{label}</h2><ButtonLink href={`/dashboard/websites/${setup.site.id}/media`} variant="secondary" className="mt-3 w-full">Upload or replace</ButtonLink></Card>)}
    </div>
    <form action={saveBrandingSettingsAction}><input type="hidden" name="siteId" value={setup.site.id} /><Card className="grid gap-5 p-5"><div className="flex items-start gap-3"><Palette className="mt-0.5 text-brand-700" /><div><h2 className="font-bold text-ink">Logo display</h2><p className="mt-1 text-sm text-muted">Use approved controls that stay compatible with every design.</p></div></div><label className="grid gap-2 text-sm font-semibold text-ink">Logo alignment<select name="logoAlignment" defaultValue={context.branding?.logo_alignment ?? "left"} className="min-h-11 rounded-lg border border-line bg-white px-3"><option value="left">Left</option><option value="center">Center</option></select></label><label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-ink"><input type="checkbox" name="showBusinessNameFallback" defaultChecked={context.branding?.show_business_name_fallback ?? true} />Show business-name text fallback</label><label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-ink"><input type="checkbox" name="useLogoColors" defaultChecked={context.branding?.use_logo_colors ?? false} />Use logo colours for website style</label><Button type="submit" className="w-full sm:w-auto">Save branding</Button></Card></form>
  </div>;
}
