import { redirect } from "next/navigation";
import { createOrganizationAction } from "@/app/actions";
import { StatusMessage } from "@/app/auth/status-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, inputClassName } from "@/components/ui/field";
import { countries, currencies, timezones } from "@/lib/constants";
import { getCurrentUser } from "@/lib/data";

export default async function OnboardingPage({ searchParams }: { searchParams: { error?: string } }) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return (
    <main className="min-h-screen bg-canvas px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">Business setup</p>
        <h1 className="mt-3 text-3xl font-bold text-ink">Create your organisation</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
          These settings prepare your workspace for local currency, language, phone formats, and publishing rules.
        </p>
        <Card className="mt-7 p-6">
          <form action={createOrganizationAction} className="grid gap-4">
            <StatusMessage error={searchParams.error} />
            <Field label="Organisation name">
              <input className={inputClassName} name="name" placeholder="Example Technical Services" required />
            </Field>
            <Field label="Organisation slug">
              <input className={inputClassName} name="slug" placeholder="example-technical-services" required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Country">
                <select className={inputClassName} name="countryCode" defaultValue="IN">
                  {countries.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Currency">
                <select className={inputClassName} name="defaultCurrency" defaultValue="INR">
                  {currencies.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Timezone">
                <select className={inputClassName} name="timezone" defaultValue="Asia/Kolkata">
                  {timezones.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Button type="submit" className="mt-2">
              Continue to dashboard
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
