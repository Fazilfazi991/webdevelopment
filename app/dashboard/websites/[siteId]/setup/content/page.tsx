import { redirect } from "next/navigation";

export default async function ContentPlaceholderPage({ params }: { params: { siteId: string } }) {
  redirect(`/dashboard/websites/${params.siteId}/editor`);
}
