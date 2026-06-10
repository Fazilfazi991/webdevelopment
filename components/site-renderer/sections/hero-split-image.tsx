import { HeroSplit } from "@/components/site-renderer/sections/shared";
import type { SectionComponentProps } from "@/lib/site-renderer/template-types";
import type { heroSplitSchema } from "@/lib/site-renderer/section-schemas";
import type { z } from "zod";

export function HeroSplitImage({ content }: SectionComponentProps<z.infer<typeof heroSplitSchema>>) {
  return <HeroSplit content={content} />;
}
