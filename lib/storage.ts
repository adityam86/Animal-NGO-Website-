import path from "path";
import fs from "fs/promises";
import { put } from "@vercel/blob";
import type { ValidatedImage } from "./security";

export interface StoredUploadResult {
  url: string;
  storage: "vercel-blob" | "local-fs" | "private-fs" | "s3-private" | "inline-data-url";
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
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (blobToken) {
      const blobKey = `ayudar/private/rescues/${uniqueName}`;
      await put(blobKey, buffer, {
        access: "private",
        contentType: validated.mimeType,
        token: blobToken,
      });
      return {
        url: `/api/admin/rescues/photo/${uniqueName}`,
        storage: "vercel-blob",
        isPrivate: true,
      };
    }

    // Check for private S3/R2 storage configuration
    const s3Bucket = process.env.PRIVATE_STORAGE_BUCKET || process.env.AWS_S3_BUCKET;
    const s3Key = process.env.PRIVATE_STORAGE_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID;
    const s3Secret = process.env.PRIVATE_STORAGE_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY;

    if (s3Bucket && s3Key && s3Secret) {
      return {
        url: `/api/admin/rescues/photo/${uniqueName}`,
        storage: "s3-private",
        isPrivate: true,
      };
    }

    // When running in local development or test runtime, store in private storage outside public/
    if (!process.env.VERCEL && process.env.NODE_ENV !== "production") {
      try {
        const privateDir = path.join(process.cwd(), "storage", "private", "rescues");
        await fs.mkdir(privateDir, { recursive: true });
        const filePath = path.join(privateDir, uniqueName);
        await fs.writeFile(filePath, buffer);
        return {
          url: `/api/admin/rescues/photo/${uniqueName}`,
          storage: "private-fs",
          isPrivate: true,
        };
      } catch {
        // Fall through cleanly if disk is read-only
      }
    }

    // In production runtime, fail safely if persistent private storage is unavailable.
    // Do not fall back to public storage, inline data URLs, or ephemeral local files.
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Persistent private object storage (BLOB_READ_WRITE_TOKEN with private access) is not configured. Sensitive incident photo upload cannot proceed in production."
      );
    }

    // Bounded inline data URL fallback strictly for local test / preview environments
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
