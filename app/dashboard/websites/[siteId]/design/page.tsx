import { Check, Palette } from "lucide-react";
import Image from "next/image";
import { RecipeCard } from "@/components/design-system/recipe-card";
import { Card } from "@/components/ui/card";
import { customerVisibleRecipes, getPreset } from "@/lib/design-system/catalog";
import { recommendDesignRecipes } from "@/lib/design-system/resolver";
import { requireSiteSetup } from "@/lib/setup";
import type { BusinessCategory, SiteBusinessProfile, Template } from "@/lib/types";

export default async function DesignPage({ params, searchParams }: { params: { siteId: string }; searchParams: { message?: string; error?: string } }) {
  const { site, selection, supabase } = await requireSiteSetup(params.siteId);
  const [{ data: profile }, { data: category }, { data: currentTemplate }, { count: mediaCount }] = await Promise.all([
    supabase.from("site_business_profiles").select("*").eq("site_id", site.id).maybeSingle<SiteBusinessProfile>(),
    selection?.business_category_id ? supabase.from("business_categories").select("*").eq("id", selection.business_category_id).maybeSingle<BusinessCategory>() : Promise.resolve({ data: null }),
    selection?.template_id ? supabase.from("templates").select("*").eq("id", selection.template_id).maybeSingle<Template>() : Promise.resolve({ data: null }),
    supabase.from("site_media").select("id", { count: "exact", head: true }).eq("site_id", site.id).like("usage_type", "gallery%")
  ]);
  const recommendation = recommendDesignRecipes({ businessFamily: "service-business", businessCategory: category?.slug ?? "technical-services", galleryImageCount: mediaCount ?? 0, language: "en", region: profile?.country_code === "AE" ? "gcc" : "global" });
  const current = customerVisibleRecipes.find((recipe) => recipe.slug === currentTemplate?.slug) ?? recommendation.best.recipe;
  const preset = getPreset(current.stylePresetId);
  return <div className="mx-auto max-w-7xl space-y-8">
    <div><p className="text-sm font-bold uppercase tracking-widest text-brand-700">Website design</p><h1 className="mt-2 text-3xl font-bold text-ink">Choose a complete, approved design</h1><p className="mt-2 max-w-3xl text-muted">Your business content and uploaded media stay independent from the design. Changes remain draft-only until publishing.</p></div>
    {searchParams.message ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{searchParams.message}</div> : null}{searchParams.error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">{searchParams.error}</div> : null}
    <section><h2 className="text-xl font-bold text-ink">Your Current Design</h2><Card className="mt-3 grid overflow-hidden md:grid-cols-[1fr_1.1fr]"><div className="relative min-h-64"><Image src={current.previewAsset} alt={`${current.name} preview`} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" /></div><div className="p-6"><span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800"><Check size={14} />Current draft</span><h3 className="mt-4 text-2xl font-bold text-ink">{current.name}</h3><p className="mt-2 text-muted">{current.description}</p><div className="mt-5 flex gap-2">{[preset.colors.primary, preset.colors.secondary, preset.colors.accent].map((color) => <span key={color} className="size-8 rounded-full border-2 border-white shadow" style={{ backgroundColor: color }} />)}</div></div></Card></section>
    <section><h2 className="text-xl font-bold text-ink">Recommended for You</h2><div className="mt-3 grid gap-5 lg:grid-cols-3"><RecipeCard recipe={recommendation.best.recipe} siteId={site.id} recommended />{recommendation.alternatives.map(({ recipe }) => <RecipeCard key={recipe.id} recipe={recipe} siteId={site.id} />)}</div></section>
    <section><h2 className="text-xl font-bold text-ink">Explore More Designs</h2><p className="mt-1 text-sm text-muted">Only approved designs with complete desktop and mobile preview assets appear here.</p><div className="mt-3 grid gap-5 lg:grid-cols-3">{customerVisibleRecipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} siteId={site.id} />)}</div></section>
    <section><h2 className="text-xl font-bold text-ink">Customize Style</h2><Card className="mt-3 p-5"><div className="flex items-start gap-3"><Palette className="mt-1 text-brand-700" /><div><h3 className="font-bold text-ink">Approved theme controls</h3><p className="mt-1 text-sm text-muted">Colours, font preset, button style, radius and spacing remain token-based. Customer-facing flows do not accept arbitrary CSS.</p></div></div></Card></section>
  </div>;
}
