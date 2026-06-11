// Central content configuration for the marketing homepage.
// Update copy, links, and data here without touching component files.

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Templates", href: "#templates" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" }
];

export const HERO = {
  badge: "Trusted by service businesses worldwide",
  headline: "A Website That Brings",
  headlineAccent: "Customers to You",
  subheadline:
    "Build a professional website that builds trust, showcases your services, and helps you grow your business online.",
  primaryCta: { label: "Start Building for Free", href: "/auth/register" },
  secondaryCta: { label: "View Templates", href: "#templates" },
  trustNotes: ["Free plan available", "No credit card required"]
};

export const STATS = [
  { value: "10K+", label: "Websites Created" },
  { value: "50+", label: "Industries Covered" },
  { value: "100%", label: "Mobile Responsive" },
  { value: "24/7", label: "Customer Support" },
  { value: "Secure & Fast", label: "Hosting" }
];

export const HOW_IT_WORKS_STEPS = [
  {
    number: 1,
    title: "Choose Industry",
    description: "Select your business type"
  },
  {
    number: 2,
    title: "Pick Template",
    description: "Choose a template you like"
  },
  {
    number: 3,
    title: "Add Details",
    description: "Add your business info, services & content"
  },
  {
    number: 4,
    title: "Preview",
    description: "See how your website looks"
  },
  {
    number: 5,
    title: "Publish",
    description: "Go live in minutes with one click"
  }
];

export const INDUSTRIES = [
  { label: "Construction", icon: "🏗️" },
  { label: "Restaurants", icon: "🍽️" },
  { label: "Clinics", icon: "🏥" },
  { label: "Real Estate", icon: "🏠" },
  { label: "Salons", icon: "✂️" },
  { label: "Gyms", icon: "🏋️" },
  { label: "Home Services", icon: "🔧" },
  { label: "Cleaning", icon: "🧹" },
  { label: "Logistics", icon: "🚚" },
  { label: "And more...", icon: "⋯" }
];

export const TEMPLATES = [
  {
    id: "construction",
    name: "Construction Pro",
    tagline: "Build Better,\nBuild Smarter",
    description:
      "Modern template for construction and contracting businesses.",
    includes: "Home, About, Services, Projects, Contact",
    accentColor: "#E8611A",
    bgFrom: "#1a1a2e",
    bgTo: "#16213e",
    category: "Construction"
  },
  {
    id: "health-clinic",
    name: "Health & Clinic",
    tagline: "Healthy Smiles,\nConfident You",
    description:
      "Clean and professional template for clinics and healthcare providers.",
    includes: "Home, About, Services, Doctors, Contact",
    accentColor: "#2563eb",
    bgFrom: "#f0f9ff",
    bgTo: "#e0f2fe",
    category: "Healthcare"
  },
  {
    id: "salon-beauty",
    name: "Salon & Beauty",
    tagline: "Elegant Looks,\nExpert Care",
    description:
      "Stylish template for salons, spas and beauty professionals.",
    includes: "Home, About, Services, Gallery, Contact",
    accentColor: "#9333ea",
    bgFrom: "#1c1c2e",
    bgTo: "#2d1b4e",
    category: "Beauty"
  }
];

export const FEATURES = [
  {
    title: "Guided Setup",
    description:
      "Step-by-step process to launch your site quickly and confidently."
  },
  {
    title: "Mobile Friendly",
    description:
      "All templates are fully responsive and look great on any device."
  },
  {
    title: "Contact Ready",
    description:
      "Built-in contact forms, click-to-call buttons and location maps."
  },
  {
    title: "Custom Domain",
    description:
      "Connect your own domain name and build your brand online."
  },
  {
    title: "Easy to Edit",
    description:
      "Simple editor to update content, images and pages anytime."
  }
];

export const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Templates", href: "#templates" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "Updates", href: "#" }
    ]
  },
  {
    heading: "Resources",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Guides & Tutorials", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Webinars", href: "#" },
      { label: "Status", href: "#" }
    ]
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Partners", href: "#" },
      { label: "Contact Us", href: "#" }
    ]
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Refund Policy", href: "#" },
      { label: "Cookie Policy", href: "#" }
    ]
  }
];
