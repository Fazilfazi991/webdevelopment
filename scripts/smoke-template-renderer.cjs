const fs = require("fs");
const path = require("path");

const root = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const shared = read("components/site-renderer/sections/shared.tsx");
const slots = read("lib/site-renderer/media-slots.ts");
const previewShell = read("app/dashboard/websites/[siteId]/preview/preview-shell.tsx");
const setupPreview = read("app/dashboard/websites/[siteId]/setup/templates/[templateId]/page.tsx");
const templatesPage = read("app/dashboard/websites/[siteId]/setup/templates/page.tsx");
const setupActions = read("app/setup-actions.ts");
const completePage = read("app/dashboard/websites/[siteId]/setup/complete/page.tsx");
const setupProgress = read("components/setup/setup-progress.tsx");
const newWebsitePage = read("app/dashboard/websites/new/page.tsx");
const newWebsiteWizard = read("components/onboarding/mobile-onboarding-wizard.tsx");
const newWebsiteForm = read("app/dashboard/websites/new/new-website-form.tsx");
const dashboardWebsites = read("app/dashboard/websites/page.tsx");
const websiteCardState = read("app/dashboard/websites/website-card-state.ts");
const publicLoader = read("lib/publishing/public-loader.ts");
const migration = read("supabase/migrations/014_site_media_slot_usage_types.sql");
const recommendationMigration = read("supabase/migrations/015_default_template_recommendations.sql");

assert(shared.includes("auto-fit"), "Renderer sections should use intrinsic auto-fit grids.");
assert(!shared.includes("break-all"), "Renderer text must not use break-all.");
assert(!shared.includes("md:grid-cols-2") && !shared.includes("lg:grid-cols"), "Renderer sections should not rely on viewport-only column breakpoints.");
assert(!previewShell.includes("transform-gpu"), "Full preview shell should not transform-scale the template.");
assert(!setupPreview.includes("transform-gpu"), "Setup preview shell should not transform-scale the template.");
assert(setupPreview.includes("loadEditorContext") && setupPreview.includes("applyEditorMerges"), "Setup preview should merge uploaded site media after template selection.");
assert(setupPreview.includes("Explore the pages"), "Template detail page should include the page gallery.");
assert(setupPreview.includes("Homepage sections included"), "Template detail page should include the section showcase.");
assert(setupPreview.includes("Try the live preview"), "Template detail page should keep the live renderer available.");
assert(setupPreview.includes("Open Full Live Preview"), "Template detail page should expose full live preview actions.");
assert(templatesPage.includes("Explore other designs"), "Template library heading should say Explore other designs.");
assert(templatesPage.includes("Mobile-ready"), "Template marketplace card should show mobile responsive badge.");
assert(templatesPage.includes("Recommended for you"), "Template library should badge the recommended template.");
assert(setupActions.includes("getRecommendedTemplateForCategory"), "Category selection should auto-load a recommended template.");
assert(setupActions.includes("template_selected"), "Category selection should route to website-ready state when a recommendation exists.");
assert(completePage.includes("Your website is ready"), "Completion page should be a website-ready preview.");
assert(completePage.includes("Publish Website"), "Completion page should lead with publish CTA.");
assert(completePage.includes("Mobile Preview"), "Completion page should default to mobile preview.");
assert(completePage.includes("Explore Other Designs"), "Completion page should keep template browsing optional.");
assert(setupProgress.includes("Business Basics") && setupProgress.includes("Website Ready"), "Setup progress should use customer-facing labels.");
assert(newWebsitePage.includes("MobileOnboardingWizard"), "Create website page should render MobileOnboardingWizard.");
assert(newWebsiteWizard.includes("Tell us about your business"), "Create website page wizard should use business-basics copy.");
assert(newWebsiteForm.includes("suggestedSlug"), "Create website form should suggest slug from business name.");
assert(recommendationMigration.includes("default_template_id"), "Default template recommendation migration should add mapping columns.");
assert(websiteCardState.includes("getWebsiteCardState"), "Dashboard website cards should use a derived status helper.");
[
  "setup_incomplete",
  "design_required",
  "ready_to_review",
  "ready_to_publish",
  "published_synced",
  "published_with_changes",
  "unpublished",
  "suspended"
].forEach((state) => assert(websiteCardState.includes(state), `Website card helper missing ${state}.`));
assert(dashboardWebsites.includes("Prepare Recommended Design"), "Legacy category-only sites should recover by preparing a recommended design.");
assert(websiteCardState.includes("Publish Updates"), "Published changed sites should use Publish Updates copy.");
assert(!dashboardWebsites.includes("Republish"), "Dashboard cards should not expose Republish as always-visible customer copy.");
assert(!dashboardWebsites.includes("Change Template"), "Dashboard cards should use Change Design, not Change Template.");
assert(publicLoader.includes("refreshSignedMediaUrls"), "Published preview should refresh signed URLs from snapshot storage paths.");

[
  "service:ac-maintenance",
  "service:electrical",
  "service:plumbing",
  "service:painting",
  "service:interior-repairs",
  "service:preventive-maintenance",
  "gallery:project-01",
  "gallery:project-02",
  "gallery:project-03",
  "gallery:project-04"
].forEach((slot) => {
  assert(slots.includes(slot), `Media slot helper missing ${slot}.`);
  assert(migration.includes(`'${slot}'`), `Migration missing ${slot}.`);
});

[
  "public/templates/technical-services-modern/hero.webp",
  "public/templates/technical-services-modern/about.webp",
  "public/templates/technical-services-modern/services/ac-maintenance.webp",
  "public/templates/technical-services-modern/services/electrical.webp",
  "public/templates/technical-services-modern/services/plumbing.webp",
  "public/templates/technical-services-modern/services/painting.webp",
  "public/templates/technical-services-modern/services/interior-repairs.webp",
  "public/templates/technical-services-modern/services/preventive-maintenance.webp",
  "public/templates/technical-services-modern/projects/project-01.webp",
  "public/templates/technical-services-modern/projects/project-02.webp",
  "public/templates/technical-services-modern/projects/project-03.webp",
  "public/templates/technical-services-modern/projects/project-04.webp"
  ,"public/templates/technical-services-modern/cover.webp"
  ,"public/templates/technical-services-modern/page-home.webp"
  ,"public/templates/technical-services-modern/page-about.webp"
  ,"public/templates/technical-services-modern/page-services.webp"
  ,"public/templates/technical-services-modern/page-projects.webp"
  ,"public/templates/technical-services-modern/page-contact.webp"
  ,"public/templates/technical-services-modern/section-hero.webp"
  ,"public/templates/technical-services-modern/section-services.webp"
  ,"public/templates/technical-services-modern/section-projects.webp"
  ,"public/templates/technical-services-modern/section-contact.webp"
  ,"public/templates/technical-services-modern/section-footer.webp"
].forEach((asset) => {
  assert(fs.existsSync(path.join(root, asset)), `Missing fallback asset: ${asset}`);
});

console.log("Template renderer smoke passed.");
