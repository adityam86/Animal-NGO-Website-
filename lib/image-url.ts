const NEON_STORAGE_HOST_RE = /^[a-z0-9-]+\.storage\.[a-z0-9.-]+\.aws\.neon\.tech$/i;

export function isSafeImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true;
  if (
    trimmed.startsWith("/images/") ||
    trimmed.startsWith("/uploads/") ||
    trimmed.startsWith("/api/admin/rescues/photo/")
  ) {
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
    // Block SVG and path traversal via pathname regardless of query/fragment
    if (parsed.pathname.includes("..") || parsed.pathname.toLowerCase().endsWith(".svg")) {
      return false;
    }
    if (parsed.hostname.endsWith(".public.blob.vercel-storage.com")) {
      return true;
    }
    if (NEON_STORAGE_HOST_RE.test(parsed.hostname)) {
      // Allow public Neon Object Storage assets bucket, never private rescues bucket directly
      return !parsed.pathname.startsWith("/rescues/");
    }
    return false;
  } catch {
    return false;
  }
}

export function shouldBypassImageOptimization(src: string | null | undefined): boolean {
  if (!src) return false;
  return src.startsWith("data:") || src.startsWith("blob:");
}
