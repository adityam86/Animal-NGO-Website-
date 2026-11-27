import path from "path";
import fs from "fs/promises";
import { put } from "@vercel/blob";
import type { ValidatedImage } from "./security";

export interface StoredUploadResult {
  url: string;
  storage: "vercel-blob" | "local-fs" | "private-fs" | "inline-data-url";
  isPrivate?: boolean;
}

export interface StorageOptions {
  isPrivate?: boolean;
}

/**
 * Stores a sanitized, validated image buffer.
 * Automatically enforces private storage policies for sensitive rescue incident photos,
 * ensuring they cannot be accessed through public static web directories.
 */
export async function storeValidatedImage(
  buffer: Buffer,
  validated: ValidatedImage,
  originalFilename: string,
  prefix = "media",
  options: StorageOptions = {}
): Promise<StoredUploadResult> {
  const isPrivate = options.isPrivate ?? prefix === "rescue";

  const safeBase =
    originalFilename
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40) || "image";
  const uniqueName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeBase}.${validated.extension}`;

  // 1. Private storage policy (for rescue incident photos)
  if (isPrivate) {
    // When running in local development or node runtime, store outside public/
    if (!process.env.VERCEL) {
      try {
        const privateDir = path.join(process.cwd(), "storage", "private", "rescues");
        await fs.mkdir(privateDir, { recursive: true });
        const filePath = path.join(privateDir, uniqueName);
        await fs.writeFile(filePath, buffer);
        // Expose via authenticated admin photo endpoint
        return {
          url: `/api/admin/rescues/photo/${uniqueName}`,
          storage: "private-fs",
          isPrivate: true,
        };
      } catch {
        // Fall through to blob / inline
      }
    }

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (blobToken) {
      const result = await put(`ayudar/private/rescues/${uniqueName}`, buffer, {
        access: "public",
        contentType: validated.mimeType,
        addRandomSuffix: true,
        token: blobToken,
      });

      if (!result?.url) {
        throw new Error("Vercel Blob private storage failed to return URL");
      }
      return { url: result.url, storage: "vercel-blob", isPrivate: true };
    }

    // Inline fallback for offline development
    if (buffer.byteLength > 2 * 1024 * 1024) {
      throw new Error(
        "Persistent object storage (BLOB_READ_WRITE_TOKEN) is not configured and image exceeds 2 MB fallback limit."
      );
    }
    const dataUrl = `data:${validated.mimeType};base64,${buffer.toString("base64")}`;
    return { url: dataUrl, storage: "inline-data-url", isPrivate: true };
  }

  // 2. Public storage policy (for admin blog stories, animal galleries)
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
    return { url: result.url, storage: "vercel-blob", isPrivate: false };
  }

  if (!process.env.VERCEL) {
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, uniqueName);
      await fs.writeFile(filePath, buffer);
      return { url: `/uploads/${uniqueName}`, storage: "local-fs", isPrivate: false };
    } catch {
      // Fall through cleanly if disk is read-only
    }
  }

  if (buffer.byteLength > 2 * 1024 * 1024) {
    throw new Error(
      "Persistent object storage (BLOB_READ_WRITE_TOKEN) is not configured and image exceeds 2 MB fallback limit."
    );
  }
  const dataUrl = `data:${validated.mimeType};base64,${buffer.toString("base64")}`;
  return { url: dataUrl, storage: "inline-data-url", isPrivate: false };
}
