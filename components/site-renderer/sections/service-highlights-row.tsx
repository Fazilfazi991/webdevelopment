import { ServiceHighlights } from "@/components/site-renderer/sections/shared";
import type { SectionComponentProps } from "@/lib/site-renderer/template-types";
import type { serviceHighlightsSchema } from "@/lib/site-renderer/section-schemas";
import type { z } from "zod";

export function ServiceHighlightsRow({ content }: SectionComponentProps<z.infer<typeof serviceHighlightsSchema>>) {
  return <ServiceHighlights content={content} />;
}
