import { Card } from "@/components/ui/card";

export default function WebsitesLoading() {
  return (
    <div className="grid gap-5">
      <div className="h-16 animate-pulse rounded-app bg-white" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="h-80 animate-pulse" />
        <Card className="h-80 animate-pulse" />
        <Card className="h-80 animate-pulse" />
      </div>
    </div>
  );
}
