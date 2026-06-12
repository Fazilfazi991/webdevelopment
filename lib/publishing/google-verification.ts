export function parseGoogleVerificationTag(value: string) {
  const input = value.trim();
  const match = input.match(/<meta\s+[^>]*name=["']google-site-verification["'][^>]*content=["']([A-Za-z0-9_-]+)["'][^>]*>/i)
    ?? input.match(/<meta\s+[^>]*content=["']([A-Za-z0-9_-]+)["'][^>]*name=["']google-site-verification["'][^>]*>/i);
  return match?.[1] ?? null;
}
