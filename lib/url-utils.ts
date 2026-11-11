/**
 * Normalizes destination URLs for error-free redirects and prevents security vulnerabilities (XSS, javascript:, data: URIs).
 * Automatically prepends https:// if missing, removes whitespace,
 * and ensures safe valid URL formats.
 */
export function normalizeRedirectUrl(url?: string | null): string {
  if (!url) return "";
  let trimmed = url.trim();
  if (!trimmed) return "";

  // Strict security check: reject dangerous protocols
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return "";
  }

  // Allow safe protocols
  if (
    lower.startsWith("tel:") ||
    lower.startsWith("mailto:") ||
    lower.startsWith("sms:")
  ) {
    return trimmed;
  }

  // If starts with // (protocol relative)
  if (trimmed.startsWith("//")) {
    trimmed = "https:" + trimmed;
  } else if (!/^https?:\/\//i.test(trimmed)) {
    // If user entered "instagram.com/user" or "wa.me/962..."
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    // Double check protocol is only http or https
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }
    return parsed.toString();
  } catch {
    return "";
  }
}

/**
 * Validates and sanitizes link URLs according to their icon type.
 */
export function sanitizeLinkUrl(url: string, iconType?: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  // Block dangerous schemes
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return "#";
  }

  if (iconType === "phone") {
    if (trimmed.startsWith("tel:")) return trimmed;
    const cleanPhone = trimmed.replace(/[^\d+]/g, "");
    return `tel:${cleanPhone}`;
  }

  if (iconType === "whatsapp") {
    if (lower.startsWith("https://wa.me/") || lower.startsWith("https://api.whatsapp.com/")) {
      return trimmed;
    }
    const cleanWa = trimmed.replace(/[^\d]/g, "");
    return `https://wa.me/${cleanWa}`;
  }

  if (iconType === "email") {
    if (lower.startsWith("mailto:")) return trimmed;
    return `mailto:${trimmed}`;
  }

  return normalizeRedirectUrl(trimmed) || "#";
}
