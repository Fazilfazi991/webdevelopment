const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
function loadTs(relativePath, mocks = {}) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  const module = { exports: {} };
  const localRequire = (id) => mocks[id] || require(id);
  new Function("module", "exports", "require", "process", code)(module, module.exports, localRequire, process);
  return module.exports;
}
function assert(condition, message) { if (!condition) throw new Error(message); }

const constants = loadTs("lib/publishing/constants.ts");
const routing = loadTs("lib/publishing/host-routing.ts", { "@/lib/publishing/constants": constants });
assert(routing.resolveHostRequest({ host: "webdevelopment-virid.vercel.app", pathname: "/test" }).kind === "platform-path", "short platform path did not resolve");
assert(routing.resolveHostRequest({ host: "webdevelopment-virid.vercel.app", pathname: "/dashboard" }).kind === "internal", "reserved dashboard path was rewritten");
assert(routing.resolveHostRequest({ host: "test.studioos.site", pathname: "/about" }).slug === "test", "wildcard platform host did not resolve");
assert(routing.resolveHostRequest({ host: "www.example.com", pathname: "/" }).kind === "custom-domain", "custom domain did not resolve");

const google = loadTs("lib/publishing/google-verification.ts");
assert(google.parseGoogleVerificationTag('<meta name="google-site-verification" content="abc_123-X" />') === "abc_123-X", "Google tag parser failed");
assert(google.parseGoogleVerificationTag('<script>alert(1)</script>') === null, "Google tag parser accepted unsafe input");

const labels = loadTs("lib/site-editor/section-labels.ts");
assert(labels.customerSectionLabels["service-highlights-row"] === "Key Benefits", "key benefits label missing");
assert(labels.customerSectionLabels["why-choose-us-grid"] === "Why Choose Us", "why choose us label missing");
assert(labels.customerSectionLabels["contact-map-form"] === "Contact Form", "contact form label missing");

delete process.env.ENABLE_REMOTE_DOMAIN_PROVISIONING;
const provider = loadTs("lib/domains/provider.ts").domainProvider();
provider.addDomain("www.example.com").then((state) => {
  assert(state.verificationStatus === "pending", "domain adapter did not default to mock mode");
  const mediaSource = fs.readFileSync(path.join(root, "lib/site-editor/editor-loader.ts"), "utf8");
  assert(mediaSource.includes("showBusinessNameFallback"), "branding fallback is not wired into renderer data");
  console.log("PASS branding, domain routing, Google verification, labels, legacy fallback, and mock provider");
}).catch((error) => { console.error(error.message); process.exit(1); });
