"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { generateFieldAiSuggestionAction } from "@/app/ai-actions";
import { Button } from "@/components/ui/button";
import { isAiAvailable } from "@/lib/ai/provider";

type AiAction = "rewrite" | "shorten" | "grammar_fix" | "translation";

const AI_ACTIONS: { type: AiAction; label: string; instruction?: string }[] = [
  { type: "rewrite", label: "Improve writing" },
  { type: "shorten", label: "Make shorter" },
  { type: "rewrite", label: "Make more professional", instruction: "Make this more professional while preserving the meaning." },
  { type: "grammar_fix", label: "Fix grammar" },
  { type: "translation", label: "Translate to Arabic" }
];

export function AiImproveButton({
  siteId,
  sectionKey,
  fieldKey,
  currentValue,
  canEdit
}: {
  siteId: string;
  sectionKey?: string;
  fieldKey: string;
  currentValue: string;
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!isAiAvailable()) {
    return (
      <p className="text-xs text-muted">AI unavailable in this environment.</p>
    );
  }

  function runAction(action: (typeof AI_ACTIONS)[number]) {
    const formData = new FormData();
    formData.set("siteId", siteId);
    formData.set("requestType", action.type);
    formData.set("sectionKey", sectionKey ?? "");
    formData.set("fieldKey", fieldKey);
    formData.set("currentValue", currentValue);
    formData.set("language", action.type === "translation" ? "Arabic" : "English");
    formData.set("instruction", action.instruction ?? "");
    setOpen(false);
    startTransition(() => {
      void generateFieldAiSuggestionAction(formData);
    });
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="secondary"
        className="flex w-full items-center justify-center gap-2 text-sm"
        disabled={!canEdit || !currentValue || isPending}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Sparkles size={14} />
        {isPending ? "Generating…" : "Improve with AI"}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-1 w-full min-w-[200px] overflow-hidden rounded-app border border-line bg-white shadow-lg"
        >
          {AI_ACTIONS.map((action) => (
            <button
              key={`${action.type}-${action.label}`}
              role="menuitem"
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-ink transition hover:bg-canvas disabled:opacity-50"
              disabled={!canEdit || !currentValue || isPending}
              onClick={() => runAction(action)}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
