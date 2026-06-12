"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function BrandingError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  console.error("Branding route failed", error);
  return (
    <div className="mx-auto max-w-3xl">
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-1 text-danger" />
          <div>
            <h1 className="text-2xl font-bold text-ink">Branding could not load</h1>
            <p className="mt-2 text-sm text-muted">Refresh the page or try again in a moment. Your website content is unchanged.</p>
            <Button type="button" onClick={reset} className="mt-4">Try Again</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
