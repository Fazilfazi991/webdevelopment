# Homepage Asset Replacement Checklist

This file tracks placeholder assets that should be replaced with final production assets before launch.

## Hero Section

| Asset | Location in Code | Recommended Size | Notes |
|---|---|---|---|
| Browser device mockup screenshot | `components/marketing/hero-section.tsx` — `DeviceMockup` component | 840 × 525 px | Replace CSS mock with `<Image src="/images/hero-screenshot.png" />` |
| Mobile phone mockup | Same component | 200 × 355 px | Floating phone overlay in the hero |

**To replace:**
1. Add real screenshots to `public/images/`
2. In `hero-section.tsx`, remove the `<DeviceMockup />` component
3. Render with Next.js `<Image>` component for optimisation

---

## Template Preview Cards

| Template | Placeholder location | Recommended Size | Path to place asset |
|---|---|---|---|
| Construction Pro | `components/marketing/template-showcase.tsx` | 800 × 500 px | `public/images/templates/construction-pro.jpg` |
| Health & Clinic | Same file | 800 × 500 px | `public/images/templates/health-clinic.jpg` |
| Salon & Beauty | Same file | 800 × 500 px | `public/images/templates/salon-beauty.jpg` |

**To replace:**
1. Export a screenshot of each template at 800 × 500 px
2. Place in `public/images/templates/`
3. In `template-showcase.tsx`, replace `<div style={{ background: ... }}>` preview area with:
```tsx
<Image
  src={`/images/templates/${template.id}.jpg`}
  alt={`${template.name} template preview`}
  width={800}
  height={500}
  className="w-full object-cover"
/>
```

---

## Logo

The current logo is a text + icon mark rendered in CSS/SVG.

| Asset | Notes |
|---|---|
| Full logo (SVG or PNG) | Replace the inline SVG in `marketing-header.tsx` and `marketing-footer.tsx` |
| Favicon | Place at `public/favicon.ico` or `app/favicon.ico` |

---

## Platform Name

The platform is currently displayed as **YourPlatform** as a placeholder.

Update the final platform name in:
- `components/marketing/marketing-content.ts` — not currently used for name, but add a `PLATFORM_NAME` export
- `components/marketing/marketing-header.tsx` — line with `YourPlatform` text
- `components/marketing/marketing-footer.tsx` — logo + tagline area
- `app/layout.tsx` — metadata title
- `app/page.tsx` — metadata title and description

---

## Social Media Links

Footer social links are currently `href="#"` placeholders.

Update in `components/marketing/marketing-footer.tsx` — `SOCIAL_LINKS` array:
```ts
{ label: "Facebook", href: "https://facebook.com/yourpage", ... }
{ label: "Twitter",  href: "https://twitter.com/yourhandle", ... }
{ label: "LinkedIn", href: "https://linkedin.com/company/yourcompany", ... }
{ label: "Instagram",href: "https://instagram.com/yourhandle", ... }
```

---

## Pricing Page

The `#pricing` anchor currently does not resolve to a section.

When Pricing is ready:
1. Create `app/pricing/page.tsx`
2. Update the `href` in `NAV_LINKS` in `marketing-content.ts` from `"#pricing"` to `"/pricing"`
