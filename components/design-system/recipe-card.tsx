import Image from "next/image";
import { CheckCircle2, MonitorSmartphone } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import type { DesignRecipe } from "@/lib/design-system/catalog";

export function RecipeCard({ recipe, siteId, recommended = false }: { recipe: DesignRecipe; siteId: string; recommended?: boolean }) {
  return <article className="overflow-hidden rounded-xl border border-line bg-white shadow-soft">
    <div className="relative aspect-[16/10] bg-canvas"><Image src={recipe.previewAsset.replace("preview-desktop", "thumbnail")} alt={`${recipe.name} website preview`} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" /></div>
    <div className="p-5">
      <div className="flex flex-wrap items-center gap-2">{recommended ? <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800">Recommended for you</span> : null}<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800"><MonitorSmartphone size={13} />Mobile-ready</span></div>
      <h3 className="mt-4 text-xl font-bold text-ink">{recipe.name}</h3><p className="mt-2 text-sm leading-6 text-muted">{recipe.description}</p>
      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted">Best for</p><p className="mt-1 text-sm text-ink">{recipe.bestFor}</p>
      <div className="mt-4 flex flex-wrap gap-2">{recipe.includedPages.map((page) => <span key={page} className="inline-flex items-center gap-1 text-xs text-muted"><CheckCircle2 size={13} className="text-emerald-600" />{page}</span>)}</div>
      <div className="mt-5 grid grid-cols-2 gap-2"><ButtonLink href={`/dashboard/websites/${siteId}/design/${recipe.slug}`} variant="secondary">Preview</ButtonLink><ButtonLink href={`/dashboard/websites/${siteId}/design/${recipe.slug}`}>Use This Design</ButtonLink></div>
    </div>
  </article>;
}
