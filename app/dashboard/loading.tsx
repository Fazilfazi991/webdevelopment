import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="grid gap-6">
      <div className="h-28 animate-pulse rounded-app border border-line bg-white" />
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="h-28 animate-pulse" />
        <Card className="h-28 animate-pulse" />
        <Card className="h-28 animate-pulse" />
      </section>
      <Card className="h-64 animate-pulse" />
    </div>
  );
}
