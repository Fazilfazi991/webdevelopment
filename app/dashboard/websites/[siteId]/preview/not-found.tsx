import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";

export default function PreviewNotFound() {
  return (
    <div className="min-h-screen bg-canvas p-6">
      <EmptyState
        title="This preview is not available"
        description="The website or page could not be found."
        action={<ButtonLink href="/dashboard/websites">Back to websites</ButtonLink>}
      />
    </div>
  );
}
