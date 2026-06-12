export function sanitizeDeveloperCode(value: string) {
  const code = value.trim();
  if (!code) return "";
  if (/javascript:/i.test(code) || /\son\w+\s*=/i.test(code) || /<iframe/i.test(code)) throw new Error("Unsafe event handlers, javascript URLs, and iframes are not allowed.");
  const scripts = [...code.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  if (scripts.some((match) => !/\bsrc=["']https:\/\//i.test(match[1]) || match[2].trim())) throw new Error("Scripts must use an HTTPS src and cannot contain inline code.");
  return code;
}
