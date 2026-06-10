import { FloatingWhatsapp as Floating } from "@/components/site-renderer/sections/shared";
import type { SectionComponentProps } from "@/lib/site-renderer/template-types";
import type { floatingActionSchema } from "@/lib/site-renderer/section-schemas";
import type { z } from "zod";

export function FloatingWhatsapp({ content }: SectionComponentProps<z.infer<typeof floatingActionSchema>>) {
  return <Floating content={content} />;
}
