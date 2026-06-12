import { redirect } from "next/navigation";

export default function WebsiteSearchSetupPage({ params }: { params: { siteId: string } }) {
  redirect(`/dashboard/websites/${params.siteId}/editor/settings`);
}
