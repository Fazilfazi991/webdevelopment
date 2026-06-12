"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Check, ChevronLeft, Eye, X } from "lucide-react";
import Link from "next/link";
import { SiteRenderer } from "@/components/site-renderer/site-renderer";
import { fontPresetMap } from "@/lib/site-editor/editor-loader";
import { isDefaultEditorPageSlug, normaliseEditorPageSlug } from "@/lib/site-editor/page-structure";
import { applyLocalImageToContent } from "@/lib/site-renderer/media-slots";
import type { LoadedTemplatePreview } from "@/lib/site-renderer/template-types";
import type { SiteMediaSlot } from "@/lib/site-renderer/media-slots";

type ThemePatch = {
  primaryColor?: string;
  fontPreset?: keyof typeof fontPresetMap;
  buttonStyle?: "square" | "soft_rounded" | "pill";
  radiusPreset?: "minimal" | "balanced" | "rounded";
};

type PreviewContextValue = {
  patchSection: (sectionId: string, patch: Record<string, unknown>) => void;
  patchTheme: (patch: ThemePatch) => void;
  patchImage: (slot: SiteMediaSlot, src: string, alt: string) => void;
  selectedSectionId: string | null;
  selectSection: (sectionId: string | null, source?: "list" | "preview") => void;
  currentPageSlug: string;
  selectPage: (pageSlug: string, sectionKey?: string | null) => void;
  isDirty: boolean;
  markSaved: () => void;
};

const PreviewContext = createContext<PreviewContextValue | null>(null);

export function useLivePreview() {
  return useContext(PreviewContext);
}

