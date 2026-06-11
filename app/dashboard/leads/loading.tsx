import { Card } from "@/components/ui/card";

export default function LeadsLoading() {
  return (
    <div className="grid gap-5">
      <div className="h-16 animate-pulse rounded-app bg-white" />
      <Card className="h-20 animate-pulse" />
      <Card className="h-44 animate-pulse" />
      <Card className="h-44 animate-pulse" />
    </div>
  );
}
