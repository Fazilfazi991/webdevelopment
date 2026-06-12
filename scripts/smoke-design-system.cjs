const fs = require("fs");
const path = require("path");

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const assert = (value, message) => { if (!value) throw new Error(message); };

const catalog = read("lib/design-system/catalog.ts");
const resolver = read("lib/design-system/resolver.ts");
const action = read("app/design-actions.ts");
const migration = read("supabase/migrations/018_design_system_recipes.sql");
const customerPage = read("app/dashboard/websites/[siteId]/design/page.tsx");
const adminPage = read("app/admin/design-studio/page.tsx");

["service-modern", "service-minimal", "service-bold"].forEach((slug) => {
  assert(catalog.includes(`slug: "${slug}"`), `Missing ${slug} recipe.`);
  ["thumbnail.webp", "cover.webp", "preview-desktop.webp", "preview-mobile.webp", "page-home.webp", "page-about.webp", "page-services.webp", "page-projects.webp", "page-contact.webp", "section-hero.webp", "section-services.webp", "section-projects.webp", "section-contact.webp", "section-footer.webp"].forEach((file) => assert(fs.existsSync(path.join(root, "public", "designs", slug, file)), `Missing ${slug}/${file}`));
});

assert(catalog.includes("customerVisibleRecipes") && catalog.includes('["approved", "published"]'), "Customer visibility must be approved-only.");
assert(resolver.includes("General service-business fallback"), "Resolver must include a general fallback.");
assert(action.includes('status: "draft"'), "Design switching must remain draft-only.");
assert(!action.includes("site_versions") && !action.includes("delete"), "Design switching must not mutate published versions or delete content.");
assert(migration.includes("site_design_selections") && migration.includes("site_section_design_overrides"), "Migration must include draft selection tables.");
assert(migration.includes("social-share"), "Migration must preserve social-share media slots.");
assert(customerPage.includes("Your Current Design") && customerPage.includes("Recommended for You") && customerPage.includes("Explore More Designs") && customerPage.includes("Customize Style"), "Customer design page is incomplete.");
assert(adminPage.includes("Section Variants") && adminPage.includes("QA Status"), "Admin Design Studio is incomplete.");

console.log("Design system smoke passed.");
