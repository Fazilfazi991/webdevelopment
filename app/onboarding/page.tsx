import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/data";
import { SimpleOrgForm } from "@/app/onboarding/simple-org-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({ searchParams }: { searchParams: { error?: string } }) {
  const { supabase, user } = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { data: memberships } = await supabase
    .from("organization_members")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  if (memberships?.length) redirect("/dashboard");

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-white px-4 py-8">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-700 text-3xl shadow-soft">
            🌐
          </div>
          <h1 className="text-2xl font-bold text-ink">Create your business website</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted">
            From your phone in five minutes. No designers, no technical knowledge needed.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <SimpleOrgForm error={searchParams.error} />
        </div>

        {/* Agency link */}
        <p className="mt-6 text-center text-sm text-muted">
          Building websites for clients?{" "}
          <Link href="/onboarding/agency" className="font-semibold text-brand-700 underline">
            Agency setup →
          </Link>
        </p>
      </div>
    </main>
  );
}
