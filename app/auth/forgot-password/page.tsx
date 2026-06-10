import Link from "next/link";
import { forgotPasswordAction } from "@/app/auth/actions";
import { AuthShell } from "@/app/auth/auth-shell";
import { StatusMessage } from "@/app/auth/status-message";
import { Button } from "@/components/ui/button";
import { Field, inputClassName } from "@/components/ui/field";

export default function ForgotPasswordPage({ searchParams }: { searchParams: { error?: string; message?: string } }) {
  return (
    <AuthShell title="Reset password" description="Send reset instructions to your account email.">
      <form action={forgotPasswordAction} className="grid gap-4">
        <StatusMessage error={searchParams.error} message={searchParams.message} />
        <Field label="Email address">
          <input className={inputClassName} name="email" type="email" autoComplete="email" required />
        </Field>
        <Button type="submit">Send reset link</Button>
      </form>
      <Link className="mt-5 inline-flex text-sm font-semibold text-brand-700" href="/auth/login">
        Back to login
      </Link>
    </AuthShell>
  );
}
