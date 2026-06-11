import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Mail, MapPin, Menu, Phone, Wrench } from "lucide-react";
import type { z } from "zod";
import type {
  aboutSchema,
  contactSchema,
  ctaSchema,
  faqSchema,
  floatingActionSchema,
  footerSchema,
  gallerySchema,
  headerSchema,
  heroBackgroundSchema,
  heroMinimalSchema,
  heroSplitSchema,
  serviceHighlightsSchema,
  servicesGridSchema,
  servicesRowsSchema,
  testimonialsSchema,
  whyChooseSchema
} from "@/lib/site-renderer/section-schemas";

function hrefFor(href: string) {
  if (href.startsWith("http") || href.startsWith("#")) return href;
  return href;
}

function SiteLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={hrefFor(href)} className={className}>
      {children}
    </a>
  );
}

function SiteButton({ action, variant = "primary" }: { action?: { href: string; label: string }; variant?: "primary" | "secondary" }) {
  if (!action) return null;
  return (
    <SiteLink
      href={action.href}
      className={
        variant === "primary"
          ? "inline-flex min-h-11 items-center justify-center rounded-[var(--site-button-radius)] bg-[var(--site-primary)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--site-primary-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--site-primary)] focus:ring-offset-2"
          : "inline-flex min-h-11 items-center justify-center rounded-[var(--site-button-radius)] border border-[var(--site-border)] bg-white px-5 py-3 text-sm font-bold text-[var(--site-ink)] transition hover:bg-[var(--site-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--site-primary)] focus:ring-offset-2"
      }
    >
      {action.label}
    </SiteLink>
  );
}

function SectionIntro({ eyebrow, title, body, centered = false }: { eyebrow?: string; title: string; body?: string; centered?: boolean }) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--site-primary)]">{eyebrow}</p> : null}
      <h2 className="mt-3 font-[var(--site-heading-font)] text-3xl font-bold leading-tight text-[var(--site-ink)] md:text-4xl">{title}</h2>
      {body ? <p className="mt-4 text-base leading-7 text-[var(--site-muted)]">{body}</p> : null}
    </div>
  );
}

function ImageFrame({ image, priority = false }: { image?: { src: string; alt: string }; priority?: boolean }) {
  if (!image) return <div className="aspect-[4/3] rounded-[var(--site-card-radius)] bg-[var(--site-surface)]" />;
  if (image.src.startsWith("http")) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--site-card-radius)] bg-[var(--site-surface)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.src} alt={image.alt} className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--site-card-radius)] bg-[var(--site-surface)]">
      <Image src={image.src} alt={image.alt} fill priority={priority} sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
    </div>
  );
}

export function HeaderStandard({ content }: { content: z.infer<typeof headerSchema> }) {
  return (
    <header className="border-b border-[var(--site-border)] bg-white">
      <div className="bg-[var(--site-primary-dark)] text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-2 text-xs sm:text-sm">
          <span>{content.tagline}</span>
          <div className="flex flex-wrap gap-4">
            {content.phone ? <span className="inline-flex items-center gap-1"><Phone size={14} /> {content.phone}</span> : null}
            {content.email ? <span className="inline-flex items-center gap-1"><Mail size={14} /> {content.email}</span> : null}
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link href="#" className="group flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[var(--site-primary)]">
          <span className="flex size-10 items-center justify-center rounded-[var(--site-button-radius)] bg-[var(--site-primary)] text-white">
            <Wrench size={20} />
          </span>
          <span>
            <span className="block font-[var(--site-heading-font)] text-lg font-bold text-[var(--site-ink)]">{content.companyName}</span>
            {content.location ? <span className="block text-xs text-[var(--site-muted)]">{content.location}</span> : null}
          </span>
        </Link>
        <nav aria-label="Template navigation" className="flex max-w-full flex-wrap items-center gap-1 sm:gap-2">
          <span className="sr-only"><Menu size={16} /> Menu</span>
          {content.nav.map((item) => (
            <SiteLink key={item.href} href={item.href} className="rounded-[var(--site-button-radius)] px-3 py-2 text-sm font-semibold text-[var(--site-muted)] hover:bg-[var(--site-surface)] hover:text-[var(--site-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--site-primary)]">
              {item.label}
            </SiteLink>
          ))}
          <SiteButton action={content.primaryAction} />
        </nav>
      </div>
    </header>
  );
}

