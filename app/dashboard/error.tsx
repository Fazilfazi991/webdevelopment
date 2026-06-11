"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <EmptyState
      title="We could not load your dashboard"
      description="Please try again. Your data is safe."
      action={<Button type="button" onClick={reset}>Try again</Button>}
    />
  );
}
