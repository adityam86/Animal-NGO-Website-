import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ayudarindia.com";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/rescue",
    "/rescue/track",
    "/rescue/map",
    "/animals",
    "/adoption",
    "/cow-care",
    "/shelter",
    "/stories",
    "/gallery",
    "/drives",
    "/sponsor",
    "/donate",
    "/verify-receipt",
    "/volunteer",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/refund-policy",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" || route === "/animals" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/rescue" || route === "/donate" ? 0.9 : 0.8,
  }));

  try {
    const [animals, stories] = await Promise.all([
      prisma.animal.findMany({ select: { id: true, updatedAt: true }, take: 200 }),
      prisma.story.findMany({ select: { slug: true, updatedAt: true }, take: 100 }),
    ]);

    const animalEntries: MetadataRoute.Sitemap = animals.map((a) => ({
      url: `${baseUrl}/animals/${a.id}`,
      lastModified: a.updatedAt,
      changeFrequency: "weekly",
      priority: 0.75,
    }));

    const storyEntries: MetadataRoute.Sitemap = stories.map((s) => ({
      url: `${baseUrl}/stories/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...animalEntries, ...storyEntries];
  } catch {
    return staticRoutes;
  }
}