export function HeroSplit({ content }: { content: z.infer<typeof heroSplitSchema> }) {
  return (
    <section className="bg-[var(--site-surface)]">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 lg:grid-cols-[1fr_0.9fr] lg:py-20">
        <div>
          {content.eyebrow ? <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--site-primary)]">{content.eyebrow}</p> : null}
          <h1 className="mt-4 font-[var(--site-heading-font)] text-4xl font-bold leading-tight text-[var(--site-ink)] md:text-5xl">{content.title}</h1>
          {content.body ? <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--site-muted)]">{content.body}</p> : null}
          <div className="mt-7 flex flex-wrap gap-3">
            <SiteButton action={content.primaryAction} />
            <SiteButton action={content.secondaryAction} variant="secondary" />
          </div>
          {content.proofPoints.length ? (
            <ul className="mt-8 grid gap-3 text-sm font-semibold text-[var(--site-ink)] sm:grid-cols-3">
              {content.proofPoints.map((point) => (
                <li key={point} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--site-primary)]" />{point}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <ImageFrame image={content.image} priority />
      </div>
    </section>
  );
}

export function HeroBackground({ content }: { content: z.infer<typeof heroBackgroundSchema> }) {
  return (
    <section className="relative overflow-hidden bg-[var(--site-primary-dark)] text-white">
      {content.image?.src.startsWith("http") ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={content.image.src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      ) : content.image ? (
        <Image src={content.image.src} alt="" fill sizes="100vw" className="object-cover opacity-30" />
      ) : null}
      <div className="relative mx-auto max-w-7xl px-5 py-20">
        <div className="max-w-3xl">
          {content.eyebrow ? <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--site-secondary)]">{content.eyebrow}</p> : null}
          <h1 className="mt-4 font-[var(--site-heading-font)] text-4xl font-bold leading-tight md:text-5xl">{content.title}</h1>
          {content.body ? <p className="mt-5 text-lg leading-8 text-white/85">{content.body}</p> : null}
        </div>
      </div>
    </section>
  );
}

