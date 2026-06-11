import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { HERO } from "./marketing-content";

// ---------------------------------------------------------------------------
// CSS-built device mockup preview — replace with actual screenshots when ready
// ---------------------------------------------------------------------------
function DeviceMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[min(420px,calc(100vw-2rem))] pb-8 sm:pb-0">
      {/* Main browser mockup */}
      <div
        className="relative overflow-hidden rounded-xl shadow-2xl"
        style={{ aspectRatio: "16/10", background: "#1a1a2e" }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 bg-gray-800 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
          <div className="mx-2 min-w-0 flex-1 truncate rounded-sm bg-gray-700 px-2 py-0.5 text-xs text-gray-400 sm:mx-3">
            interiordezign.com
          </div>
          <button className="hidden rounded px-2 py-0.5 text-xs text-white sm:block" style={{ backgroundColor: "#E8611A" }}>
            Get a Quote
          </button>
        </div>

        {/* Fake website interior */}
        <div className="relative flex h-full flex-col" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}>
          {/* Navigation bar */}
          <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-300">
            <span className="font-semibold text-white">Interior Dezign</span>
            <div className="hidden gap-3 sm:flex">
              <span>About</span><span>Services</span><span>Projects</span><span>Contact</span>
            </div>
          </div>

          {/* Hero area with overlay text */}
          <div
            className="relative flex flex-1 flex-col justify-center px-4"
            style={{ background: "linear-gradient(to right, rgba(0,0,0,0.7) 50%, transparent 100%)" }}
          >
            {/* Background texture bars */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded"
                  style={{
                    width: "30%",
                    height: "8px",
                    background: "rgba(255,255,255,0.05)",
                    top: `${15 + i * 12}%`,
                    right: "5%"
                  }}
                />
              ))}
              {/* Decorative image placeholder blocks */}
              <div className="absolute bottom-0 right-0 top-0 w-1/2" style={{ background: "rgba(232,97,26,0.15)" }} />
            </div>

            <div className="relative z-10">
              <p className="mb-1 text-xs font-medium" style={{ color: "#E8611A" }}>Interior Design Studio</p>
              <h3 className="text-sm font-bold leading-snug text-white">
                Making Spaces<br />Better Everyday
              </h3>
              <p className="mt-1 text-xs text-gray-400">Custom interior solutions that blend functionality with timeless design.</p>
              <button
                className="mt-2 rounded px-3 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: "#E8611A" }}
              >
                Explore Services
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating mobile phone mockup — positioned bottom-right */}
      <div
        className="absolute bottom-0 right-2 overflow-hidden rounded-xl border-2 border-white shadow-xl sm:-bottom-4 sm:-right-4"
        style={{ width: "clamp(64px, 20vw, 90px)", aspectRatio: "9/16", background: "#1a1a2e" }}
        aria-hidden="true"
      >
        <div className="flex flex-col h-full">
          <div className="h-1 bg-gray-700 mx-auto mt-1 rounded w-6" />
          <div className="flex-1 p-1">
            <div className="h-full rounded overflow-hidden" style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}>
              <div className="p-1">
                <div className="h-1.5 rounded bg-white/20 mb-1" />
                <div className="h-1 rounded bg-white/10 mb-1 w-3/4" />
              </div>
              <div className="mx-1 rounded" style={{ height: "35px", background: "rgba(232,97,26,0.3)" }}>
                <div className="p-1">
                  <div className="text-white text-center" style={{ fontSize: "4px", fontWeight: "bold" }}>Making Spaces Better</div>
                </div>
              </div>
              <div className="p-1 mt-1">
                <div className="h-1 rounded bg-white/20 mb-0.5" />
                <div className="h-1 rounded bg-white/15 mb-0.5 w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="bg-white pb-14 pt-10 sm:pb-20 sm:pt-16" aria-label="Hero">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: copy */}
          <div className="min-w-0">
            {/* Badge */}
            <div className="mb-6 flex items-center gap-2">
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: "#E8611A" }}
                aria-hidden="true"
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <circle cx="4" cy="4" r="3" fill="white" />
                </svg>
              </span>
              <p className="text-sm font-medium" style={{ color: "#E8611A" }}>
                {HERO.badge}
              </p>
            </div>

            {/* Headline */}
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-[52px]">
              {HERO.headline}{" "}
              <span style={{ color: "#E8611A" }}>{HERO.headlineAccent}</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-5 max-w-lg text-base leading-relaxed text-gray-500 sm:text-lg">
              {HERO.subheadline}
            </p>

            {/* CTAs */}
            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <Link
                id="hero-start-building"
                href={HERO.primaryCta.href}
                className="rounded-md px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#E8611A" }}
              >
                {HERO.primaryCta.label}
              </Link>
              <Link
                id="hero-view-templates"
                href={HERO.secondaryCta.href}
                className="flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-6 py-3 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <polygon points="6,3 13,8 6,13" fill="currentColor" />
                </svg>
                {HERO.secondaryCta.label}
              </Link>
            </div>

            {/* Trust notes */}
            <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap sm:gap-4">
              {HERO.trustNotes.map((note) => (
                <span key={note} className="flex items-center gap-1.5 text-sm text-gray-500">
                  <CheckCircle size={14} className="text-green-500" aria-hidden="true" />
                  {note}
                </span>
              ))}
            </div>
          </div>

          {/* Right: device mockup */}
          <div className="flex min-w-0 justify-center overflow-hidden px-1 sm:px-0 lg:justify-end">
            {/*
              TODO: Replace DeviceMockup with actual product screenshot.
              Recommended size: 840×525 px for the browser frame.
              Place at: public/images/hero-screenshot.png
            */}
            <DeviceMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
