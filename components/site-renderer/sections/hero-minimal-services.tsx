import { HeroMinimal } from "@/components/site-renderer/sections/shared";
import type { SectionComponentProps } from "@/lib/site-renderer/template-types";
import type { heroMinimalSchema } from "@/lib/site-renderer/section-schemas";
import type { z } from "zod";

export function HeroMinimalServices({ content }: SectionComponentProps<z.infer<typeof heroMinimalSchema>>) {
  return <HeroMinimal content={content} />;
}
