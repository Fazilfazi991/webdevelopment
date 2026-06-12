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
const schemaMock = {
  subdomainSchema: {
    safeParse(value) {
      const valid = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(value) && !constants.reservedSubdomains.has(value);
      return { success: valid };
    }
  }
};
const routing = loadTs("lib/publishing/host-routing.ts", { "@/lib/publishing/constants": constants, "@/lib/publishing/schemas": schemaMock });
assert(routing.resolveHostRequest({ host: "webdevelopment-virid.vercel.app", pathname: "/test" }).kind === "platform-path", "short platform path did not resolve");
assert(routing.resolveHostRequest({ host: "webdevelopment-virid.vercel.app", pathname: "/dashboard" }).kind === "internal", "reserved dashboard path was rewritten");
assert(routing.resolveHostRequest({ host: "webdevelopment-virid.vercel.app", pathname: "/admin" }).kind === "internal", "reserved admin path was rewritten");
assert(routing.resolveHostRequest({ host: "webdevelopment-virid.vercel.app", pathname: "/bad_slug" }).kind === "internal", "invalid slug path was rewritten");
assert(routing.resolveHostRequest({ host: "test.studioos.site", pathname: "/about" }).slug === "test", "wildcard platform host did not resolve");
assert(routing.resolveHostRequest({ host: "admin.studioos.site", pathname: "/" }).kind === "custom-domain", "reserved platform slug should not resolve as a tenant");
assert(routing.resolveHostRequest({ host: "www.example.com", pathname: "/" }).kind === "custom-domain", "custom domain did not resolve");

const google = loadTs("lib/publishing/google-verification.ts");
assert(google.parseGoogleVerificationTag('<meta name="google-site-verification" content="abc_123-X" />') === "abc_123-X", "Google tag parser failed");
assert(google.parseGoogleVerificationTag('<script>alert(1)</script>') === null, "Google tag parser accepted unsafe input");

const labels = loadTs("lib/site-editor/section-labels.ts");
assert(labels.customerSectionLabels["service-highlights-row"] === "Key Benefits", "key benefits label missing");
assert(labels.customerSectionLabels["why-choose-us-grid"] === "Why Choose Us", "why choose us label missing");
assert(labels.customerSectionLabels["contact-map-form"] === "Contact Form", "contact form label missing");

delete process.env.ENABLE_REMOTE_DOMAIN_PROVISIONING;
const providerModule = loadTs("lib/domains/provider.ts", { "server-only": {} });
const provider = providerModule.domainProvider();
provider.addDomain("www.example.com").then((state) => {
  assert(providerModule.domainProviderMode() === "mock", "domain adapter did not default to mock mode");
  assert(state.verificationStatus === "waiting_dns", "mock adapter should wait for DNS");
  assert(Array.isArray(state.dnsRecords) && state.dnsRecords.length > 0, "mock adapter did not return DNS records");
  const mediaSource = fs.readFileSync(path.join(root, "lib/site-editor/editor-loader.ts"), "utf8");
  assert(mediaSource.includes("showBusinessNameFallback"), "branding fallback is not wired into renderer data");
  const domainPage = fs.readFileSync(path.join(root, "app/dashboard/websites/[siteId]/domains/page.tsx"), "utf8");
  assert(!domainPage.includes("Remote provisioning stays in mock mode"), "customer-facing mock-mode copy remains");
  assert(domainPage.includes("Use Your Own Domain"), "custom-domain section missing");
  assert(domainPage.includes("Development URL"), "development URL section missing");
  const middleware = fs.readFileSync(path.join(root, "middleware.ts"), "utf8");
  assert(middleware.includes("NextResponse.redirect"), "primary-domain redirect is not implemented");
  const brandingError = fs.readFileSync(path.join(root, "app/dashboard/websites/[siteId]/settings/branding/error.tsx"), "utf8");
  assert(brandingError.includes("Branding could not load"), "branding friendly error route missing");
  console.log("PASS branding, domain routing, Google verification, labels, legacy fallback, mock provider, and address UI");
}).catch((error) => { console.error(error.message); process.exit(1); });
