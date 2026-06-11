"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";

export default function WebsitesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <EmptyState
      title="We could not load your websites"
      description="Please try again."
      action={<Button type="button" onClick={reset}>Try again</Button>}
    />
  );
}
