export default function Loading() {
  return (
    <main className="min-h-screen bg-canvas px-4 py-8">
      <div className="mx-auto grid max-w-3xl gap-4">
        <div className="h-8 w-56 animate-pulse rounded-app bg-line" />
        <div className="h-32 animate-pulse rounded-app border border-line bg-white" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="h-24 animate-pulse rounded-app border border-line bg-white" />
          <div className="h-24 animate-pulse rounded-app border border-line bg-white" />
          <div className="h-24 animate-pulse rounded-app border border-line bg-white" />
        </div>
      </div>
    </main>
  );
}
