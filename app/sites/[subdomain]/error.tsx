"use client";

import { Button } from "@/components/ui/button";

export default function PublicSiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-6 text-center">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">This website could not load</h1>
        <p className="mt-2 text-sm text-slate-600">Please try again.</p>
        <Button type="button" onClick={reset} className="mt-5">Try again</Button>
      </div>
    </main>
  );
}
