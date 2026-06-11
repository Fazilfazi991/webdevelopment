const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const envPath = path.join(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join("=").trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const testEmail = `recovery-test-${Date.now()}@gmail.com`;
const testPassword = "test-password-123456";

async function runTest() {
  console.log("1. Signing up user:", testEmail);
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: "Recovery Test User",
        country_code: "AE",
        preferred_language: "en"
      }
    }
  });

  if (signUpError) {
    console.error("SignUp failed:", signUpError);
    return;
  }

  const user = authData.user;
  console.log("SignUp success. User ID:", user.id);

  // Authenticate the client as this user
  console.log("2. Signing in...");
  const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });

  if (signInError) {
    console.error("SignIn failed:", signInError);
    return;
  }

  // Use the authenticated supabase client for subsequent queries
  const authSupabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  await authSupabase.auth.setSession(sessionData.session);

  console.log("3. Creating organization...");
  const orgId = crypto.randomUUID();
  const orgSlug = `test-org-${Date.now()}`;
  const { error: orgError } = await authSupabase.from("organizations").insert({
    id: orgId,
    name: "Test Recovery Org",
    slug: orgSlug,
    country_code: "AE",
    default_currency: "AED",
    timezone: "Asia/Dubai",
    created_by: user.id
  });

  if (orgError) {
    console.error("Failed to create organization:", orgError);
    return;
  }
  console.log("Organization created successfully:", orgId);

  console.log("4. Creating organization member...");
  const { error: memberError } = await authSupabase.from("organization_members").insert({
    organization_id: orgId,
    user_id: user.id,
    role: "owner"
  });

  if (memberError) {
    console.error("Failed to create organization member:", memberError);
    return;
  }
  console.log("Member created successfully.");

  console.log("5. Creating website...");
  const siteId = crypto.randomUUID();
  const siteSlug = `test-site-${Date.now()}`;
  const { error: siteError } = await authSupabase.from("sites").insert({
    id: siteId,
    organization_id: orgId,
    name: "Test Recovery Site",
    slug: siteSlug,
    website_type: "business_website",
    status: "draft",
    country_code: "AE",
    default_language: "en",
    setup_step: "industry",
    created_by: user.id
  });

  if (siteError) {
    console.error("Failed to create website:", siteError);
    return;
  }
  console.log("Website created successfully:", siteId);

  console.log("6. Creating business profile...");
  const { error: profileError } = await authSupabase.from("site_business_profiles").insert({
    site_id: siteId,
    company_name: "Test Recovery Site"
  });

  if (profileError) {
    console.error("Failed to create business profile:", profileError);
    return;
  }
  console.log("Business profile created successfully.");

  // Test 1: Media Page website list and media query
  console.log("\n--- TEST 1: Media Library Loader ---");
  try {
    const { data: profile, error: pError } = await authSupabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    const { data: memberships, error: mError } = await authSupabase
      .from("organization_members")
      .select("organization_id, role, organizations(*)")
      .eq("user_id", user.id);
    
    console.log("Profile error:", pError);
    console.log("Memberships loaded:", memberships?.length, "Error:", mError);

    const membership = memberships?.[0];
    const organization = membership?.organizations;

    const { data: sites, error: sitesError } = await authSupabase
      .from("sites")
      .select("*")
      .eq("organization_id", organization.id);
    
    console.log("Sites loaded:", sites?.length, "Error:", sitesError);

    const { data: mediaRows, error: mediaError } = await authSupabase
      .from("site_media")
      .select("*")
      .eq("organization_id", organization.id);
    
    console.log("Media rows loaded:", mediaRows?.length, "Error:", mediaError);
  } catch (err) {
    console.error("Exception in Media Library test:", err);
  }

  // Test 2: Editor Context Loader
  console.log("\n--- TEST 2: Editor Context Loader ---");
  try {
    const { data: selection, error: selError } = await authSupabase
      .from("site_template_selections")
      .select("*")
      .eq("site_id", siteId)
      .maybeSingle();
    console.log("Template selection loaded. Error:", selError, "Selection:", selection);

    const { data: bp, error: bpError } = await authSupabase
      .from("site_business_profiles")
      .select("*")
      .eq("site_id", siteId)
      .maybeSingle();
    console.log("Business profile loaded. Error:", bpError);

    const { data: overrides, error: oError } = await authSupabase
      .from("site_section_overrides")
      .select("*")
      .eq("site_id", siteId);
    console.log("Section overrides loaded. Error:", oError);

    const { data: theme, error: tError } = await authSupabase
      .from("site_theme_overrides")
      .select("*")
      .eq("site_id", siteId)
      .maybeSingle();
    console.log("Theme overrides loaded. Error:", tError);

    const { data: media, error: medError } = await authSupabase
      .from("site_media")
      .select("*")
      .eq("site_id", siteId);
    console.log("Site media loaded. Error:", medError);
  } catch (err) {
    console.error("Exception in Editor Context test:", err);
  }
}

runTest();
