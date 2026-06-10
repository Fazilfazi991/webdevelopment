import { Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

export function PreviewConcept({
  title,
  style,
  compact = false
}: {
  title: string;
  style?: string | null;
  compact?: boolean;
}) {
  return (
    <div className={cn("rounded-app border border-line bg-white p-3", compact ? "h-36" : "h-72")}>
      <div className="flex h-full gap-3">
        <div className="flex-1 overflow-hidden rounded-app border border-line bg-canvas">
          <div className="border-b border-line bg-white px-3 py-2">
            <div className="h-2 w-24 rounded-full bg-brand-700" />
          </div>
          <div className="grid gap-3 p-4">
            <div className="h-5 w-3/4 rounded-full bg-ink" />
            <div className="h-3 w-full rounded-full bg-line" />
            <div className="h-3 w-5/6 rounded-full bg-line" />
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="h-10 rounded-app bg-brand-100" />
              <div className="h-10 rounded-app bg-white" />
              <div className="h-10 rounded-app bg-gold/20" />
            </div>
          </div>
        </div>
        {!compact ? (
          <div className="hidden w-24 rounded-[14px] border border-line bg-canvas p-2 sm:block">
            <div className="mb-2 flex justify-center text-muted">
              <Smartphone size={14} />
            </div>
            <div className="grid gap-2 rounded-app bg-white p-2">
              <div className="h-2 rounded-full bg-brand-700" />
              <div className="h-8 rounded bg-brand-100" />
              <div className="h-2 rounded-full bg-line" />
              <div className="h-2 rounded-full bg-line" />
            </div>
          </div>
        ) : null}
      </div>
      <p className="mt-2 truncate text-xs font-semibold text-muted">
        Preview concept{style ? ` - ${style}` : ""} - {title}
      </p>
    </div>
  );
}
