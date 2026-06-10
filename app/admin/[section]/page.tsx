import { EmptyState } from "@/components/ui/card";

export default function AdminPlaceholderPage({ params }: { params: { section: string } }) {
  const title = params.section
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return <EmptyState title={`${title} is planned`} description="This admin section is scaffolded for future management workflows." />;
}
