import { ContactMapForm as ContactForm } from "@/components/site-renderer/sections/shared";
import type { SectionComponentProps } from "@/lib/site-renderer/template-types";
import type { contactSchema } from "@/lib/site-renderer/section-schemas";
import type { z } from "zod";

export function ContactMapForm({ content }: SectionComponentProps<z.infer<typeof contactSchema>>) {
  return <ContactForm content={content} />;
}
