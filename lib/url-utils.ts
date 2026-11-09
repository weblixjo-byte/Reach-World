/**
 * Normalizes destination URLs for error-free redirects.
 * Automatically prepends https:// if missing, removes whitespace,
 * and ensures safe valid URL formats.
 */
export function normalizeRedirectUrl(url?: string | null): string {
  if (!url) return "";
  let trimmed = url.trim();
  if (!trimmed) return "";

  // If starts with // (protocol relative)
  if (trimmed.startsWith("//")) {
    trimmed = "https:" + trimmed;
  } else if (!/^https?:\/\//i.test(trimmed)) {
    // If user entered "instagram.com/user" or "wa.me/962..."
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.toString();
  } catch {
    return trimmed;
  }
}
