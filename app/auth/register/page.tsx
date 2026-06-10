import Link from "next/link";
import { registerAction } from "@/app/auth/actions";
import { AuthShell } from "@/app/auth/auth-shell";
import { StatusMessage } from "@/app/auth/status-message";
import { Button } from "@/components/ui/button";
import { Field, inputClassName } from "@/components/ui/field";
import { countries, languages } from "@/lib/constants";

export default function RegisterPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <AuthShell title="Create account" description="Start with your profile. Organisation setup comes next.">
      <form action={registerAction} className="grid gap-4">
        <StatusMessage error={searchParams.error} />
        <Field label="Full name">
          <input className={inputClassName} name="fullName" autoComplete="name" required />
        </Field>
        <Field label="Email address">
          <input className={inputClassName} name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Password">
          <input className={inputClassName} name="password" type="password" autoComplete="new-password" required minLength={8} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Country">
            <select className={inputClassName} name="countryCode" defaultValue="IN">
              {countries.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Preferred language">
            <select className={inputClassName} name="preferredLanguage" defaultValue="en">
              {languages.map((language) => (
                <option key={language.value} value={language.value}>
                  {language.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Button type="submit">Create account</Button>
      </form>
      <p className="mt-5 text-sm text-muted">
        Already registered?{" "}
        <Link className="font-semibold text-brand-700" href="/auth/login">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
