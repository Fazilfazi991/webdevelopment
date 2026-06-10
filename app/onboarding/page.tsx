import { redirect } from "next/navigation";
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
          <OrganizationForm error={searchParams.error} />
        </Card>
      </div>
    </main>
  );
}
