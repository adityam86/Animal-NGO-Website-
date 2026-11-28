import Script from "next/script";

/**
 * Privacy-friendly analytics loader for Vercel deployments.
 * Renders only on hosted Vercel runtimes (process.env.VERCEL === "1")
 * so local previews stay free of 404 console errors.
 */
export default function VercelInsights() {
  if (process.env.VERCEL !== "1" && process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS !== "true") {
    return null;
  }

  return <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />;
}
