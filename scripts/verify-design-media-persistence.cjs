const fs = require("node:fs");
const path = require("node:path");

const actionPath = path.join(process.cwd(), "app", "design-actions.ts");
const source = fs.readFileSync(actionPath, "utf8");

const forbidden = [
  /from\(["']site_media["']\)/,
  /storage\.from\(["']site-media["']\).*remove/s
];

for (const pattern of forbidden) {
  if (pattern.test(source)) {
    throw new Error("Design switching must not update or remove uploaded site media.");
  }
}

if (!source.includes('from("site_template_selections")')) {
  throw new Error("Expected design switching to update the template selection.");
}

console.log("Design switching preserves site_media and only changes design/template selection.");
