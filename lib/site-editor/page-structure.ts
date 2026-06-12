export const defaultEditorPages = [
  {
    slug: "home",
    title: "Home Page",
    navLabel: "Home",
    displayOrder: 1,
    enabled: true,
    required: true,
    description: "Your main landing page",
    seoTitle: "Home",
    seoDescription: "A clear overview of the business, services, proof, and contact options."
  },
  {
    slug: "about",
    title: "About Page",
    navLabel: "About",
    displayOrder: 2,
    enabled: true,
    required: false,
    description: "Your business story and company details",
    seoTitle: "About",
    seoDescription: "Business background, experience, service approach, and trust signals."
  },
  {
    slug: "services",
    title: "Services Page",
    navLabel: "Services",
    displayOrder: 3,
    enabled: true,
    required: false,
    description: "Your complete service list",
    seoTitle: "Services",
    seoDescription: "Detailed services, service areas, process, and quote request options."
  },
  {
    slug: "projects",
    title: "Projects Page",
    navLabel: "Projects",
    displayOrder: 4,
    enabled: true,
    required: false,
    description: "Photos and examples of your work",
    seoTitle: "Projects",
    seoDescription: "Project photos, examples, featured work, and customer proof."
  },
  {
    slug: "contact",
    title: "Contact Page",
    navLabel: "Contact",
    displayOrder: 5,
    enabled: true,
    required: false,
    description: "Phone, WhatsApp, map, and enquiry form",
    seoTitle: "Contact",
    seoDescription: "Contact details, WhatsApp and phone actions, map, hours, and enquiry form."
  }
] as const;

export type DefaultEditorPageSlug = (typeof defaultEditorPages)[number]["slug"];

export function isDefaultEditorPageSlug(value: string | null | undefined): value is DefaultEditorPageSlug {
  return defaultEditorPages.some((page) => page.slug === value);
}

export function normaliseEditorPageSlug(value: string | null | undefined): DefaultEditorPageSlug {
  return isDefaultEditorPageSlug(value) ? value : "home";
}

export function editorPageTitle(pageSlug: string | null | undefined) {
  return defaultEditorPages.find((page) => page.slug === pageSlug)?.title ?? "Home Page";
}
