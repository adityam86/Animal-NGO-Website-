import path from "path";
import fs from "fs/promises";
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
  const safeBase = originalFilename
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 40) || "image";
  const uniqueName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeBase}.${validated.extension}`;

  // 1. Prefer persistent Vercel Blob storage when configured
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    const uploadUrl = `https://blob.vercel-storage.com/ayudar/${uniqueName}`;
    const bodyBuffer = new ArrayBuffer(buffer.byteLength);
    new Uint8Array(bodyBuffer).set(buffer);
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${blobToken}`,
        "x-content-type": validated.mimeType,
        "x-add-random-suffix": "1",
      },
      body: bodyBuffer,
    });

    if (!res.ok) {
      throw new Error(`Object storage upload failed with status ${res.status}`);
    }
    const payload = (await res.json()) as { url?: string };
    if (!payload.url) {
      throw new Error("Object storage did not return a public URL");
    }
    return { url: payload.url, storage: "vercel-blob" };
  }

  // 2. Local filesystem storage when writable (development)
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

  // 3. Fallback data URL on serverless without BLOB_READ_WRITE_TOKEN (capped at 2 MB)
  if (buffer.byteLength > 2 * 1024 * 1024) {
    throw new Error(
      "Persistent object storage (BLOB_READ_WRITE_TOKEN) is not configured and image exceeds 2 MB fallback limit."
    );
  }
  const dataUrl = `data:${validated.mimeType};base64,${buffer.toString("base64")}`;
  return { url: dataUrl, storage: "inline-data-url" };
}
