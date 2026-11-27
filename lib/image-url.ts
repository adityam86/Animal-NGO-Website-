export function isSafeImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("/images/") || trimmed.startsWith("/uploads/")) {
    // Strip query and fragment before checking extension
    const pathOnly = trimmed.split("?")[0].split("#")[0];
    return !pathOnly.includes("..") && !pathOnly.toLowerCase().endsWith(".svg");
  }
  if (/^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) {
    return trimmed.length <= 3 * 1024 * 1024;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return false;
    // Block SVG via pathname regardless of query/fragment
    if (parsed.pathname.toLowerCase().endsWith(".svg")) return false;
    return parsed.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function shouldBypassImageOptimization(src: string | null | undefined): boolean {
  if (!src) return false;
  return src.startsWith("data:") || src.startsWith("blob:");
}
