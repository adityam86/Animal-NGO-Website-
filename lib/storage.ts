import path from "path";
import fs from "fs/promises";
import { put } from "@vercel/blob";
import type { ValidatedImage } from "./security";

export interface StoredUploadResult {
  url: string;
  storage: "vercel-blob" | "local-fs" | "inline-data-url";
}

export async function storeValidatedImage(
  buffer: Buffer,
  validated: ValidatedImage,
  originalFilename: string,
  prefix = "media"
): Promise<StoredUploadResult> {
  const safeBase =
    originalFilename
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40) || "image";
  const uniqueName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeBase}.${validated.extension}`;

  // 1. Prefer official @vercel/blob SDK when configured (token stays strictly server-side)
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    const result = await put(`ayudar/${uniqueName}`, buffer, {
      access: "public",
      contentType: validated.mimeType,
      addRandomSuffix: true,
      token: blobToken,
    });

    if (!result?.url) {
      throw new Error("Vercel Blob storage did not return a public URL");
    }
    return { url: result.url, storage: "vercel-blob" };
  }

  // 2. Local filesystem storage when writable outside Vercel serverless runtime
  if (!process.env.VERCEL) {
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, uniqueName);
      await fs.writeFile(filePath, buffer);
      return { url: `/uploads/${uniqueName}`, storage: "local-fs" };
    } catch {
      // Fall through cleanly if disk is read-only
    }
  }

  // 3. Bounded inline raster data URL fallback when BLOB_READ_WRITE_TOKEN is unconfigured
  if (buffer.byteLength > 2 * 1024 * 1024) {
    throw new Error(
      "Persistent object storage (BLOB_READ_WRITE_TOKEN) is not configured and image exceeds 2 MB fallback limit."
    );
  }
  const dataUrl = `data:${validated.mimeType};base64,${buffer.toString("base64")}`;
  return { url: dataUrl, storage: "inline-data-url" };
}
