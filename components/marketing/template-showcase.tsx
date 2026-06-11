import Link from "next/link";
import { TEMPLATES } from "./marketing-content";

// ---------------------------------------------------------------------------
// CSS-built template preview cards — replace with real screenshots when ready.
// TODO: Place actual template screenshots at:
//   public/images/templates/construction-pro.jpg (16:10 aspect ratio, 800×500px)
//   public/images/templates/health-clinic.jpg
//   public/images/templates/salon-beauty.jpg
// ---------------------------------------------------------------------------

interface TemplatePreviewProps {
  template: (typeof TEMPLATES)[0];
}

function TemplatePreviewCard({ template }: TemplatePreviewProps) {
  return (
    <div className="group min-w-0 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Preview area (CSS mock) */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: "16/10", background: `linear-gradient(135deg, ${template.bgFrom} 0%, ${template.bgTo} 100%)` }}
        aria-label={`${template.name} template preview`}
      >
        {/* Simulated browser bar */}
        <div className="flex items-center gap-1 bg-black/30 px-2 py-1.5">
          <span className="h-2 w-2 rounded-full bg-red-400/70" />
          <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
          <span className="h-2 w-2 rounded-full bg-green-400/70" />
          <div className="mx-2 min-w-0 flex-1 truncate rounded-sm bg-white/10 px-2 py-0.5 text-xs text-white/50">
            yourbusiness.com
          </div>
        </div>

        {/* Simulated nav */}
        <div className="flex items-center justify-between px-3 py-1.5 text-xs">
          <span className="font-bold text-white">{template.category}</span>
          <div className="hidden gap-2 text-white/60 sm:flex">
            <span>About</span>
            <span>Services</span>
            <span>Contact</span>
            <span
              className="rounded px-1.5 py-0.5 text-white"
              style={{ backgroundColor: template.accentColor }}
            >
              Enquire
            </span>
          </div>
        </div>

        {/* Hero content area */}
        <div className="flex flex-col justify-center px-4 py-3">
          <div className="max-w-[78%] sm:max-w-[60%]">
            <div
              className="mb-1 h-1 w-12 rounded"
              style={{ backgroundColor: template.accentColor }}
            />
            <p className="whitespace-pre-line text-sm font-bold leading-snug text-white">
              {template.tagline}
            </p>
            <div className="mt-2 space-y-1">
              <div className="h-1.5 w-full rounded bg-white/20" />
              <div className="h-1.5 w-3/4 rounded bg-white/15" />
            </div>
            <div
              className="mt-2 inline-block rounded px-2 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: template.accentColor }}
            >
              Explore Services
            </div>
          </div>
        </div>

        {/* Bottom decorative section strip */}
        <div className="absolute bottom-0 left-0 right-0 flex gap-1 bg-black/20 px-3 py-1.5">
          {["Services", "Gallery", "Team"].map((label) => (
            <div key={label} className="flex-1 rounded bg-white/10 py-1 text-center text-xs text-white/60">
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Card content */}
      <div className="p-5">
        <h3 className="text-base font-bold text-gray-900">{template.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{template.description}</p>
        <p className="mt-2 text-xs text-gray-400">
          <span className="font-medium text-gray-600">Includes:</span> {template.includes}
        </p>

        {/* CTA */}
        <Link
          id={`template-use-${template.id}`}
          href="/auth/register"
          className="mt-4 block w-full rounded-md border border-gray-200 py-2 text-center text-sm font-semibold text-gray-700 transition-colors hover:border-orange-300 hover:bg-orange-50"
          style={{ color: "#E8611A", borderColor: "#FDDBC5" }}
        >
          Use This Template
        </Link>
      </div>
    </div>
  );
}

export function TemplateShowcase() {
  return (
    <section
      id="templates"
      className="bg-gray-50 py-16 sm:py-20"
      aria-label="Template showcase"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Professional Templates, Built for You
          </h2>
          <p className="mt-3 text-base text-gray-500">
            Choose from designer-made templates and customise to fit your brand.
          </p>
        </div>

        {/* Template grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {TEMPLATES.map((template) => (
            <TemplatePreviewCard key={template.id} template={template} />
          ))}
        </div>

        {/* See all link */}
        <div className="mt-10 text-center">
          <Link
            id="see-all-templates"
            href="#templates"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-75"
            style={{ color: "#E8611A" }}
          >
            See all templates
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
