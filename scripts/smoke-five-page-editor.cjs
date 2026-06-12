const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const pageStructure = read("lib/site-editor/page-structure.ts");
for (const slug of ["home", "about", "services", "projects", "contact"]) {
  assert(pageStructure.includes(`slug: "${slug}"`), `default page ${slug} missing`);
}
assert(pageStructure.includes("required: true"), "required home flag missing");
assert(pageStructure.includes("normaliseEditorPageSlug"), "page slug normaliser missing");

const labels = read("lib/site-editor/section-labels.ts");
for (const label of [
  "About Preview",
  "Services Preview",
  "Projects Preview",
  "Contact Preview",
  "About Page Banner",
  "All Services",
  "Request a Quote",
  "Project Gallery",
  "Enquiry Form",
  "Working Hours"
]) {
  assert(labels.includes(label), `page-aware label ${label} missing`);
}
assert(labels.includes("pageAwareLabels"), "page-aware label mapping missing");

const contentTab = read("app/dashboard/websites/[siteId]/editor/tabs/content-tab.tsx");
assert(contentTab.includes("Choose a page to update"), "page chooser heading missing");
assert(contentTab.includes("defaultEditorPages.map"), "page chooser cards missing");
assert(contentTab.includes("section.page_slug === selectedPageSlug"), "section list is not filtered by selected page");
assert(contentTab.includes("Back to pages"), "back to pages control missing");
assert(!contentTab.includes("homeSections"), "legacy combined home section list remains");

const previewContext = read("components/site-editor/live-preview-context.tsx");
assert(previewContext.includes("currentPageSlug"), "preview page state missing");
assert(previewContext.includes("selectPage"), "preview page selector missing");
assert(previewContext.includes("onClickCapture={handlePreviewNavigation}"), "preview nav interception missing");
assert(previewContext.includes("event.preventDefault()"), "preview nav links are not prevented from leaving editor");
assert(previewContext.includes("replaceEditorUrl"), "editor URL state updater missing");

const publicNestedRoute = read("app/sites/[subdomain]/[pageSlug]/page.tsx");
assert(publicNestedRoute.includes("pageSlug"), "nested public route does not consume pageSlug");
assert(publicNestedRoute.includes("loadPublicSite"), "nested public route does not render public site");

const migration = read("supabase/migrations/020_five_page_editor_structure.sql");
for (const column of ["navigation_label", "is_enabled", "is_required", "seo_title", "seo_description"]) {
  assert(migration.includes(column), `migration missing ${column}`);
}
assert(migration.includes("technical-services-modern"), "technical services recipe backfill missing");
assert(migration.includes("service-modern"), "service modern recipe backfill missing");
assert(migration.includes("service-minimal"), "service minimal recipe backfill missing");
assert(migration.includes("service-bold"), "service bold recipe backfill missing");
assert(migration.includes("contact-map-form"), "duplicate contact preview normalization missing");

console.log("five-page editor smoke checks passed");
