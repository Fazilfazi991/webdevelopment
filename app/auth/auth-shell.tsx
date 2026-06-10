import Link from "next/link";

export function AuthShell({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-canvas px-4 py-8 md:grid-cols-[1fr_1.1fr] md:p-0">
      <section className="hidden bg-brand-900 px-10 py-12 text-white md:flex md:flex-col md:justify-between">
        <Link href="/" className="text-lg font-bold">
          Studio OS
        </Link>
        <div className="max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-100">Guided website platform</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">Professional websites built from business profiles.</h1>
          <p className="mt-5 text-base leading-7 text-brand-100">
            Designed for business owners who want a polished site without managing design systems, pages, or code.
          </p>
        </div>
        <p className="text-sm text-brand-100">Prepared for global markets from day one.</p>
      </section>
      <section className="flex items-center justify-center">
        <div className="w-full max-w-md rounded-app border border-line bg-white p-6 shadow-soft md:p-8">
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
          <div className="mt-6">{children}</div>
        </div>
      </section>
    </main>
  );
}
