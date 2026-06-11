"use client";

import { useRef, useState, useTransition } from "react";
import { saveMediaMetadataAction } from "@/app/editor-actions";
import { Button } from "@/components/ui/button";
import { Field, inputClassName } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";
import type { SiteMedia } from "@/lib/types";

const supportedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const maxFileSize = 5 * 1024 * 1024;

function safeFilePart(name: string) {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "image";
}

function extensionFor(file: File) {
  const current = file.name.split(".").pop();
  if (current) return current.toLowerCase();
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/svg+xml") return "svg";
  return "jpg";
}

function imageDimensions(file: File) {
  return new Promise<{ width?: number; height?: number }>((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({});
    };
    img.src = url;
  });
}

function dimensionWarning(usageType: string, width?: number, height?: number) {
  if (!width || !height) return "Dimensions could not be detected. Replace the image if the preview looks soft.";
  const rules: Record<string, [number, number]> = {
    logo: [300, 120],
    hero: [1600, 900],
    about: [1200, 900],
    service: [800, 600],
    gallery: [1200, 900]
  };
  const rule = rules[usageType];
  if (!rule) return "";
  return width < rule[0] || height < rule[1] ? `Recommended minimum for this use is ${rule[0]} x ${rule[1]}.` : "";
}

export function ImageUploader({
  siteId,
  organizationId,
  media,
  canEdit
}: {
  siteId: string;
  organizationId: string;
  media: SiteMedia[];
  canEdit: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [usageType, setUsageType] = useState<SiteMedia["usage_type"]>("hero");
  const [altText, setAltText] = useState("");
  const [replaceMediaId, setReplaceMediaId] = useState("");
  const [status, setStatus] = useState("");
  const [warning, setWarning] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleUpload() {
    if (!canEdit) return;
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setStatus("Choose an image first.");
      return;
    }
    if (!supportedTypes.includes(file.type)) {
      setStatus("Choose a JPEG, PNG, WebP, or SVG image.");
      return;
    }
    if (file.size > maxFileSize) {
      setStatus("Keep images under 5 MB.");
      return;
    }

    setStatus("Checking image...");
    const dimensions = await imageDimensions(file);
    setWarning(dimensionWarning(usageType, dimensions.width, dimensions.height));
    const storagePath = `organizations/${organizationId}/sites/${siteId}/${crypto.randomUUID()}-${safeFilePart(file.name)}.${extensionFor(file)}`;

    setStatus("Uploading image...");
    const supabase = createClient();
    const { error } = await supabase.storage.from("site-media").upload(storagePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false
    });
    if (error) {
      setStatus("Upload failed. Check the file and try again.");
      return;
    }

    setStatus("Saving image details...");
    const formData = new FormData();
    formData.set("siteId", siteId);
    formData.set("storagePath", storagePath);
    formData.set("replaceMediaId", replaceMediaId);
    formData.set("usageType", usageType);
    formData.set("fileName", file.name);
    formData.set("mimeType", file.type);
    formData.set("fileSize", String(file.size));
    if (dimensions.width) formData.set("width", String(dimensions.width));
    if (dimensions.height) formData.set("height", String(dimensions.height));
    formData.set("altText", altText);
    startTransition(() => {
      void saveMediaMetadataAction(formData);
    });
  }

  return (
    <div className="mt-4 grid gap-3">
      <Field label="Usage type">
        <select className={inputClassName} value={usageType} onChange={(event) => setUsageType(event.target.value as SiteMedia["usage_type"])} disabled={!canEdit || isPending}>
          <option value="logo">Logo</option>
          <option value="hero">Hero image</option>
          <option value="about">About image</option>
          <option value="service">Service image</option>
          <option value="gallery">Project gallery</option>
          <option value="general">General library</option>
        </select>
      </Field>
      <Field label="Replace existing image">
        <select className={inputClassName} value={replaceMediaId} onChange={(event) => setReplaceMediaId(event.target.value)} disabled={!canEdit || isPending}>
          <option value="">Add as new image</option>
          {media.map((item) => (
            <option key={item.id} value={item.id}>
              Replace {item.usage_type}: {item.file_name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Image file">
        <input ref={fileRef} className={inputClassName} type="file" accept={supportedTypes.join(",")} disabled={!canEdit || isPending} />
      </Field>
      <Field label="Alt text">
        <input className={inputClassName} value={altText} onChange={(event) => setAltText(event.target.value)} maxLength={180} disabled={!canEdit || isPending} />
      </Field>
      <p className="rounded-app bg-canvas p-3 text-sm text-muted">Guidance: Logo PNG/SVG, hero 1600 x 900+, about 1200 x 900+, service 800 x 600+, gallery 1200 x 900+.</p>
      {warning ? <p className="rounded-app border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">{warning}</p> : null}
      {status ? <p className="text-sm font-semibold text-muted" aria-live="polite">{isPending ? "Saving image details..." : status}</p> : null}
      <Button type="button" onClick={handleUpload} disabled={!canEdit || isPending}>
        {isPending ? "Uploading..." : "Upload image"}
      </Button>
    </div>
  );
}
