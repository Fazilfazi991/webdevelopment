import type { SiteMedia } from "@/lib/types";

export type ImagePack = {
  name: string;
  images: Partial<Record<SiteMedia["usage_type"], string>>;
};

export const technicalServicesImagePack: ImagePack = {
  name: "Technical Services Modern",
  images: {
    hero: "/templates/technical-services-modern/hero.webp",
    about: "/templates/technical-services-modern/about.webp",
    "service:ac-maintenance": "/templates/technical-services-modern/services/ac-maintenance.webp",
    "service:electrical": "/templates/technical-services-modern/services/electrical.webp",
    "service:plumbing": "/templates/technical-services-modern/services/plumbing.webp",
    "service:painting": "/templates/technical-services-modern/services/painting.webp",
    "service:interior-repairs": "/templates/technical-services-modern/services/interior-repairs.webp",
    "service:preventive-maintenance": "/templates/technical-services-modern/services/preventive-maintenance.webp",
    "gallery:project-01": "/templates/technical-services-modern/projects/project-01.webp",
    "gallery:project-02": "/templates/technical-services-modern/projects/project-02.webp",
    "gallery:project-03": "/templates/technical-services-modern/projects/project-03.webp",
    "gallery:project-04": "/templates/technical-services-modern/projects/project-04.webp"
  }
};

export const curatedImagePacks: Record<string, ImagePack> = {
  "technical-services": technicalServicesImagePack,
  cleaning: {
    name: "Cleaning Services",
    images: {
      hero: "/image-packs/cleaning/hero.webp",
      about: "/image-packs/cleaning/about.webp",
      service: "/image-packs/cleaning/service.webp",
      gallery: "/image-packs/cleaning/project.webp"
    }
  },
  "car-care": {
    name: "Car Care",
    images: {
      hero: "/image-packs/car-care/hero.webp",
      about: "/image-packs/car-care/about.webp",
      service: "/image-packs/car-care/service.webp",
      gallery: "/image-packs/car-care/project.webp"
    }
  }
};

export function technicalFallback(slot: SiteMedia["usage_type"], index = 0) {
  const direct = technicalServicesImagePack.images[slot];
  if (direct) return direct;
  if (slot === "service") {
    const serviceSlots = ["service:ac-maintenance", "service:electrical", "service:plumbing", "service:painting"] as const;
    return technicalServicesImagePack.images[serviceSlots[index % serviceSlots.length]];
  }
  if (slot === "gallery") {
    const gallerySlots = ["gallery:project-01", "gallery:project-02", "gallery:project-03", "gallery:project-04"] as const;
    return technicalServicesImagePack.images[gallerySlots[index % gallerySlots.length]];
  }
  return undefined;
}
