import Link from "next/link";
import { acceptInvitationAction } from "@/app/agency-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/data";

export default async function InvitationPage({ params, searchParams }: { params: { token: string }; searchParams: { error?: string } }) {
  const { supabase, user } = await getCurrentUser();
  const { data: invitation } = user
    ? await supabase
        .from("client_invitations")
        .select("id, email, invitation_status, access_role, expires_at")
        .eq("invitation_token", params.token)
        .maybeSingle()
    : { data: null };

  if (!user) {
    return (
      <main className="min-h-screen bg-canvas px-4 py-10">
        <div className="mx-auto max-w-xl">
          <EmptyState
            title="Log in to accept this invitation"
            description="Use the invited email address, then return to this link to accept website access."
            action={<Link className="font-semibold text-brand-700" href={`/auth/login?next=/invitations/${params.token}`}>Log in</Link>}
          />
        </div>
      </main>
    );
  }

  const expired = invitation ? new Date(invitation.expires_at).getTime() < Date.now() : true;
  if (!invitation || invitation.invitation_status !== "pending" || expired) {
    return (
      <main className="min-h-screen bg-canvas px-4 py-10">
        <div className="mx-auto max-w-xl">
          <EmptyState title="This invitation is not available" description="It may have expired, been cancelled, or already accepted." />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas px-4 py-10">
      <div className="mx-auto max-w-xl">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-ink">Accept website access</h1>
          <p className="mt-2 text-sm leading-6 text-muted">This invitation grants {invitation.access_role.replaceAll("_", " ")} access to a client website.</p>
          <StatusMessage error={searchParams.error} />
          <form action={acceptInvitationAction} className="mt-5">
            <input type="hidden" name="token" value={params.token} />
            <Button type="submit">Accept invitation</Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
