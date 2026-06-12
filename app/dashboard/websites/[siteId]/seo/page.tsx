import { Search } from "lucide-react";
import { StatusMessage } from "@/app/auth/status-message";
import { saveGoogleVerificationAction } from "@/app/website-settings-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { inputClassName } from "@/components/ui/field";
import { requireSiteSetup } from "@/lib/setup";

export default async function WebsiteSearchSetupPage({ params, searchParams }: { params: { siteId: string }; searchParams: { message?: string; error?: string } }) {
  const setup = await requireSiteSetup(params.siteId);
  return <div className="mx-auto max-w-4xl space-y-6"><div><p className="text-xs font-bold uppercase tracking-widest text-brand-700">Search visibility</p><h1 className="mt-2 text-3xl font-bold text-ink">Google Search Setup</h1><p className="mt-2 text-sm text-muted">Verify ownership without adding arbitrary scripts to your website.</p></div><StatusMessage message={searchParams.message} error={searchParams.error} /><Card className="p-5"><div className="flex items-start gap-3"><Search className="mt-1 text-brand-700" /><div><h2 className="font-bold text-ink">Google verification tag</h2><p className="mt-1 text-sm text-muted">Paste the full meta tag from Google Search Console. Studio OS stores only the verification token.</p></div></div><form action={saveGoogleVerificationAction} className="mt-5 grid gap-4"><input type="hidden" name="siteId" value={setup.site.id} /><textarea className={inputClassName} name="googleVerificationTag" rows={4} placeholder={'<meta name="google-site-verification" content="..." />'} /><Button type="submit" className="w-full sm:w-auto">Save verification</Button></form>{setup.site.google_verification_token ? <p className="mt-4 text-sm font-semibold text-emerald-700">Verification token is configured.</p> : null}</Card><Card className="p-5"><h2 className="font-bold text-ink">Other verification methods</h2><p className="mt-2 text-sm text-muted">DNS verification and HTML verification files are prepared for a later provider-assisted flow.</p></Card></div>;
}
