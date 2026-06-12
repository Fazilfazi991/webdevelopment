import type { SiteMedia } from "@/lib/types";

export const siteMediaSlots = [
  "logo",
  "logo-dark",
  "hero",
  "about",
  "service",
  "service:ac-maintenance",
  "service:electrical",
  "service:plumbing",
  "service:painting",
  "service:interior-repairs",
  "service:preventive-maintenance",
  "gallery",
  "gallery:project-01",
  "gallery:project-02",
  "gallery:project-03",
  "gallery:project-04",
  "favicon",
  "social-share",
  "general"
] as const;

export type SiteMediaSlot = (typeof siteMediaSlots)[number];

type ImageValue = {
  src: string;
  alt: string;
};

const serviceTitleSlots: Record<string, SiteMediaSlot> = {
  "ac-maintenance": "service:ac-maintenance",
  "electrical-services": "service:electrical",
  "plumbing-solutions": "service:plumbing",
  "painting-services": "service:painting",
  "interior-repairs": "service:interior-repairs",
  "preventive-maintenance": "service:preventive-maintenance"
};

const galleryTitleSlots: Record<string, SiteMediaSlot> = {
  "apartment-ac-service": "gallery:project-01",
  "office-electrical-checks": "gallery:project-02",
  "villa-plumbing-support": "gallery:project-03",
  "preventive-maintenance-visit": "gallery:project-04"
};

const galleryIndexSlots: SiteMediaSlot[] = ["gallery:project-01", "gallery:project-02", "gallery:project-03", "gallery:project-04"];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function slotFromImageSrc(src?: string): SiteMediaSlot | null {
  if (!src) return null;
  const match = src.match(/technical-services-modern\/(?:services|projects)\/([^/.]+)/);
  if (!match) return null;
  const key = match[1];
  if (src.includes("/services/")) return (`service:${key}` as SiteMediaSlot);
  const projectMatch = key.match(/project-0[1-4]/);
  return projectMatch ? (`gallery:${projectMatch[0]}` as SiteMediaSlot) : null;
}

export function baseSlot(slot: SiteMediaSlot): SiteMediaSlot {
  if (slot.startsWith("service:")) return "service";
  if (slot.startsWith("gallery:")) return "gallery";
  return slot;
}

export function mediaSlotLabel(slot: SiteMediaSlot | string) {
  const labels: Record<SiteMediaSlot, string> = {
    logo: "Logo",
    "logo-dark": "Logo for dark backgrounds",
    hero: "Hero image",
    about: "About image",
    service: "Service image",
    "service:ac-maintenance": "Service: AC maintenance",
    "service:electrical": "Service: Electrical",
    "service:plumbing": "Service: Plumbing",
    "service:painting": "Service: Painting",
    "service:interior-repairs": "Service: Interior repairs",
    "service:preventive-maintenance": "Service: Preventive maintenance",
    gallery: "Project gallery image",
    "gallery:project-01": "Gallery: Project 01",
    "gallery:project-02": "Gallery: Project 02",
    "gallery:project-03": "Gallery: Project 03",
    "gallery:project-04": "Gallery: Project 04",
    favicon: "Favicon",
    "social-share": "Social share image",
    general: "General library"
  };
  return labels[slot as SiteMediaSlot] ?? "General library";
}

export function isSiteMediaSlot(value: string): value is SiteMediaSlot {
  return siteMediaSlots.includes(value as SiteMediaSlot);
}

export function resolveSiteMediaSlot({
  sectionKey,
  itemTitle,
  itemIndex,
  imageSrc
}: {
  sectionKey: string;
  itemTitle?: string;
  itemIndex?: number;
  imageSrc?: string;
}): SiteMediaSlot | null {
  const srcSlot = slotFromImageSrc(imageSrc);
  if (srcSlot) return srcSlot;
  const titleSlug = itemTitle ? slugify(itemTitle) : "";

  if (sectionKey.includes("hero")) return "hero";
  if (sectionKey.includes("about")) return "about";
  if (sectionKey.includes("service")) return serviceTitleSlots[titleSlug] ?? "service";
  if (sectionKey.includes("gallery") || sectionKey.includes("project")) {
    return galleryTitleSlots[titleSlug] ?? (typeof itemIndex === "number" ? galleryIndexSlots[itemIndex] : null) ?? "gallery";
  }

  return null;
}

export function mediaForSlot(media: SiteMedia[], slot: SiteMediaSlot | null) {
  if (!slot) return null;
  const exact = media.find((item) => item.usage_type === slot && item.signed_url);
  if (exact) return exact;
  const fallback = baseSlot(slot);
  if (fallback !== slot) return media.find((item) => item.usage_type === fallback && item.signed_url) ?? null;
  return null;
}

function mediaImage(media: SiteMedia[], slot: SiteMediaSlot | null): ImageValue | null {
  const match = mediaForSlot(media, slot);
  if (!match?.signed_url) return null;
  return {
    src: match.signed_url,
    alt: match.alt_text || match.file_name
  };
}

function withMediaImage(content: Record<string, unknown>, sectionKey: string, media: SiteMedia[]) {
  const currentImage = content.image && typeof content.image === "object" ? (content.image as Partial<ImageValue>) : {};
  const image = mediaImage(media, resolveSiteMediaSlot({ sectionKey, imageSrc: currentImage.src }));
  return image ? { ...content, image } : content;
}

export function applyMediaOverridesToContent(content: unknown, sectionKey: string, media: SiteMedia[]) {
  const current = content && typeof content === "object" && !Array.isArray(content) ? { ...(content as Record<string, unknown>) } : {};

  if (Array.isArray(current.items)) {
    return {
      ...current,
      items: current.items.map((item, index) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) return item;
        const itemRecord = { ...(item as Record<string, unknown>) };
        const itemImage = itemRecord.image && typeof itemRecord.image === "object" ? (itemRecord.image as Partial<ImageValue>) : {};
        const slot = resolveSiteMediaSlot({
          sectionKey,
          itemTitle: typeof itemRecord.title === "string" ? itemRecord.title : undefined,
          itemIndex: index,
          imageSrc: itemImage.src
        });
        const image = mediaImage(media, slot);
        return image ? { ...itemRecord, image } : itemRecord;
      })
    };
  }

  return withMediaImage(current, sectionKey, media);
}

export function applyLocalImageToContent(content: unknown, sectionKey: string, slot: SiteMediaSlot, image: ImageValue) {
  const current = content && typeof content === "object" && !Array.isArray(content) ? { ...(content as Record<string, unknown>) } : {};
  if (Array.isArray(current.items)) {
    return {
      ...current,
      items: current.items.map((item, index) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) return item;
        const record = { ...(item as Record<string, unknown>) };
        const currentImage = record.image && typeof record.image === "object" ? record.image as Partial<ImageValue> : {};
        const resolved = resolveSiteMediaSlot({ sectionKey, itemTitle: typeof record.title === "string" ? record.title : undefined, itemIndex: index, imageSrc: currentImage.src });
        return resolved === slot || baseSlot(resolved ?? "general") === slot ? { ...record, image } : record;
      })
    };
  }
  const resolved = resolveSiteMediaSlot({ sectionKey, imageSrc: (current.image as Partial<ImageValue> | undefined)?.src });
  return resolved === slot || baseSlot(resolved ?? "general") === slot ? { ...current, image } : current;
}
