import { resetPasswordAction } from "@/app/auth/actions";
import { AuthShell } from "@/app/auth/auth-shell";
import { StatusMessage } from "@/app/auth/status-message";
import { Button } from "@/components/ui/button";
import { Field, inputClassName } from "@/components/ui/field";

export default function ResetPasswordPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <AuthShell title="Choose new password" description="Use at least eight characters.">
      <form action={resetPasswordAction} className="grid gap-4">
        <StatusMessage error={searchParams.error} />
        <Field label="New password">
          <input className={inputClassName} name="password" type="password" autoComplete="new-password" required minLength={8} />
        </Field>
        <Button type="submit">Update password</Button>
      </form>
    </AuthShell>
  );
}
