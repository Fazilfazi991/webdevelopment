"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "./marketing-content";

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 font-bold text-gray-900"
          aria-label="YourPlatform home"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: "#E8611A" }}
            aria-hidden="true"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="1" y="1" width="6" height="6" rx="1" fill="white" />
              <rect x="9" y="1" width="6" height="6" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="1" y="9" width="6" height="6" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="9" y="9" width="6" height="6" rx="1" fill="white" />
            </svg>
          </span>
          <span className="truncate text-sm font-bold tracking-tight">YourPlatform</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Log in
          </Link>
          <Link
            href="/auth/register"
            className="rounded-md px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#E8611A" }}
          >
            Start Building
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          id="mobile-menu-toggle"
          className="flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="max-w-full border-t border-gray-100 bg-white px-4 pb-4 lg:hidden">
          <nav className="mt-2 flex flex-col gap-1" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-md border border-gray-200 px-4 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Log in
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-4 py-2.5 text-center text-sm font-semibold text-white"
              style={{ backgroundColor: "#E8611A" }}
            >
              Start Building
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
