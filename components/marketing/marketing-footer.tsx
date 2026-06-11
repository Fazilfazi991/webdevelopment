import Link from "next/link";
import { FOOTER_COLUMNS } from "./marketing-content";

// Social icon SVGs
function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  );
}
function TwitterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: "Facebook", href: "#", Icon: FacebookIcon },
  { label: "Twitter", href: "#", Icon: TwitterIcon },
  { label: "LinkedIn", href: "#", Icon: LinkedInIcon },
  { label: "Instagram", href: "#", Icon: InstagramIcon }
];

const CURRENT_YEAR = new Date().getFullYear();

export function MarketingFooter() {

  return (
    <footer className="border-t border-gray-100 bg-white" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 min-[420px]:grid-cols-2 lg:grid-cols-[220px_repeat(4,1fr)]">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-gray-900" aria-label="YourPlatform home">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: "#E8611A" }}
                aria-hidden="true"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="1" width="6" height="6" rx="1" fill="white" />
                  <rect x="9" y="1" width="6" height="6" rx="1" fill="white" fillOpacity="0.6" />
                  <rect x="1" y="9" width="6" height="6" rx="1" fill="white" fillOpacity="0.6" />
                  <rect x="9" y="9" width="6" height="6" rx="1" fill="white" />
                </svg>
              </span>
              <span className="text-sm font-bold">YourPlatform</span>
            </Link>

            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-500">
              The guided website builder for service businesses.
            </p>

            {/* Social links */}
            <div className="mt-5 flex gap-3">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-900">
                {col.heading}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 transition-colors hover:text-gray-800"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter column */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-900">
              Newsletter
            </h3>
            <p className="mb-4 text-sm text-gray-500">
              Get tips and updates to grow your business online.
            </p>
            <form
              className="flex flex-col gap-2"
              aria-label="Newsletter signup"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="w-full rounded-md py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#E8611A" }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 sm:flex-row">
          <p className="text-center text-xs text-gray-400 sm:text-left">
            © {CURRENT_YEAR} YourPlatform. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400 sm:justify-end">
            <Link href="#" className="hover:text-gray-600">Privacy Policy</Link>
            <Link href="#" className="hover:text-gray-600">Terms of Service</Link>
            <Link href="#" className="hover:text-gray-600">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
