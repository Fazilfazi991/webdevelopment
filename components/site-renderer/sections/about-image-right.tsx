import { AboutSection } from "@/components/site-renderer/sections/shared";
import type { SectionComponentProps } from "@/lib/site-renderer/template-types";
import type { aboutSchema } from "@/lib/site-renderer/section-schemas";
import type { z } from "zod";

export function AboutImageRight({ content }: SectionComponentProps<z.infer<typeof aboutSchema>>) {
  return <AboutSection content={content} imageSide="right" />;
}
