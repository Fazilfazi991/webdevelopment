import { inviteTeamMemberAction } from "@/app/agency-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, inputClassName } from "@/components/ui/field";
import { requireAgencyContext } from "@/lib/access-control";
import type { AgencyMember } from "@/lib/types";

export default async function AgencyTeamPage({ searchParams }: { searchParams: { error?: string; message?: string } }) {
  const { supabase, agency } = await requireAgencyContext();
  const { data: members } = await supabase.from("agency_members").select("*").eq("agency_id", agency.id).returns<AgencyMember[]>();
  return (
    <div className="grid gap-6">
      <StatusMessage error={searchParams.error} message={searchParams.message} />
      <Card className="p-5">
        <h2 className="text-lg font-bold text-ink">Invite team member</h2>
        <form action={inviteTeamMemberAction} className="mt-4 grid gap-4 md:grid-cols-[1fr_220px_auto]">
          <Field label="Email"><input className={inputClassName} name="email" type="email" required /></Field>
          <Field label="Role"><select className={inputClassName} name="role"><option value="developer">Developer</option><option value="admin">Admin</option><option value="viewer">Viewer</option></select></Field>
          <Button type="submit" className="self-end">Prepare invite</Button>
        </form>
      </Card>
      <Card className="p-5">
        <h2 className="font-bold text-ink">Current team</h2>
        <div className="mt-4 grid gap-3">
          {members?.map((member) => <div key={member.id} className="rounded-app bg-canvas p-3 text-sm font-semibold text-ink">{member.user_id} - {member.role}</div>)}
        </div>
      </Card>
    </div>
  );
}
