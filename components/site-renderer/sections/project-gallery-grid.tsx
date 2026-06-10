import { ProjectGallery } from "@/components/site-renderer/sections/shared";
import type { SectionComponentProps } from "@/lib/site-renderer/template-types";
import type { gallerySchema } from "@/lib/site-renderer/section-schemas";
import type { z } from "zod";

export function ProjectGalleryGrid({ content }: SectionComponentProps<z.infer<typeof gallerySchema>>) {
  return <ProjectGallery content={content} />;
}
