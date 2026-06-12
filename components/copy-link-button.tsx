"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyLinkButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return <button type="button" onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-semibold transition-transform active:scale-[0.96]">{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy Link"}</button>;
}
