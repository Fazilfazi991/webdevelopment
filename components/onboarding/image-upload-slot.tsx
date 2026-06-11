"use client";

import { useRef, useState } from "react";
import { Camera, Image as ImageIcon, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadSlotProps {
  label: string;
  hint?: string;
  value?: File | null;
  previewUrl?: string | null;
  onChange: (file: File | null) => void;
  accept?: string;
  /** Controls whether the camera capture input is preferred on mobile */
  preferCamera?: boolean;
  className?: string;
}

export function ImageUploadSlot({
  label,
  hint,
  value,
  previewUrl,
  onChange,
  accept = "image/*",
  className
}: ImageUploadSlotProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [blurryWarning, setBlurryWarning] = useState(false);

  const preview = localPreview ?? previewUrl ?? null;

  function handleFile(file: File | null) {
    setBlurryWarning(false);
    if (!file) { onChange(null); setLocalPreview(null); return; }

    // Client-side image dimension check for quality warning
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      if (img.naturalWidth < 1000) setBlurryWarning(true);
      URL.revokeObjectURL(url);
    };
    img.src = url;

    setLocalPreview(url);
    onChange(file);
  }

  const hasImage = Boolean(preview || value);

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-semibold text-ink">{label}</p>
      {hint && <p className="text-xs text-muted">{hint}</p>}

      {hasImage ? (
        /* Preview state */
        <div className="relative overflow-hidden rounded-xl border border-line bg-canvas">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview ?? ""}
            alt="Preview"
            className="h-40 w-full object-cover"
          />
          <button
            type="button"
            onClick={() => { setLocalPreview(null); setBlurryWarning(false); onChange(null); }}
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"
            aria-label="Remove image"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ) : (
        /* Upload state */
        <div className="grid gap-2">
          {/* Take Photo (opens camera on mobile) */}
          <label className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-4 transition hover:bg-canvas active:scale-[0.99]">
            <Camera size={20} className="shrink-0 text-brand-700" />
            <span className="text-sm font-semibold text-ink">Take Photo</span>
            <input
              ref={cameraRef}
              type="file"
              accept={accept}
              capture="environment"
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </label>

          {/* Choose from Gallery */}
          <label className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-4 transition hover:bg-canvas active:scale-[0.99]">
            <ImageIcon size={20} className="shrink-0 text-brand-700" />
            <span className="text-sm font-semibold text-ink">Choose from Gallery</span>
            <input
              ref={galleryRef}
              type="file"
              accept={accept}
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      )}

      {/* Blurry image warning */}
      {blurryWarning && (
        <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          <Upload size={14} className="mt-0.5 shrink-0" />
          This image may look blurry on larger screens. You can continue or choose another photo.
        </p>
      )}
    </div>
  );
}
