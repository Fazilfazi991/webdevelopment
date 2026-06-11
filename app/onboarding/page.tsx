import { redirect } from "next/navigation";
import Link from "next/link";
import { OrganizationForm } from "@/app/onboarding/organization-form";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/data";

export default async function OnboardingPage({ searchParams }: { searchParams: { error?: string } }) {
  const { supabase, user } = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { data: memberships } = await supabase.from("organization_members").select("id").eq("user_id", user.id).limit(1);
  if (memberships?.length) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-canvas px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">Business setup</p>
        <h1 className="mt-3 text-3xl font-bold text-ink">Create your organisation</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
          These settings prepare your workspace for local currency, language, phone formats, and publishing rules.
        </p>
        <Card className="mt-7 p-6">
          <div className="mb-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-app border border-brand-100 bg-brand-50 p-4">
              <p className="text-sm font-bold text-ink">Build a website for my business</p>
              <p className="mt-2 text-xs leading-5 text-muted">Continue with the standard self-service setup.</p>
            </div>
            <Link href="/onboarding/agency" className="rounded-app border border-line bg-white p-4 transition hover:border-brand-700">
              <p className="text-sm font-bold text-ink">Build websites for clients</p>
              <p className="mt-2 text-xs leading-5 text-muted">Create your workspace, clients, and handover flows.</p>
            </Link>
            <div className="rounded-app border border-dashed border-line bg-white p-4">
              <p className="text-sm font-bold text-ink">Let the platform team build it for me</p>
              <p className="mt-2 text-xs leading-5 text-muted">Concierge setup placeholder for a later phase.</p>
            </div>
          </div>
          <OrganizationForm error={searchParams.error} />
        </Card>
      </div>
    </main>
  );
}
