import Link from "next/link";
import { loginAction } from "@/app/auth/actions";
import { AuthShell } from "@/app/auth/auth-shell";
import { StatusMessage } from "@/app/auth/status-message";
import { Button } from "@/components/ui/button";
import { Field, inputClassName } from "@/components/ui/field";

export default function LoginPage({ searchParams }: { searchParams: { error?: string; message?: string } }) {
  return (
    <AuthShell title="Log in" description="Access your business website dashboard.">
      <form action={loginAction} className="grid gap-4">
        <StatusMessage error={searchParams.error} message={searchParams.message} />
        <Field label="Email address">
          <input className={inputClassName} name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Password">
          <input className={inputClassName} name="password" type="password" autoComplete="current-password" required />
        </Field>
        <Button type="submit">Log in</Button>
      </form>
      <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm text-muted">
        <Link className="font-semibold text-brand-700" href="/auth/register">
          Create account
        </Link>
        <Link className="font-semibold text-brand-700" href="/auth/forgot-password">
          Forgot password?
        </Link>
      </div>
    </AuthShell>
  );
}
