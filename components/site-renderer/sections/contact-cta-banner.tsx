import { ContactCta } from "@/components/site-renderer/sections/shared";
import type { SectionComponentProps } from "@/lib/site-renderer/template-types";
import type { ctaSchema } from "@/lib/site-renderer/section-schemas";
import type { z } from "zod";

export function ContactCtaBanner({ content }: SectionComponentProps<z.infer<typeof ctaSchema>>) {
  return <ContactCta content={content} />;
}
