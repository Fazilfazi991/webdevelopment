import { FaqAccordion as Faq } from "@/components/site-renderer/sections/shared";
import type { SectionComponentProps } from "@/lib/site-renderer/template-types";
import type { faqSchema } from "@/lib/site-renderer/section-schemas";
import type { z } from "zod";

export function FaqAccordion({ content }: SectionComponentProps<z.infer<typeof faqSchema>>) {
  return <Faq content={content} />;
}
