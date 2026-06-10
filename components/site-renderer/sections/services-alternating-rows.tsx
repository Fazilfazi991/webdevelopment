import { ServicesRows } from "@/components/site-renderer/sections/shared";
import type { SectionComponentProps } from "@/lib/site-renderer/template-types";
import type { servicesRowsSchema } from "@/lib/site-renderer/section-schemas";
import type { z } from "zod";

export function ServicesAlternatingRows({ content }: SectionComponentProps<z.infer<typeof servicesRowsSchema>>) {
  return <ServicesRows content={content} />;
}
