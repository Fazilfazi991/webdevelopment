"use client";

import Link from "next/link";
import { RotateCw } from "lucide-react";

export default function WebsiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="flex min-h-[55vh] items-center justify-center px-4"><div className="w-full max-w-lg rounded-xl border border-line bg-white p-6 text-center shadow-soft"><h1 className="text-xl font-bold text-ink">We could not open this website.</h1><p className="mt-2 text-sm leading-6 text-muted">Please try again. If the issue continues, return to your websites.</p><div className="mt-5 grid gap-2 sm:grid-cols-2"><button onClick={reset} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-app bg-brand-700 px-4 text-sm font-bold text-white"><RotateCw size={16} />Try Again</button><Link href="/dashboard/websites" className="inline-flex min-h-11 items-center justify-center rounded-app border border-line px-4 text-sm font-bold text-ink">Back to My Websites</Link></div></div></div>;
}
