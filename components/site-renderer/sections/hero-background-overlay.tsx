import { HeroBackground } from "@/components/site-renderer/sections/shared";
import type { SectionComponentProps } from "@/lib/site-renderer/template-types";
import type { heroBackgroundSchema } from "@/lib/site-renderer/section-schemas";
import type { z } from "zod";

export function HeroBackgroundOverlay({ content }: SectionComponentProps<z.infer<typeof heroBackgroundSchema>>) {
  return <HeroBackground content={content} />;
}
