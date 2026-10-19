/**
 * Converts text to a clean URL slug.
 * Supports both English and Arabic characters.
 * Replaces spaces and underscores with '-', collapses consecutive dashes,
 * and strips leading/trailing dashes.
 * Pure helper - safe to import in client components and server actions.
 */
export function formatSlug(text: string): string {
  if (!text) return "";

  return text
    .toString()
    .trim()
    .toLowerCase()
    // Replace spaces, underscores and typical punctuation with dashes
    .replace(/[\s_+]+/g, "-")
    // Keep English, Arabic characters (\u0600-\u06FF), numbers, and hyphens
    .replace(/[^\w\u0600-\u06FF-]+/g, "")
    // Collapse consecutive hyphens
    .replace(/-+/g, "-")
    // Strip leading and trailing hyphens
    .replace(/^-+|-+$/g, "");
}
