import { Testimonials } from "@/components/site-renderer/sections/shared";
import type { SectionComponentProps } from "@/lib/site-renderer/template-types";
import type { testimonialsSchema } from "@/lib/site-renderer/section-schemas";
import type { z } from "zod";

export function TestimonialsCards({ content }: SectionComponentProps<z.infer<typeof testimonialsSchema>>) {
  return <Testimonials content={content} />;
}