export function HeroMinimal({ content }: { content: z.infer<typeof heroMinimalSchema> }) {
  return (
    <section className="bg-[var(--site-surface)]">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <SectionIntro eyebrow={content.eyebrow} title={content.title} body={content.body} centered />
        {content.services.length ? (
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2">
            {content.services.map((service) => (
              <span key={service} className="rounded-full border border-[var(--site-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--site-muted)]">{service}</span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function ServiceHighlights({ content }: { content: z.infer<typeof serviceHighlightsSchema> }) {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-4 px-5 py-10 md:grid-cols-3">
        {content.items.map((item) => (
          <article key={item.title} className="rounded-[var(--site-card-radius)] border border-[var(--site-border)] p-5">
            <h2 className="font-[var(--site-heading-font)] text-lg font-bold text-[var(--site-ink)]">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--site-muted)]">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AboutSection({ content, imageSide = "left" }: { content: z.infer<typeof aboutSchema>; imageSide?: "left" | "right" }) {
  const image = <ImageFrame image={content.image} />;
  const text = (
    <div>
      <SectionIntro eyebrow={content.eyebrow} title={content.title} body={content.body} />
      {content.bullets.length ? (
        <ul className="mt-6 grid gap-3">
          {content.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-3 text-sm font-semibold text-[var(--site-ink)]"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[var(--site-primary)]" />{bullet}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-2">
        {imageSide === "left" ? image : text}
        {imageSide === "left" ? text : image}
      </div>
    </section>
  );
}

export function ServicesGrid({ content, compact = false }: { content: z.infer<typeof servicesGridSchema>; compact?: boolean }) {
  return (
    <section className="bg-[var(--site-surface)]">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <SectionIntro eyebrow={content.eyebrow} title={content.title} body={content.body} centered />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {content.items.map((item) => (
            <article key={item.title} className="overflow-hidden rounded-[var(--site-card-radius)] border border-[var(--site-border)] bg-white shadow-[var(--site-shadow)]">
              {!compact ? <ImageFrame image={item.image} /> : null}
              <div className="p-5">
                <h3 className="font-[var(--site-heading-font)] text-lg font-bold text-[var(--site-ink)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--site-muted)]">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ServicesRows({ content }: { content: z.infer<typeof servicesRowsSchema> }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <SectionIntro eyebrow={content.eyebrow} title={content.title} body={content.body} />
        <div className="mt-10 grid gap-8">
          {content.items.map((item, index) => (
            <article key={item.title} className="grid items-center gap-6 rounded-[var(--site-card-radius)] border border-[var(--site-border)] p-4 md:grid-cols-2">
              <div className={index % 2 ? "md:order-2" : ""}><ImageFrame image={item.image} /></div>
              <div className="p-2 md:p-6">
                <h3 className="font-[var(--site-heading-font)] text-2xl font-bold text-[var(--site-ink)]">{item.title}</h3>
                <p className="mt-3 leading-7 text-[var(--site-muted)]">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyChoose({ content }: { content: z.infer<typeof whyChooseSchema> }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <SectionIntro eyebrow={content.eyebrow} title={content.title} body={content.body} centered />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {content.items.map((item) => (
            <article key={item.title} className="rounded-[var(--site-card-radius)] border border-[var(--site-border)] bg-[var(--site-surface)] p-5">
              <h3 className="font-[var(--site-heading-font)] text-lg font-bold text-[var(--site-ink)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--site-muted)]">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProjectGallery({ content }: { content: z.infer<typeof gallerySchema> }) {
  return (
    <section className="bg-[var(--site-surface)]">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <SectionIntro eyebrow={content.eyebrow} title={content.title} body={content.body} />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {content.items.map((item) => (
            <article key={item.title} className="overflow-hidden rounded-[var(--site-card-radius)] bg-white">
              <ImageFrame image={item.image} />
              <div className="p-5">
                <h3 className="font-[var(--site-heading-font)] text-xl font-bold text-[var(--site-ink)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--site-muted)]">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials({ content }: { content: z.infer<typeof testimonialsSchema> }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <SectionIntro eyebrow={content.eyebrow} title={content.title} body={content.body} centered />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {content.items.map((item) => (
            <figure key={item.quote} className="rounded-[var(--site-card-radius)] border border-[var(--site-border)] p-6">
              <blockquote className="text-base leading-7 text-[var(--site-ink)]">{item.quote}</blockquote>
              <figcaption className="mt-4 text-sm font-bold text-[var(--site-muted)]">{item.name}{item.context ? `, ${item.context}` : ""}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqAccordion({ content }: { content: z.infer<typeof faqSchema> }) {
  return (
    <section className="bg-[var(--site-surface)]">
      <div className="mx-auto max-w-4xl px-5 py-16">
        <SectionIntro eyebrow={content.eyebrow} title={content.title} body={content.body} centered />
        <div className="mt-8 grid gap-3">
          {content.items.map((item) => (
            <details key={item.question} className="rounded-[var(--site-card-radius)] border border-[var(--site-border)] bg-white p-5">
              <summary className="cursor-pointer text-base font-bold text-[var(--site-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--site-primary)]">{item.question}</summary>
              <p className="mt-3 text-sm leading-6 text-[var(--site-muted)]">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContactCta({ content }: { content: z.infer<typeof ctaSchema> }) {
  return (
    <section className="bg-white px-5 py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-[var(--site-card-radius)] bg-[var(--site-primary-dark)] p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <h2 className="font-[var(--site-heading-font)] text-2xl font-bold">{content.title}</h2>
          {content.body ? <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">{content.body}</p> : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <SiteButton action={content.primaryAction} />
          <SiteButton action={content.secondaryAction} variant="secondary" />
        </div>
      </div>
    </section>
  );
}

export function ContactMapForm({ content }: { content: z.infer<typeof contactSchema> }) {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionIntro eyebrow={content.eyebrow} title={content.title} body={content.body} />
          <div className="mt-8 grid gap-4 text-sm text-[var(--site-muted)]">
            {content.phone ? <p className="flex gap-3"><Phone className="size-5 text-[var(--site-primary)]" /> {content.phone}</p> : null}
            {content.email ? <p className="flex gap-3"><Mail className="size-5 text-[var(--site-primary)]" /> {content.email}</p> : null}
            {content.location ? <p className="flex gap-3"><MapPin className="size-5 text-[var(--site-primary)]" /> {content.location}</p> : null}
          </div>
          <div className="mt-8 flex aspect-[4/3] items-center justify-center rounded-[var(--site-card-radius)] border border-[var(--site-border)] bg-[var(--site-surface)] text-sm font-semibold text-[var(--site-muted)]">
            Service area map placeholder
          </div>
        </div>
        <form className="grid gap-4 rounded-[var(--site-card-radius)] border border-[var(--site-border)] bg-[var(--site-surface)] p-5" aria-label={content.formTitle ?? "Contact enquiry form"}>
          <h3 className="font-[var(--site-heading-font)] text-xl font-bold text-[var(--site-ink)]">{content.formTitle ?? "Send an enquiry"}</h3>
          {["Name", "Phone", "Email"].map((label) => (
            <label key={label} className="grid gap-2 text-sm font-semibold text-[var(--site-ink)]">
              {label}
              <input className="min-h-11 rounded-[var(--site-button-radius)] border border-[var(--site-border)] bg-white px-3 focus:outline-none focus:ring-2 focus:ring-[var(--site-primary)]" />
            </label>
          ))}
          <label className="grid gap-2 text-sm font-semibold text-[var(--site-ink)]">
            Service request
            <textarea rows={5} className="rounded-[var(--site-button-radius)] border border-[var(--site-border)] bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--site-primary)]" />
          </label>
          <button type="button" className="min-h-11 rounded-[var(--site-button-radius)] bg-[var(--site-primary)] px-5 text-sm font-bold text-white">
            Submit enquiry
          </button>
        </form>
      </div>
    </section>
  );
}

export function FooterStandard({ content }: { content: z.infer<typeof footerSchema> }) {
  return (
    <footer className="bg-[var(--site-ink)] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <h2 className="font-[var(--site-heading-font)] text-xl font-bold">{content.companyName}</h2>
          {content.summary ? <p className="mt-3 max-w-md text-sm leading-6 text-white/70">{content.summary}</p> : null}
        </div>
        <nav aria-label="Footer navigation" className="grid gap-2">
          {content.links.map((link) => (
            <SiteLink key={link.href} href={link.href} className="text-sm text-white/75 hover:text-white focus:outline-none focus:ring-2 focus:ring-white">
              {link.label}
            </SiteLink>
          ))}
        </nav>
        <div className="grid gap-2 text-sm text-white/75">
          {content.phone ? <span>{content.phone}</span> : null}
          {content.email ? <span>{content.email}</span> : null}
        </div>
      </div>
    </footer>
  );
}

export function FloatingWhatsapp({ content }: { content: z.infer<typeof floatingActionSchema> }) {
  return (
    <a href={content.href} className="fixed bottom-5 right-5 z-30 rounded-full bg-[var(--site-primary)] px-5 py-3 text-sm font-bold text-white shadow-[var(--site-shadow)] focus:outline-none focus:ring-2 focus:ring-[var(--site-primary)] focus:ring-offset-2">
      {content.label}
    </a>
  );
}
