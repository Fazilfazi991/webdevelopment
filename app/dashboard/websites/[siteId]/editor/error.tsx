"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";

export default function EditorError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-canvas p-6">
      <EmptyState
        title="We could not load the editor"
        description="Please try again or return to your website list."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" onClick={reset}>Try again</Button>
            <ButtonLink href="/dashboard/websites" variant="secondary">Back to websites</ButtonLink>
          </div>
        }
      />
    </div>
  );
}
