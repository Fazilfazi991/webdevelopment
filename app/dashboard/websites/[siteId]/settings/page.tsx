import { redirect } from "next/navigation";

export default function WebsiteSettingsPage({ params }: { params: { siteId: string } }) {
  redirect(`/dashboard/websites/${params.siteId}/editor/settings`);
}
