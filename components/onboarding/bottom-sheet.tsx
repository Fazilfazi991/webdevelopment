"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Prevent background scroll while sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-lg rounded-t-2xl bg-white shadow-2xl",
          "animate-in slide-in-from-bottom duration-300",
          className
        )}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-line" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-base font-bold text-ink">{title}</h2>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-app border border-line text-muted transition hover:bg-canvas"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-5 pb-8 pt-4">{children}</div>
      </div>
    </div>
  );
}

// A large action button styled for use inside bottom sheets
export function BottomSheetAction({
  icon,
  label,
  sublabel,
  onClick,
  href,
  variant = "default",
  className
}: {
  icon?: React.ReactNode;
  label: string;
  sublabel?: string;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "primary" | "danger";
  className?: string;
}) {
  const base = cn(
    "flex w-full min-h-[56px] items-center gap-4 rounded-xl border px-4 py-3 text-left transition active:scale-[0.98]",
    variant === "primary" && "border-brand-700 bg-brand-700 text-white hover:bg-brand-900",
    variant === "danger" && "border-red-200 bg-red-50 text-danger hover:bg-red-100",
    variant === "default" && "border-line bg-white text-ink hover:bg-canvas",
    className
  );

  const inner = (
    <>
      {icon && <span className="shrink-0 text-[1.1rem]">{icon}</span>}
      <span className="flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        {sublabel && <span className="mt-0.5 block text-xs font-normal opacity-70">{sublabel}</span>}
      </span>
    </>
  );

  if (href) {
    return <a href={href} className={base}>{inner}</a>;
  }

  return <button type="button" onClick={onClick} className={base}>{inner}</button>;
}
