import { WhyChoose } from "@/components/site-renderer/sections/shared";
import type { SectionComponentProps } from "@/lib/site-renderer/template-types";
import type { whyChooseSchema } from "@/lib/site-renderer/section-schemas";
import type { z } from "zod";

export function WhyChooseUsGrid({ content }: SectionComponentProps<z.infer<typeof whyChooseSchema>>) {
  return <WhyChoose content={content} />;
}
