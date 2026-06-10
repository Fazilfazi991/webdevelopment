import { HeaderStandard } from "@/components/site-renderer/sections/shared";
import type { SectionComponentProps } from "@/lib/site-renderer/template-types";
import type { headerSchema } from "@/lib/site-renderer/section-schemas";
import type { z } from "zod";

export function HeaderTopbarStandard({ content }: SectionComponentProps<z.infer<typeof headerSchema>>) {
  return <HeaderStandard content={content} />;
}
