import Link from "next/link";
import { CheckCircle } from "lucide-react";

export function FinalCta() {
  return (
    <section
      className="py-14 sm:py-16"
      style={{ backgroundColor: "#FEF0E8" }}
      aria-label="Call to action"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-stretch gap-8 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: icon + copy */}
          <div className="flex min-w-0 flex-col gap-4 min-[420px]:flex-row min-[420px]:items-center min-[420px]:gap-5">
            {/* Rocket icon circle */}
            <span
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-white shadow-md"
              style={{ backgroundColor: "#E8611A" }}
              aria-hidden="true"
            >
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <path
                  d="M15 3s7 6 7 13v7H8V16C8 9 15 3 15 3z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path d="M11 23c-1.5 1.5-3 3-4.5 4.5M19 23c1.5 1.5 3 3 4.5 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="15" cy="13" r="2.5" fill="white" />
              </svg>
            </span>

            <div className="min-w-0">
              <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl">
                Ready to Grow Your Business Online?
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Join thousands of service businesses that trust YourPlatform to build their professional websites.
              </p>
            </div>
          </div>

          {/* Right: CTAs */}
          <div className="flex w-full flex-col gap-4 sm:w-auto">
            <div className="grid gap-3 sm:flex sm:flex-wrap">
              <Link
                id="cta-start-building"
                href="/auth/register"
                className="rounded-md px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#E8611A" }}
              >
                Start Building for Free
              </Link>
              <Link
                id="cta-view-templates"
                href="#templates"
                className="rounded-md border border-gray-200 bg-white px-6 py-3 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                View Templates
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {["Free plan available", "No credit card required"].map((note) => (
                <span key={note} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <CheckCircle size={13} className="text-green-500" aria-hidden="true" />
                  {note}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
