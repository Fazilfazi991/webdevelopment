import type { LoadedTemplatePreview } from "@/lib/site-renderer/template-types";
import { sectionsForPage } from "@/lib/site-renderer/template-loader";
import { PageRenderer } from "@/components/site-renderer/page-renderer";
import { SiteThemeProvider } from "@/components/site-renderer/theme-provider";

export function SiteRenderer({ preview, pageSlug }: { preview: LoadedTemplatePreview; pageSlug: string }) {
  return (
    <SiteThemeProvider theme={preview.theme}>
      <div className="site-preview min-w-0 overflow-x-hidden [overflow-wrap:normal]">
        <PageRenderer pageSlug={pageSlug} sections={sectionsForPage(preview, pageSlug)} />
      </div>
    </SiteThemeProvider>
  );
}
