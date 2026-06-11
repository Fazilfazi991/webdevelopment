import { PreviewToolbar } from "@/components/site-renderer/preview-toolbar";
import { Card } from "@/components/ui/card";

export default function PreviewLoading() {
  return (
    <div className="min-h-screen bg-canvas">
      <PreviewToolbar siteId="" pages={[]} currentPageSlug="home" />
      <div className="mx-auto max-w-7xl p-4">
        <Card className="flex min-h-[70vh] animate-pulse items-center justify-center p-8 text-sm font-semibold text-muted">
          Loading your website preview...
        </Card>
      </div>
    </div>
  );
}
