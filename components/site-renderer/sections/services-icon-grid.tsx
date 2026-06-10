import { ServicesGrid } from "@/components/site-renderer/sections/shared";
import type { SectionComponentProps } from "@/lib/site-renderer/template-types";
import type { servicesGridSchema } from "@/lib/site-renderer/section-schemas";
import type { z } from "zod";

export function ServicesIconGrid({ content }: SectionComponentProps<z.infer<typeof servicesGridSchema>>) {
  return <ServicesGrid content={content} compact />;
}
