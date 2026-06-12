import { ArrowLeft, Monitor, Smartphone, Tablet } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import type { TemplatePage } from "@/lib/types";
import { cn } from "@/lib/utils";

const devices = [
  { key: "desktop", label: "Desktop preview", icon: Monitor, width: "max-w-none" },
  { key: "tablet", label: "Tablet preview", icon: Tablet, width: "max-w-[768px]" },
  { key: "mobile", label: "Mobile preview", icon: Smartphone, width: "w-full max-w-[430px]" }
] as const;

export function previewDeviceClass(device?: string) {
  return devices.find((item) => item.key === device)?.width ?? devices[0].width;
}

export function PreviewToolbar({
  siteId,
  pages,
  currentPageSlug,
  device
}: {
  siteId: string;
  pages: TemplatePage[];
  currentPageSlug: string;
  device?: string;
}) {
  const currentDevice = devices.some((item) => item.key === device) ? device : "desktop";

  return (
    <div className="sticky top-0 z-40 border-b border-line bg-white/95 px-2 py-2 backdrop-blur sm:px-4 sm:py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
        <ButtonLink href="/dashboard/websites" variant="secondary" className="shrink-0 px-3">
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back to dashboard</span>
          <span className="sm:hidden">Back</span>
        </ButtonLink>
        <div className="flex min-w-0 items-center justify-end gap-2">
          <label className="sr-only" htmlFor="preview-page-links">
            Page selector
          </label>
          <div id="preview-page-links" className="hidden max-w-full gap-1 overflow-x-auto rounded-app border border-line bg-canvas p-1 md:flex">
            {pages.map((page) => (
              <ButtonLink
                key={page.page_slug}
                href={`/dashboard/websites/${siteId}/preview/${page.page_slug}?device=${currentDevice}`}
                variant={page.page_slug === currentPageSlug ? "primary" : "ghost"}
                className="min-h-9 px-3"
              >
                {page.page_name}
              </ButtonLink>
            ))}
          </div>
          <div className="flex gap-1 rounded-app border border-line bg-canvas p-1" aria-label="Preview viewport">
            {devices.map((item) => {
              const Icon = item.icon;
              const active = item.key === currentDevice;
              const pagePath = currentPageSlug === "home" ? "" : `/${currentPageSlug}`;
              return (
                <ButtonLink
                  key={item.key}
                  href={`/dashboard/websites/${siteId}/preview${pagePath}?device=${item.key}`}
                  variant={active ? "primary" : "ghost"}
                  className={cn("min-h-9 px-3", active && "pointer-events-none")}
                  aria-label={item.label}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{item.key}</span>
                </ButtonLink>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
