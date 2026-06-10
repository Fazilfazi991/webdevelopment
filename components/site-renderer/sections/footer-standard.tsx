import { FooterStandard as Footer } from "@/components/site-renderer/sections/shared";
import type { SectionComponentProps } from "@/lib/site-renderer/template-types";
import type { footerSchema } from "@/lib/site-renderer/section-schemas";
import type { z } from "zod";

export function FooterStandard({ content }: SectionComponentProps<z.infer<typeof footerSchema>>) {
  return <Footer content={content} />;
}
