import { redirect } from "next/navigation";
import { createAgencyWorkspaceAction } from "@/app/agency-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, inputClassName } from "@/components/ui/field";
import { countries } from "@/lib/constants";
import { getCurrentUser } from "@/lib/data";

export default async function AgencyOnboardingPage({ searchParams }: { searchParams: { error?: string } }) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return (
    <main className="min-h-screen bg-canvas px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">Client work setup</p>
        <h1 className="mt-3 text-3xl font-bold text-ink">Create your workspace</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
          Use this for freelance, studio, or agency projects. You can add clients, create their websites, and hand over access later.
        </p>
        <Card className="mt-7 p-6">
          <form action={createAgencyWorkspaceAction} className="grid gap-4">
            <StatusMessage error={searchParams.error} />
            <Field label="Workspace name">
              <input className={inputClassName} name="name" placeholder="Zorx Studio" required />
            </Field>
            <Field label="Workspace slug">
              <input className={inputClassName} name="slug" placeholder="zorx-studio" required />
            </Field>
            <Field label="Country">
              <select className={inputClassName} name="countryCode" defaultValue="AE">
                {countries.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Website, optional">
              <input className={inputClassName} name="website" type="url" placeholder="https://example.com" />
            </Field>
            <Field label="Support email">
              <input className={inputClassName} name="supportEmail" type="email" placeholder="hello@example.com" />
            </Field>
            <Button type="submit">Create workspace</Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
