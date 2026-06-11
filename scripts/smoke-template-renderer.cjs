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
const publicLoader = read("lib/publishing/public-loader.ts");
const migration = read("supabase/migrations/014_site_media_slot_usage_types.sql");

assert(shared.includes("auto-fit"), "Renderer sections should use intrinsic auto-fit grids.");
assert(!shared.includes("break-all"), "Renderer text must not use break-all.");
assert(!shared.includes("md:grid-cols-2") && !shared.includes("lg:grid-cols"), "Renderer sections should not rely on viewport-only column breakpoints.");
assert(!previewShell.includes("transform-gpu"), "Full preview shell should not transform-scale the template.");
assert(!setupPreview.includes("transform-gpu"), "Setup preview shell should not transform-scale the template.");
assert(setupPreview.includes("loadEditorContext") && setupPreview.includes("applyEditorMerges"), "Setup preview should merge uploaded site media after template selection.");
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
].forEach((asset) => {
  assert(fs.existsSync(path.join(root, asset)), `Missing fallback asset: ${asset}`);
});

console.log("Template renderer smoke passed.");
