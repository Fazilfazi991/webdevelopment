export function StatusMessage({
  error,
  message
}: {
  error?: string;
  message?: string;
}) {
  if (!error && !message) return null;
  return (
    <div
      className={
        error
          ? "rounded-app border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800"
          : "rounded-app border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"
      }
    >
      {error ?? message}
    </div>
  );
}