export function LivePreviewWorkspace({
  initialPreview,
  pageSlug,
  siteId,
  initialSectionId,
  children
}: {
  initialPreview: LoadedTemplatePreview | null;
  pageSlug: string;
  siteId: string;
  initialSectionId?: string;
  children: React.ReactNode;
}) {
  const [preview, setPreview] = useState(initialPreview);
  const [currentPageSlug, setCurrentPageSlug] = useState(normaliseEditorPageSlug(pageSlug));
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(initialSectionId ?? null);
  const [isDirty, setIsDirty] = useState(false);
  const previewScroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPageSlug(normaliseEditorPageSlug(pageSlug));
    setSelectedSectionId(initialSectionId ?? null);
  }, [initialSectionId, pageSlug]);

  const replaceEditorUrl = useCallback((nextPageSlug: string, sectionKey?: string | null) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("page", nextPageSlug);
    if (sectionKey) url.searchParams.set("section", sectionKey);
    else url.searchParams.delete("section");
    window.history.replaceState(window.history.state, "", `${url.pathname}?${url.searchParams.toString()}`);
  }, []);

  const selectPage = useCallback((nextPageSlug: string, sectionKey?: string | null) => {
    const safePageSlug = normaliseEditorPageSlug(nextPageSlug);
    setCurrentPageSlug(safePageSlug);
    setSelectedSectionId(null);
    replaceEditorUrl(safePageSlug, sectionKey);
    requestAnimationFrame(() => {
      if (previewScroller.current) previewScroller.current.scrollTop = 0;
    });
  }, [replaceEditorUrl]);

  const selectSection = useCallback((sectionId: string | null, source: "list" | "preview" = "list") => {
    const scrollTop = previewScroller.current?.scrollTop;
    setSelectedSectionId(sectionId);
    const section = preview?.sections.find((candidate) => candidate.id === sectionId);
    if (section) replaceEditorUrl(section.page_slug, section.section_key);
    requestAnimationFrame(() => {
      if (previewScroller.current && scrollTop !== undefined) previewScroller.current.scrollTop = scrollTop;
      if (!sectionId) return;
      const previewSection = previewScroller.current?.querySelector<HTMLElement>(`[data-editor-section-id="${sectionId}"]`);
      if (source === "list") previewSection?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.querySelector<HTMLElement>(`[data-editor-list-section-id="${sectionId}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, [preview, replaceEditorUrl]);

  const handlePreviewNavigation = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const anchor = (event.target as HTMLElement).closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("https://wa.me/")) return;
    let url: URL;
    try {
      url = new URL(href, window.location.origin);
    } catch {
      return;
    }
    if (url.origin !== window.location.origin) return;
    const segments = url.pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1] ?? "";
    const nextPageSlug = url.pathname === "/" || segments.length <= 2 || lastSegment === "sites" ? "home" : lastSegment;
    if (!isDefaultEditorPageSlug(nextPageSlug)) return;
    event.preventDefault();
    event.stopPropagation();
    selectPage(nextPageSlug);
  }, [selectPage]);

  const value = useMemo<PreviewContextValue>(() => ({
    patchSection(sectionId, patch) {
      setIsDirty(true);
      setPreview((current) => current ? {
        ...current,
        sections: current.sections.map((section) => section.id === sectionId ? {
          ...section,
          default_content: { ...(section.default_content as Record<string, unknown>), ...patch }
        } : section)
      } : current);
    },
    patchTheme(patch) {
      setIsDirty(true);
      setPreview((current) => {
        if (!current) return current;
        const radius = patch.radiusPreset === "minimal" ? "3px" : patch.radiusPreset === "rounded" ? "14px" : patch.radiusPreset === "balanced" ? "8px" : current.theme.radius.card;
        const buttonRadius = patch.buttonStyle === "square" ? "2px" : patch.buttonStyle === "pill" ? "999px" : patch.buttonStyle === "soft_rounded" ? radius : current.theme.radius.button;
        const font = patch.fontPreset ? fontPresetMap[patch.fontPreset] : null;
        return {
          ...current,
          theme: {
            ...current.theme,
            colors: { ...current.theme.colors, primary: patch.primaryColor ?? current.theme.colors.primary },
            fonts: font ? { heading: font, body: font } : current.theme.fonts,
            radius: { card: radius, button: buttonRadius }
          }
        };
      });
    },
    patchImage(slot, src, alt) {
      setIsDirty(true);
      setPreview((current) => current ? {
        ...current,
        sections: current.sections.map((section) => ({
          ...section,
          default_content: applyLocalImageToContent(section.default_content, section.section_key, slot, { src, alt })
        }))
      } : current);
    },
    selectedSectionId,
    selectSection,
    currentPageSlug,
    selectPage,
    isDirty,
    markSaved: () => setIsDirty(false)
  }), [currentPageSlug, isDirty, selectPage, selectSection, selectedSectionId]);

  return (
    <PreviewContext.Provider value={value}>
      <div className="relative grid gap-5 lg:grid-cols-[400px_minmax(0,1fr)] lg:items-start">
        <section className={`${selectedSectionId ? "fixed inset-0 z-50 overflow-y-auto bg-canvas pb-24" : "hidden"} lg:static lg:block lg:overflow-visible lg:bg-transparent lg:pb-0`}>
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
            <button type="button" onClick={() => selectSection(null)} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-bold text-ink active:scale-[0.96]"><ChevronLeft size={18} />Website</button>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${isDirty ? "text-amber-700" : "text-emerald-700"}`}>{isDirty ? "Unsaved changes" : <><Check size={14} />Saved</>}</span>
            <button type="button" onClick={() => selectSection(null)} className="flex size-10 items-center justify-center rounded-lg text-muted active:scale-[0.96]" aria-label="Close editor"><X size={18} /></button>
          </div>
          <div className="p-4 lg:p-0">{children}</div>
          <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-3 border-t border-line bg-white p-3 shadow-[0_-8px_30px_rgba(24,33,31,0.1)] lg:hidden">
            <Link href={`/dashboard/websites/${siteId}/preview`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-bold text-ink active:scale-[0.96]"><Eye size={17} />Preview</Link>
            <button type="submit" form="section-editor-form" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-bold text-white active:scale-[0.96]" disabled={!isDirty}><Check size={17} />Save</button>
          </div>
        </section>
        <section className="min-w-0">
          <div className="sticky top-24 overflow-hidden rounded-xl bg-white shadow-[0_16px_44px_rgba(24,33,31,0.12)]">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div><p className="text-sm font-bold text-ink">Your website</p><p className="text-xs text-muted">Click any section to change it</p></div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${isDirty ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}>{isDirty ? "Unsaved changes" : "Saved"}</span>
            </div>
            <div ref={previewScroller} className="max-h-[calc(100vh-180px)] overflow-auto bg-[#edf1ef] p-2 sm:p-4">
              <div className="mx-auto min-h-[620px] overflow-hidden rounded-lg bg-white shadow-lg">
                <div onClickCapture={handlePreviewNavigation}>
                  {preview ? <SiteRenderer preview={preview} pageSlug={currentPageSlug} editor={{ selectedSectionId: selectedSectionId ?? undefined, onSelectSection: (sectionId) => selectSection(sectionId, "preview") }} /> : <div className="flex min-h-[500px] items-center justify-center p-8 text-center"><div><h3 className="font-bold text-ink">Choose a design first</h3><p className="mt-2 text-sm text-muted">The website preview will appear here.</p></div></div>}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PreviewContext.Provider>
  );
}
